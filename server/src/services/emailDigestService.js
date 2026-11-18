/**
 * Weekly Operations Summary Email Service
 * Compiles performance trends, caregiver leaderboards, and pending quality incidents.
 */

import db from '../data/db.js';

export function generateWeeklyDigest() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Weekly Overview Metrics
  const summaryStmt = db.prepare(`
    SELECT 
      COUNT(*) as totalReviews,
      ROUND(AVG(average_rating), 2) as avgRating,
      ROUND(AVG(punctuality), 2) as avgPunctuality,
      ROUND(AVG(care_quality), 2) as avgQuality,
      ROUND(AVG(hygiene), 2) as avgHygiene,
      ROUND(AVG(behaviour), 2) as avgBehaviour,
      SUM(CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END) as promoters,
      SUM(CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 ELSE 0 END) as passives,
      SUM(CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END) as detractors
    FROM feedbacks
    WHERE created_at >= ?
  `);
  const weeklyStats = summaryStmt.get(sevenDaysAgo) || {};

  const totalReviews = weeklyStats.totalReviews || 0;
  let nps = 0;
  if (totalReviews > 0) {
    const promoterPct = ((weeklyStats.promoters || 0) / totalReviews) * 100;
    const detractorPct = ((weeklyStats.detractors || 0) / totalReviews) * 100;
    nps = Math.round(promoterPct - detractorPct);
  }

  // 2. Top Performing Nurses of the Week
  const topNursesStmt = db.prepare(`
    SELECT 
      n.id, n.name, n.specialty, n.city,
      COUNT(f.id) as reviewCount,
      ROUND(AVG(f.average_rating), 2) as avgScore
    FROM nurses n
    JOIN feedbacks f ON n.id = f.nurse_id
    WHERE f.created_at >= ?
    GROUP BY n.id
    HAVING reviewCount >= 1
    ORDER BY avgScore DESC, reviewCount DESC
    LIMIT 3
  `);
  const topNurses = topNursesStmt.all(sevenDaysAgo);

  // 3. Low-Score Incidents Requiring Attention
  const lowScoresStmt = db.prepare(`
    SELECT 
      f.id, f.average_rating, f.sanitized_comment, f.triage_status, f.created_at,
      n.name as nurseName,
      v.patient_name as patientName, v.care_type as careType
    FROM feedbacks f
    JOIN nurses n ON f.nurse_id = n.id
    JOIN care_visits v ON f.visit_id = v.id
    WHERE f.created_at >= ? AND (f.average_rating <= 3.0 OR f.punctuality <= 2 OR f.hygiene <= 2)
    ORDER BY f.created_at DESC
  `);
  const lowScoreIncidents = lowScoresStmt.all(sevenDaysAgo);

  // 4. Generate HTML Email Template
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TheCarePal Weekly Quality Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { background: #ffffff; border-radius: 12px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f766e; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-box { background: #f0fdfa; border: 1px solid #ccfbf1; padding: 14px; border-radius: 8px; text-align: center; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0d9488; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 4px; }
    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 20px 0 10px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }
    .nurse-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .incident-box { background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>TheCarePal Operations Quality Digest</h1>
      <p>Weekly Summary for Operations & Clinical Supervisors</p>
    </div>
    <div class="content">
      <div class="kpi-grid">
        <div class="kpi-box">
          <div class="kpi-val">${weeklyStats.avgRating || '0.0'} / 5.0</div>
          <div class="kpi-label">Average Quality</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-val">${nps > 0 ? '+' : ''}${nps}</div>
          <div class="kpi-label">Net Promoter Score</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-val">${totalReviews}</div>
          <div class="kpi-label">Visits Evaluated</div>
        </div>
      </div>

      <div class="section-title">🌟 Top Performing Caregivers of the Week</div>
      ${topNurses.length > 0 ? topNurses.map(nurse => `
        <div class="nurse-row">
          <div><strong>${nurse.name}</strong> <span style="color:#64748b;">(${nurse.specialty} • ${nurse.city})</span></div>
          <div style="font-weight:700; color:#0d9488;">★ ${nurse.avgScore} <span style="font-size:11px; font-weight:normal; color:#64748b;">(${nurse.reviewCount} visits)</span></div>
        </div>
      `).join('') : '<p style="color:#64748b; font-size:13px;">No visits evaluated this week.</p>'}

      <div class="section-title">⚠️ Priority Incidents Requiring Triage (${lowScoreIncidents.length})</div>
      ${lowScoreIncidents.length > 0 ? lowScoreIncidents.map(inc => `
        <div class="incident-box">
          <div style="font-weight:700; color:#9f1239;">Nurse: ${inc.nurseName} • Patient: ${inc.patientName} (${inc.careType})</div>
          <div style="margin: 4px 0; color:#475569;">"${inc.sanitized_comment || 'No comment left'}"</div>
          <div style="font-size:11px; color:#be123c;">Score: ${inc.average_rating}/5.0 • Status: ${inc.triage_status.toUpperCase()}</div>
        </div>
      `).join('') : '<p style="color:#059669; font-size:13px;">✓ Zero low-score incidents this week. Excellent job!</p>'}
    </div>
    <div class="footer">
      Generated automatically by TheCarePal Quality Assurance System • Internal Confidential
    </div>
  </div>
</body>
</html>
  `;

  return {
    weeklyStats,
    nps,
    totalReviews,
    topNurses,
    lowScoreIncidents,
    emailHtml
  };
}

export default { generateWeeklyDigest };
