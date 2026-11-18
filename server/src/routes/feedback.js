import express from 'express';
import crypto from 'crypto';
import db from '../data/db.js';
import { filterContent } from '../services/moderationService.js';
import { analyzeSentiment } from '../services/sentimentService.js';

const router = express.Router();

/**
 * GET /api/feedback/verify/:token
 * Validates single-use link token and checks expiration
 */
router.get('/verify/:token', (req, res) => {
  const { token } = req.params;

  try {
    const tokenRecord = db.prepare(`
      SELECT 
        ft.*,
        cv.patient_name, cv.family_name, cv.care_type, cv.visit_date,
        n.name as nurse_name, n.specialty as nurse_specialty, n.avatar_url as nurse_avatar, n.city as nurse_city
      FROM feedback_tokens ft
      JOIN care_visits cv ON ft.visit_id = cv.id
      JOIN nurses n ON ft.nurse_id = n.id
      WHERE ft.token = ?
    `).get(token);

    if (!tokenRecord) {
      return res.status(404).json({
        valid: false,
        error: 'invalid_token',
        message: 'The feedback link provided is invalid or does not exist.'
      });
    }

    // Check if token was already submitted
    if (tokenRecord.status === 'submitted') {
      return res.status(409).json({
        valid: false,
        status: 'submitted',
        submittedAt: tokenRecord.submitted_at,
        patientName: tokenRecord.patient_name,
        nurseName: tokenRecord.nurse_name,
        message: 'Feedback for this care visit has already been submitted. Each link works only once.'
      });
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    if (now > expiresAt || tokenRecord.status === 'expired') {
      return res.status(410).json({
        valid: false,
        status: 'expired',
        expiresAt: tokenRecord.expires_at,
        nurseName: tokenRecord.nurse_name,
        message: 'This feedback link has expired. For safety and timely records, links remain active for a limited time.'
      });
    }

    // Valid active token
    return res.json({
      valid: true,
      status: 'active',
      data: {
        token: tokenRecord.token,
        expiresAt: tokenRecord.expires_at,
        visit: {
          id: tokenRecord.visit_id,
          patientName: tokenRecord.patient_name,
          familyName: tokenRecord.family_name,
          careType: tokenRecord.care_type,
          visitDate: tokenRecord.visit_date
        },
        nurse: {
          id: tokenRecord.nurse_id,
          name: tokenRecord.nurse_name,
          specialty: tokenRecord.nurse_specialty,
          avatarUrl: tokenRecord.nurse_avatar,
          city: tokenRecord.nurse_city
        }
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ error: 'Internal server error validating feedback link.' });
  }
});

/**
 * POST /api/feedback/submit
 * Submits feedback, invalidates token (single-use), runs profanity filter and sentiment analysis
 */
router.post('/submit', (req, res) => {
  const {
    token,
    punctuality,
    careQuality,
    hygiene,
    behaviour,
    npsScore,
    comment
  } = req.body;

  // Validate mandatory fields
  const p = Number(punctuality);
  const q = Number(careQuality);
  const h = Number(hygiene);
  const b = Number(behaviour);
  const nps = Number(npsScore);

  if (!token) {
    return res.status(400).json({ error: 'Token is required.' });
  }

  if ([p, q, h, b].some(val => isNaN(val) || val < 1 || val > 5)) {
    return res.status(400).json({ error: 'All core ratings (Punctuality, Quality, Hygiene, Behaviour) must be between 1 and 5.' });
  }

  if (isNaN(nps) || nps < 0 || nps > 10) {
    return res.status(400).json({ error: 'Net Promoter Score must be between 0 and 10.' });
  }

  try {
    // Check token state inside database transaction
    const submitTransaction = db.transaction(() => {
      const tokenRecord = db.prepare('SELECT * FROM feedback_tokens WHERE token = ?').get(token);

      if (!tokenRecord) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      if (tokenRecord.status === 'submitted') {
        throw new Error('TOKEN_ALREADY_USED');
      }

      const now = new Date();
      if (now > new Date(tokenRecord.expires_at)) {
        throw new Error('TOKEN_EXPIRED');
      }

      // Calculate average rating
      const averageRating = Math.round(((p + q + h + b) / 4) * 10) / 10;

      // Run Content Moderation / Profanity filter
      const { sanitizedComment, hasProfanity } = filterContent(comment || '');

      // Run Sentiment Analysis
      const { sentiment } = analyzeSentiment(comment || '', averageRating);

      // Low score check: average <= 3.0 OR any single score <= 2 OR NPS <= 4
      const isLowScore = averageRating <= 3.0 || p <= 2 || q <= 2 || h <= 2 || b <= 2 || nps <= 4;
      const triageStatus = isLowScore ? 'pending' : 'resolved';
      const triageNotes = isLowScore ? 'Automated triage alert: low satisfaction flagged upon submission.' : null;

      const nowIso = now.toISOString();
      const feedbackId = crypto.randomUUID();

      // Invalidate token immediately (Single-Use Guarantee)
      db.prepare(`
        UPDATE feedback_tokens 
        SET status = 'submitted', submitted_at = ? 
        WHERE id = ?
      `).run(nowIso, tokenRecord.id);

      // Insert feedback
      db.prepare(`
        INSERT INTO feedbacks (
          id, token_id, visit_id, nurse_id,
          punctuality, care_quality, hygiene, behaviour,
          average_rating, nps_score, raw_comment, sanitized_comment,
          has_profanity, sentiment, triage_status, triage_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        feedbackId,
        tokenRecord.id,
        tokenRecord.visit_id,
        tokenRecord.nurse_id,
        p, q, h, b,
        averageRating,
        nps,
        comment || '',
        sanitizedComment,
        hasProfanity ? 1 : 0,
        sentiment,
        triageStatus,
        triageNotes,
        nowIso
      );

      return {
        feedbackId,
        averageRating,
        isLowScore
      };
    });

    const result = submitTransaction();

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! It helps us ensure the highest standard of care.',
      data: result
    });
  } catch (error) {
    if (error.message === 'TOKEN_NOT_FOUND') {
      return res.status(404).json({ error: 'Feedback token not found.' });
    }
    if (error.message === 'TOKEN_ALREADY_USED') {
      return res.status(409).json({ error: 'This feedback link has already been used.' });
    }
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(410).json({ error: 'This feedback link has expired.' });
    }
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ error: 'Failed to record feedback. Please try again.' });
  }
});

export default router;
