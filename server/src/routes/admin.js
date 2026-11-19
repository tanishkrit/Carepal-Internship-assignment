import express from 'express';
import crypto from 'crypto';
import db from '../data/db.js';
import { generateWeeklyDigest } from '../services/emailDigestService.js';
import { runSeed } from '../data/seed.js';

const router = express.Router();

/**
 * GET /api/admin/triage
 * Low-score incident triage queue for Operations
 */
router.get('/triage', (req, res) => {
  try {
    const incidents = db.prepare(`
      SELECT 
        f.*,
        n.name as nurse_name, n.phone as nurse_phone, n.specialty as nurse_specialty, n.avatar_url as nurse_avatar,
        v.patient_name, v.family_name, v.care_type, v.visit_date
      FROM feedbacks f
      JOIN nurses n ON f.nurse_id = n.id
      JOIN care_visits v ON f.visit_id = v.id
      WHERE f.average_rating <= 3.0 OR f.punctuality <= 2 OR f.hygiene <= 2 OR f.nps_score <= 4 OR f.triage_status != 'resolved'
      ORDER BY 
        CASE WHEN f.triage_status = 'pending' THEN 1 
             WHEN f.triage_status = 'contacted' THEN 2 
             ELSE 3 END,
        f.created_at DESC
    `).all();

    return res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error('Error fetching triage queue:', error);
    return res.status(500).json({ error: 'Failed to fetch incident triage queue.' });
  }
});

/**
 * PATCH /api/admin/triage/:id
 * Updates triage resolution status and notes
 */
router.patch('/triage/:id', (req, res) => {
  const { id } = req.params;
  const { triageStatus, triageNotes } = req.body;

  if (!triageStatus || !['pending', 'contacted', 'resolved', 'dismissed'].includes(triageStatus)) {
    return res.status(400).json({ error: 'Valid triageStatus (pending, contacted, resolved, dismissed) is required.' });
  }

  try {
    const feedback = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback record not found.' });
    }

    db.prepare(`
      UPDATE feedbacks 
      SET triage_status = ?, triage_notes = COALESCE(?, triage_notes)
      WHERE id = ?
    `).run(triageStatus, triageNotes, id);

    return res.json({
      success: true,
      message: `Triage status updated to ${triageStatus}.`
    });
  } catch (error) {
    console.error('Error updating triage status:', error);
    return res.status(500).json({ error: 'Failed to update triage status.' });
  }
});

/**
 * GET /api/admin/export-csv
 * Exports all feedback data as CSV with sanitized or raw comments
 */
router.get('/export-csv', (req, res) => {
  try {
    const feedbacks = db.prepare(`
      SELECT 
        f.id as FeedbackID,
        f.created_at as DateSubmitted,
        n.name as NurseName,
        n.specialty as NurseSpecialty,
        n.city as City,
        v.patient_name as PatientName,
        v.family_name as FamilyName,
        v.care_type as CareType,
        v.visit_date as VisitDate,
        f.punctuality as Punctuality,
        f.care_quality as QualityOfCare,
        f.hygiene as Hygiene,
        f.behaviour as Behaviour,
        f.average_rating as OverallRating,
        f.nps_score as NPS,
        f.sentiment as Sentiment,
        f.has_profanity as HasProfanity,
        f.sanitized_comment as Comment,
        f.triage_status as TriageStatus,
        f.triage_notes as TriageNotes
      FROM feedbacks f
      JOIN nurses n ON f.nurse_id = n.id
      JOIN care_visits v ON f.visit_id = v.id
      ORDER BY f.created_at DESC
    `).all();

    if (feedbacks.length === 0) {
      return res.status(404).send('No feedback records found to export.');
    }

    const headers = Object.keys(feedbacks[0]);
    const csvRows = [headers.join(',')];

    for (const row of feedbacks) {
      const values = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""'); // Escape double quotes
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const filename = `TheCarePal_Feedback_Export_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

/**
 * POST /api/admin/tokens/generate
 * Generates a fresh unique single-use feedback token for demo and testing
 */
router.post('/tokens/generate', (req, res) => {
  const { nurseId, patientName, familyName, careType, expiryDays = 3 } = req.body;

  try {
    const nurse = nurseId 
      ? db.prepare('SELECT * FROM nurses WHERE id = ?').get(nurseId)
      : db.prepare('SELECT * FROM nurses ORDER BY RANDOM() LIMIT 1').get();

    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found.' });
    }

    const visitId = crypto.randomUUID();
    const tokenId = crypto.randomUUID();
    const token = 'tcp_' + crypto.randomBytes(8).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + Number(expiryDays) * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // Create a visit record
    db.prepare(`
      INSERT INTO care_visits (
        id, nurse_id, family_name, patient_name, care_type, visit_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)
    `).run(
      visitId,
      nurse.id,
      familyName || 'Kapoor Family',
      patientName || 'Mrs. Sarla Kapoor',
      careType || nurse.specialty,
      nowIso.slice(0, 10),
      nowIso
    );

    // Create token record
    db.prepare(`
      INSERT INTO feedback_tokens (
        id, token, visit_id, nurse_id, status, expires_at, created_at
      ) VALUES (?, ?, ?, ?, 'active', ?, ?)
    `).run(tokenId, token, visitId, nurse.id, expiresAt, nowIso);

    return res.status(201).json({
      success: true,
      message: 'Single-use feedback link generated successfully.',
      data: {
        token,
        feedbackUrl: `/feedback/${token}`,
        expiresAt,
        nurse: {
          id: nurse.id,
          name: nurse.name,
          specialty: nurse.specialty
        }
      }
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Failed to generate feedback token.' });
  }
});

/**
 * GET /api/admin/tokens
 * Lists tokens by status (active, expired, submitted) for easy demoing
 */
router.get('/tokens', (req, res) => {
  try {
    const tokens = db.prepare(`
      SELECT 
        ft.*,
        n.name as nurse_name, n.specialty as nurse_specialty,
        v.patient_name, v.family_name, v.care_type
      FROM feedback_tokens ft
      JOIN nurses n ON ft.nurse_id = n.id
      JOIN care_visits v ON ft.visit_id = v.id
      ORDER BY ft.created_at DESC
      LIMIT 20
    `).all();

    return res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Error listing tokens:', error);
    return res.status(500).json({ error: 'Failed to list tokens.' });
  }
});

/**
 * GET /api/admin/weekly-digest
 * Returns the weekly digest data and email HTML
 */
router.get('/weekly-digest', (req, res) => {
  try {
    const digest = generateWeeklyDigest();
    return res.json({
      success: true,
      data: digest
    });
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    return res.status(500).json({ error: 'Failed to generate weekly email digest.' });
  }
});

/**
 * POST /api/admin/reset-seed
 * Restores database to fresh demo baseline with 8 nurses and pre-seeded feedback
 */
router.post('/reset-seed', (req, res) => {
  try {
    runSeed();
    return res.json({
      success: true,
      message: 'Database reset and fresh demo data seeded successfully.'
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return res.status(500).json({ error: 'Failed to reset and re-seed database.' });
  }
});

export default router;
