import crypto from 'crypto';
import db, { initSchema } from './db.js';
import { filterContent } from '../services/moderationService.js';
import { analyzeSentiment } from '../services/sentimentService.js';

export function runSeed() {
  console.log('🌱 Starting TheCarePal Database Seeding...');

  // Ensure tables exist
  initSchema();

  // Clear existing records to ensure fresh demo state
  db.exec(`
    DELETE FROM feedbacks;
    DELETE FROM feedback_tokens;
    DELETE FROM care_visits;
    DELETE FROM nurses;
  `);

  // 1. Seed Nurses
  const nursesData = [
    {
      id: 'nurse-1',
      name: 'Sunita Sharma',
      email: 'sunita.sharma@thecarepal.com',
      phone: '+91 98201 12345',
      specialty: 'Dementia & Alzheimer\'s Care',
      experience_years: 8,
      avatar_url: 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150&auto=format&fit=crop&q=80',
      city: 'Mumbai',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    },
    {
      id: 'nurse-2',
      name: 'Rajesh Nair',
      email: 'rajesh.nair@thecarepal.com',
      phone: '+91 98450 67890',
      specialty: 'Elderly Stroke Rehabilitation',
      experience_years: 6,
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      city: 'Bengaluru',
      created_at: new Date(Date.now() - 80 * 86400000).toISOString()
    },
    {
      id: 'nurse-3',
      name: 'Priya Das',
      email: 'priya.das@thecarepal.com',
      phone: '+91 98111 23456',
      specialty: 'Newborn & Baby Care',
      experience_years: 5,
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      city: 'Delhi NCR',
      created_at: new Date(Date.now() - 75 * 86400000).toISOString()
    },
    {
      id: 'nurse-4',
      name: 'Amit Patel',
      email: 'amit.patel@thecarepal.com',
      phone: '+91 98230 45678',
      specialty: 'Post-Surgical Recovery',
      experience_years: 7,
      avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      city: 'Pune',
      created_at: new Date(Date.now() - 70 * 86400000).toISOString()
    },
    {
      id: 'nurse-5',
      name: 'Kavita Reddy',
      email: 'kavita.reddy@thecarepal.com',
      phone: '+91 98490 89012',
      specialty: 'Palliative & Geriatric Care',
      experience_years: 9,
      avatar_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
      city: 'Hyderabad',
      created_at: new Date(Date.now() - 65 * 86400000).toISOString()
    },
    {
      id: 'nurse-6',
      name: 'Mohammed Irfan',
      email: 'irfan.m@thecarepal.com',
      phone: '+91 98205 78901',
      specialty: 'Daily Living & Mobility Support',
      experience_years: 4,
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
      city: 'Mumbai',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'nurse-7',
      name: 'Ananya Sen',
      email: 'ananya.sen@thecarepal.com',
      phone: '+91 98300 23456',
      specialty: 'Elderly Companion & Medication',
      experience_years: 5,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      city: 'Kolkata',
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 'nurse-8',
      name: 'Vikram Singh',
      email: 'vikram.singh@thecarepal.com',
      phone: '+91 98102 34567',
      specialty: 'Orthopedic & Post-Op Physical Care',
      experience_years: 6,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'Delhi NCR',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    }
  ];

  const insertNurse = db.prepare(`
    INSERT INTO nurses (id, name, email, phone, specialty, experience_years, avatar_url, city, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  nursesData.forEach(nurse => {
    insertNurse.run(
      nurse.id, nurse.name, nurse.email, nurse.phone,
      nurse.specialty, nurse.experience_years, nurse.avatar_url,
      nurse.city, nurse.created_at
    );
  });
  console.log(`✓ Seeded ${nursesData.length} Nurses.`);

  // 2. Realistic historical feedback profiles
  const sampleFeedbacks = [
    {
      nurseIdx: 0,
      daysAgo: 1,
      patientName: 'Mrs. Manju Kapoor',
      familyName: 'Kapoor Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Sunita ji was extraordinary with my mother. She handles my mother\'s Alzheimer episodes with unmatched patience and tenderness. We felt completely safe.'
    },
    {
      nurseIdx: 0,
      daysAgo: 3,
      patientName: 'Mr. Arvind Joshi',
      familyName: 'Joshi Family',
      p: 5, q: 5, h: 4, b: 5, nps: 9,
      comment: 'Very professional, arrived 5 minutes early, and kept detailed notes on blood pressure and sugar levels.'
    },
    {
      nurseIdx: 1,
      daysAgo: 2,
      patientName: 'Col. R.S. Verma (Retd.)',
      familyName: 'Verma Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Rajesh is the best physiotherapist/rehab caregiver we have encountered. Grandfather walked without assistance for the first time in 3 months!'
    },
    {
      nurseIdx: 1,
      daysAgo: 6,
      patientName: 'Mrs. Shanti Raman',
      familyName: 'Raman Family',
      p: 4, q: 5, h: 4, b: 5, nps: 9,
      comment: 'Diligent and respectful. Helped with limb exercises and post-stroke speech drills.'
    },
    {
      nurseIdx: 2,
      daysAgo: 2,
      patientName: 'Baby Aarav',
      familyName: 'Mehta Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Priya gave us tremendous peace of mind during our first week home from the hospital. Exceptional neonatal hygiene and gentle soothing techniques.'
    },
    {
      nurseIdx: 2,
      daysAgo: 5,
      patientName: 'Baby Siya',
      familyName: 'Gupta Family',
      p: 5, q: 4, h: 5, b: 4, nps: 8,
      comment: 'Knowledgeable caregiver, handled umbilical cord care very gently.'
    },
    {
      nurseIdx: 3,
      daysAgo: 1,
      patientName: 'Mr. Suresh Goel',
      familyName: 'Goel Family',
      p: 5, q: 5, h: 5, b: 5, nps: 9,
      comment: 'Post-op knee wound dressing was painless and meticulously sanitized. Amit clearly knows clinical standards.'
    },
    {
      nurseIdx: 4,
      daysAgo: 4,
      patientName: 'Mrs. Leela Swaminathan',
      familyName: 'Swaminathan Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Kavita treated my grandmother like her own mother. Blessed to have such compassionate care.'
    },
    {
      nurseIdx: 5,
      daysAgo: 7,
      patientName: 'Mr. Babulal Seth',
      familyName: 'Seth Family',
      p: 4, q: 4, h: 4, b: 4, nps: 8,
      comment: 'Punctual and helpful with wheelchair transfer and evening walks.'
    },
    // Realistic Incident / Low-Score Triage Items:
    {
      nurseIdx: 5,
      daysAgo: 2,
      patientName: 'Mr. Ramesh Aggarwal',
      familyName: 'Aggarwal Family',
      p: 2, q: 2, h: 3, b: 2, nps: 3,
      comment: 'The nurse arrived 45 minutes late without informing us in advance. My father was waiting for his morning medication, which caused significant anxiety.'
    },
    {
      nurseIdx: 3,
      daysAgo: 4,
      patientName: 'Mr. Tarun Bhatia',
      familyName: 'Bhatia Family',
      p: 3, q: 2, h: 2, b: 3, nps: 2,
      comment: 'Did not sanitize hands or wear fresh gloves before touching the surgical drain. This is careless and unacceptable for wound care.'
    },
    {
      nurseIdx: 7,
      daysAgo: 3,
      patientName: 'Mrs. Pushpa Devi',
      familyName: 'Chawla Family',
      p: 2, q: 2, h: 3, b: 1, nps: 1,
      comment: 'The caregiver was constantly on phone calls and spoke very rudely when asked to assist with the bathroom. Bloody careless attitude.'
    },
    {
      nurseIdx: 6,
      daysAgo: 8,
      patientName: 'Dr. K.P. Mukherjee',
      familyName: 'Mukherjee Family',
      p: 3, q: 3, h: 3, b: 3, nps: 6,
      comment: 'Average service. Adequate companion care, but lacked initiative in engaging the patient.'
    },
    {
      nurseIdx: 0,
      daysAgo: 10,
      patientName: 'Mrs. Sheila Advani',
      familyName: 'Advani Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Exceptional dementia support. Sunita knows exactly how to de-escalate anxiety and sundowning.'
    },
    {
      nurseIdx: 1,
      daysAgo: 12,
      patientName: 'Mr. G.N. Murthy',
      familyName: 'Murthy Family',
      p: 5, q: 4, h: 5, b: 5, nps: 9,
      comment: 'Very polite and dedicated. Followed doctor\'s mobility instructions strictly.'
    },
    {
      nurseIdx: 2,
      daysAgo: 14,
      patientName: 'Baby Kabir',
      familyName: 'Shah Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Priya is a godsend for new parents. We learned so much about burping and massage.'
    },
    {
      nurseIdx: 4,
      daysAgo: 15,
      patientName: 'Mrs. Janaki Rao',
      familyName: 'Rao Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Tremendous warmth, gentle bed sore prevention and timely medications.'
    },
    {
      nurseIdx: 7,
      daysAgo: 18,
      patientName: 'Mr. Harish Grover',
      familyName: 'Grover Family',
      p: 4, q: 4, h: 4, b: 4, nps: 8,
      comment: 'Good assistance with walker training and knee mobility.'
    },
    {
      nurseIdx: 5,
      daysAgo: 20,
      patientName: 'Mr. Deepak Khurana',
      familyName: 'Khurana Family',
      p: 4, q: 4, h: 4, b: 4, nps: 8,
      comment: 'Pleasant caregiver, respectful and clean uniform.'
    },
    {
      nurseIdx: 3,
      daysAgo: 22,
      patientName: 'Mrs. Sarita Singhania',
      familyName: 'Singhania Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Sterile, clean dressing changes and great communication.'
    },
    {
      nurseIdx: 0,
      daysAgo: 25,
      patientName: 'Mr. K.L. Chhabra',
      familyName: 'Chhabra Family',
      p: 5, q: 5, h: 4, b: 5, nps: 9,
      comment: 'Very comforting presence for elderly patients.'
    },
    {
      nurseIdx: 1,
      daysAgo: 28,
      patientName: 'Mr. Baljit Ahluwalia',
      familyName: 'Ahluwalia Family',
      p: 5, q: 5, h: 5, b: 5, nps: 10,
      comment: 'Superb dedication. Always on time, spotless hygiene.'
    }
  ];

  // Insert Historical Feedbacks
  const now = Date.now();
  sampleFeedbacks.forEach((fb, idx) => {
    const nurse = nursesData[fb.nurseIdx];
    const visitId = `visit-seed-${idx + 1}`;
    const tokenId = `token-seed-${idx + 1}`;
    const tokenStr = `seed_token_${idx + 1}`;
    const visitDate = new Date(now - fb.daysAgo * 86400000).toISOString();
    const createdDate = new Date(now - (fb.daysAgo * 86400000) + 7200000).toISOString(); // 2 hours after visit

    // 1. Visit
    db.prepare(`
      INSERT INTO care_visits (id, nurse_id, family_name, patient_name, care_type, visit_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)
    `).run(
      visitId, nurse.id, fb.familyName, fb.patientName, nurse.specialty,
      visitDate.slice(0, 10), visitDate
    );

    // 2. Token (Already submitted)
    db.prepare(`
      INSERT INTO feedback_tokens (id, token, visit_id, nurse_id, status, expires_at, created_at, submitted_at)
      VALUES (?, ?, ?, ?, 'submitted', ?, ?, ?)
    `).run(
      tokenId, tokenStr, visitId, nurse.id,
      new Date(now + 7 * 86400000).toISOString(),
      visitDate,
      createdDate
    );

    // 3. Feedback calculations
    const avg = Math.round(((fb.p + fb.q + fb.h + fb.b) / 4) * 10) / 10;
    const { sanitizedComment, hasProfanity } = filterContent(fb.comment);
    const { sentiment } = analyzeSentiment(fb.comment, avg);

    const isLow = avg <= 3.0 || fb.p <= 2 || fb.h <= 2 || fb.b <= 2 || fb.nps <= 4;
    const triageStatus = isLow ? (idx % 2 === 0 ? 'pending' : 'contacted') : 'resolved';
    const triageNotes = isLow ? 'Operations reached out to caregiver and family to review visit log.' : null;

    db.prepare(`
      INSERT INTO feedbacks (
        id, token_id, visit_id, nurse_id,
        punctuality, care_quality, hygiene, behaviour,
        average_rating, nps_score, raw_comment, sanitized_comment,
        has_profanity, sentiment, triage_status, triage_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `feedback-seed-${idx + 1}`,
      tokenId,
      visitId,
      nurse.id,
      fb.p, fb.q, fb.h, fb.b,
      avg,
      fb.nps,
      fb.comment,
      sanitizedComment,
      hasProfanity ? 1 : 0,
      sentiment,
      triageStatus,
      triageNotes,
      createdDate
    );
  });
  console.log(`✓ Seeded ${sampleFeedbacks.length} Historical Feedback Submissions.`);

  // 3. Seed Demo Tokens for Live Evaluation:
  // - 1 Active Token (ready to submit in demo)
  // - 1 Expired Token (to test expiration)
  // - 1 Already-Used Token (to test single-use guarantee)
  const activeVisitId = 'visit-demo-active';
  const activeTokenId = 'token-demo-active';
  const activeTokenStr = 'demo-active-token';
  db.prepare(`
    INSERT INTO care_visits (id, nurse_id, family_name, patient_name, care_type, visit_date, status, created_at)
    VALUES (?, ?, 'Verma Family', 'Mrs. Shakuntala Verma', 'Elderly Stroke Rehabilitation', ?, 'completed', ?)
  `).run(activeVisitId, 'nurse-2', new Date().toISOString().slice(0, 10), new Date().toISOString());

  db.prepare(`
    INSERT INTO feedback_tokens (id, token, visit_id, nurse_id, status, expires_at, created_at)
    VALUES (?, ?, ?, ?, 'active', ?, ?)
  `).run(
    activeTokenId,
    activeTokenStr,
    activeVisitId,
    'nurse-2',
    new Date(now + 3 * 86400000).toISOString(), // Expires in 3 days
    new Date().toISOString()
  );

  // Expired Demo Token
  const expiredVisitId = 'visit-demo-expired';
  const expiredTokenId = 'token-demo-expired';
  const expiredTokenStr = 'demo-expired-token';
  db.prepare(`
    INSERT INTO care_visits (id, nurse_id, family_name, patient_name, care_type, visit_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(expiredVisitId, 'nurse-4', 'Bose Family', 'Mr. Subhash Bose', 'Post-Surgical Recovery', '2026-11-10', 'completed', '2026-11-10T10:00:00Z');

  db.prepare(`
    INSERT INTO feedback_tokens (id, token, visit_id, nurse_id, status, expires_at, created_at)
    VALUES (?, ?, ?, ?, 'expired', '2026-11-13T10:00:00Z', '2026-11-10T10:00:00Z')
  `).run(expiredTokenId, expiredTokenStr, expiredVisitId, 'nurse-4');

  // Already-Used Demo Token
  const usedVisitId = 'visit-demo-used';
  const usedTokenId = 'token-demo-used';
  const usedTokenStr = 'demo-used-token';
  db.prepare(`
    INSERT INTO care_visits (id, nurse_id, family_name, patient_name, care_type, visit_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(usedVisitId, 'nurse-1', 'Chopra Family', 'Mrs. Reena Chopra', "Dementia & Alzheimer's Care", '2026-11-17', 'completed', '2026-11-17T10:00:00Z');

  db.prepare(`
    INSERT INTO feedback_tokens (id, token, visit_id, nurse_id, status, expires_at, created_at, submitted_at)
    VALUES (?, ?, ?, ?, 'submitted', ?, '2026-11-17T10:00:00Z', '2026-11-17T14:30:00Z')
  `).run(usedTokenId, usedTokenStr, usedVisitId, 'nurse-1', new Date(now + 5 * 86400000).toISOString());

  console.log(`✓ Seeded Demo Tokens:`);
  console.log(`  - Active Test Token:    /feedback/${activeTokenStr}`);
  console.log(`  - Expired Test Token:   /feedback/${expiredTokenStr}`);
  console.log(`  - Already Used Token:   /feedback/${usedTokenStr}`);
  console.log('✨ TheCarePal Seeding completed successfully!');
}

// Auto-run if executed directly via node
runSeed();
