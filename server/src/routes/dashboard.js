import express from 'express';
import db from '../data/db.js';

const router = express.Router();

/**
 * GET /api/dashboard/metrics
 * Returns aggregate metrics for the executive care dashboard
 */
router.get('/metrics', (req, res) => {
  try {
    // 1. Overall stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalFeedbacks,
        ROUND(AVG(average_rating), 2) as overallRating,
        ROUND(AVG(punctuality), 2) as punctualityAvg,
        ROUND(AVG(care_quality), 2) as qualityAvg,
        ROUND(AVG(hygiene), 2) as hygieneAvg,
        ROUND(AVG(behaviour), 2) as behaviourAvg,
        SUM(CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END) as promoterCount,
        SUM(CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 ELSE 0 END) as passiveCount,
        SUM(CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END) as detractorCount
      FROM feedbacks
    `).get();

    const total = stats.totalFeedbacks || 0;
    let nps = 0;
    if (total > 0) {
      const pPct = (stats.promoterCount / total) * 100;
      const dPct = (stats.detractorCount / total) * 100;
      nps = Math.round(pPct - dPct);
    }

    // 2. Open low-score alert count
    const alerts = db.prepare(`
      SELECT COUNT(*) as count 
      FROM feedbacks 
      WHERE triage_status = 'pending' AND (average_rating <= 3.0 OR punctuality <= 2 OR hygiene <= 2)
    `).get();

    // 3. Rating distribution (1 to 5 stars)
    const ratingDist = db.prepare(`
      SELECT 
        ROUND(average_rating) as star,
        COUNT(*) as count
      FROM feedbacks
      GROUP BY ROUND(average_rating)
      ORDER BY star DESC
    `).all();

    // 4. Sentiment distribution
    const sentimentDist = db.prepare(`
      SELECT 
        sentiment,
        COUNT(*) as count
      FROM feedbacks
      GROUP BY sentiment
    `).all();

    return res.json({
      success: true,
      data: {
        totalFeedbacks: total,
        overallRating: stats.overallRating || 0,
        punctualityAvg: stats.punctualityAvg || 0,
        qualityAvg: stats.qualityAvg || 0,
        hygieneAvg: stats.hygieneAvg || 0,
        behaviourAvg: stats.behaviourAvg || 0,
        nps,
        promoterCount: stats.promoterCount || 0,
        passiveCount: stats.passiveCount || 0,
        detractorCount: stats.detractorCount || 0,
        lowScoreAlertsCount: alerts.count || 0,
        ratingDistribution: ratingDist,
        sentimentDistribution: sentimentDist
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return res.status(500).json({ error: 'Failed to compute dashboard metrics.' });
  }
});

/**
 * GET /api/dashboard/trends
 * Longitudinal ratings grouped by date for Recharts visualizations
 */
router.get('/trends', (req, res) => {
  try {
    // Group feedbacks by day (YYYY-MM-DD)
    const trends = db.prepare(`
      SELECT 
        substr(created_at, 1, 10) as date,
        ROUND(AVG(average_rating), 2) as avgRating,
        ROUND(AVG(punctuality), 2) as avgPunctuality,
        ROUND(AVG(care_quality), 2) as avgQuality,
        ROUND(AVG(hygiene), 2) as avgHygiene,
        ROUND(AVG(behaviour), 2) as avgBehaviour,
        COUNT(*) as count
      FROM feedbacks
      GROUP BY substr(created_at, 1, 10)
      ORDER BY date ASC
    `).all();

    return res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return res.status(500).json({ error: 'Failed to fetch trend data.' });
  }
});

/**
 * GET /api/dashboard/nurses
 * Nurse leaderboard and aggregate category scorecard
 */
router.get('/nurses', (req, res) => {
  try {
    const nurses = db.prepare(`
      SELECT 
        n.*,
        COUNT(f.id) as reviewCount,
        ROUND(AVG(f.average_rating), 2) as avgRating,
        ROUND(AVG(f.punctuality), 2) as avgPunctuality,
        ROUND(AVG(f.care_quality), 2) as avgQuality,
        ROUND(AVG(f.hygiene), 2) as avgHygiene,
        ROUND(AVG(f.behaviour), 2) as avgBehaviour,
        SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END) as positiveCount,
        SUM(CASE WHEN f.sentiment = 'negative' THEN 1 ELSE 0 END) as negativeCount
      FROM nurses n
      LEFT JOIN feedbacks f ON n.id = f.nurse_id
      GROUP BY n.id
      ORDER BY avgRating DESC, reviewCount DESC
    `).all();

    return res.json({
      success: true,
      data: nurses
    });
  } catch (error) {
    console.error('Error fetching nurses scorecard:', error);
    return res.status(500).json({ error: 'Failed to fetch nurse scorecards.' });
  }
});

/**
 * GET /api/dashboard/nurses/:id
 * Full caregiver performance dossier with historical reviews
 */
router.get('/nurses/:id', (req, res) => {
  const { id } = req.params;
  try {
    const nurse = db.prepare('SELECT * FROM nurses WHERE id = ?').get(id);
    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(f.id) as reviewCount,
        ROUND(AVG(f.average_rating), 2) as avgRating,
        ROUND(AVG(f.punctuality), 2) as avgPunctuality,
        ROUND(AVG(f.care_quality), 2) as avgQuality,
        ROUND(AVG(f.hygiene), 2) as avgHygiene,
        ROUND(AVG(f.behaviour), 2) as avgBehaviour,
        SUM(CASE WHEN f.nps_score >= 9 THEN 1 ELSE 0 END) as promoterCount,
        SUM(CASE WHEN f.nps_score <= 6 THEN 1 ELSE 0 END) as detractorCount,
        SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END) as positiveCount,
        SUM(CASE WHEN f.sentiment = 'negative' THEN 1 ELSE 0 END) as negativeCount
      FROM feedbacks f
      WHERE f.nurse_id = ?
    `).get(id);

    const reviews = db.prepare(`
      SELECT 
        f.*,
        v.patient_name, v.family_name, v.care_type, v.visit_date
      FROM feedbacks f
      JOIN care_visits v ON f.visit_id = v.id
      WHERE f.nurse_id = ?
      ORDER BY f.created_at DESC
    `).all(id);

    return res.json({
      success: true,
      data: {
        ...nurse,
        stats,
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching nurse dossier:', error);
    return res.status(500).json({ error: 'Failed to fetch nurse details.' });
  }
});

/**
 * GET /api/dashboard/feedbacks
 * Filterable feedback stream with profanity masking options
 */
router.get('/feedbacks', (req, res) => {
  const { nurseId, sentiment, minRating, maxRating, triageStatus, search } = req.query;

  try {
    let query = `
      SELECT 
        f.*,
        n.name as nurse_name, n.specialty as nurse_specialty, n.avatar_url as nurse_avatar,
        v.patient_name, v.family_name, v.care_type, v.visit_date
      FROM feedbacks f
      JOIN nurses n ON f.nurse_id = n.id
      JOIN care_visits v ON f.visit_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (nurseId) {
      query += ` AND f.nurse_id = ?`;
      params.push(nurseId);
    }
    if (sentiment) {
      query += ` AND f.sentiment = ?`;
      params.push(sentiment);
    }
    if (minRating) {
      query += ` AND f.average_rating >= ?`;
      params.push(Number(minRating));
    }
    if (maxRating) {
      query += ` AND f.average_rating <= ?`;
      params.push(Number(maxRating));
    }
    if (triageStatus) {
      query += ` AND f.triage_status = ?`;
      params.push(triageStatus);
    }
    if (search) {
      query += ` AND (n.name LIKE ? OR v.patient_name LIKE ? OR f.raw_comment LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY f.created_at DESC`;

    const feedbacks = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks list:', error);
    return res.status(500).json({ error: 'Failed to fetch feedback records.' });
  }
});

export default router;
