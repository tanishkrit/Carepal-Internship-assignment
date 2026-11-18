# TheCarePal: Visit Feedback & Care Quality Dashboard

[![Task ID](https://img.shields.io/badge/Task%20ID-FS--08-teal.svg)](#)
[![Role](https://img.shields.io/badge/Role-Full%20Stack%20Developer%20Intern-blue.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Node.js%20%7C%20SQLite%20%7C%20TailwindCSS-0d9488.svg)](#)

A full-stack, closed-loop quality assurance and caregiver intelligence platform built for **TheCarePal** home healthcare operations across India.

---

## 1. Why This Task Matters (The Core Motive)

> *"We want to hear from families regularly and spot problems with a nurse before they turn into a complaint. A simple feedback loop with a quality dashboard gives us that view."*

In home nursing (elderly care, dementia, neonatal care, post-surgical recovery), family trust and patient dignity are non-negotiable. Traditional complaint systems are reactive—by the time an incident escalates to a formal customer complaint, care recipient distress has already happened.

This application provides:
1. **Frictionless Family Experience:** A lightweight, mobile-first feedback form accessed via a unique token link (`/feedback/:token`) with **zero login required**.
2. **Guaranteed Integrity:** Each link works **only once** and automatically **expires** after a preset window (e.g., 3 to 7 days).
3. **Proactive Operations Intelligence:** A real-time executive dashboard calculating **Net Promoter Score (NPS)**, **longitudinal care quality trends**, **caregiver scorecards**, and an **Incident Triage Queue** that immediately surfaces ratings $\le 3.0$ for proactive intervention.
4. **Content Safety & Moderation:** Automated profanity masking hides abusive terms from the default view with an administrative reveal toggle.
5. **Instant Data Portability & Reporting:** One-click CSV export and automated weekly email digests.

---

## 2. Feature Highlights

### 2.1. Must-Have Requirements
- [x] **Single-Use Tokenized Feedback Form (`/feedback/:token`):**
  - Frictionless access with no login or authentication barrier for the family member.
  - Granular 1–5 star ratings across: **Punctuality**, **Quality of Care**, **Hygiene & Safety**, **Behaviour & Compassion**.
  - Net Promoter Score (NPS) scale (0–10).
  - Qualitative comments textarea.
- [x] **Link Security & Expiration Engine:**
  - **Single-Use Guarantee:** Once submitted, the token status changes to `submitted` within a transactional database operation; subsequent attempts are safely rejected.
  - **Expiry Enforcement:** Automatic check comparing `expires_at` against current timestamp.
  - Dedicated UX states for **Active**, **Already Submitted**, **Expired**, and **Invalid** tokens.
- [x] **Care Quality & Operations Dashboard (`/admin`):**
  - **Key Performance Indicators (KPIs):** Overall care quality average, 30-day feedback volume, category averages.
  - **Net Promoter Score (NPS):** Computed dynamically using the official formula:
    $$\text{NPS} = \% \text{Promoters (9-10)} - \% \text{Detractors (0-6)}$$
  - **Longitudinal Trend Chart:** Recharts Area chart tracking daily/weekly quality score trajectories across all 4 care dimensions.
  - **Caregiver Scorecards & Leaderboard:** Granular metrics per nurse (total visits, average rating, punctuality, hygiene, behaviour, and sentiment balance).
  - **Incident Triage Queue (Low-Score Alerts):** Immediate alerting for ratings $\le 3.0$ or individual dimensions $\le 2$, with workflow actions (`Pending` $\rightarrow$ `Contacted Family` $\rightarrow$ `Resolved`).
- [x] **Content Moderation & Profanity Masking:**
  - Automated regex engine censors abusive words with asterisks (`****`).
  - Dashboard control: *"Abusive Filter: ON (Masked)"* vs *"Abusive Filter: OFF (Raw)"* toggle for operations audits.
- [x] **CSV Data Export:**
  - Downloads a clean, RFC-compliant CSV containing timestamps, patient names, caregiver names, granular ratings, sanitized comments, and triage statuses.

### 2.2. Good-to-Have Requirements (Bonus Features)
- [x] **Comment Sentiment Analysis:** Automated tagging of comments as **Positive** (green), **Neutral** (gray), or **Negative** (red) using an intelligent domain lexicon calibrated with numerical star ratings.
- [x] **Weekly Operations Summary Email:** Built-in digest generator compiling weekly KPIs, caregiver-of-the-week awards, and open incidents into an attractive, responsive HTML email template.
- [x] **Interactive Token Generator & Sandbox:** An admin utility to create new single-use links on the fly with customizable expiry days (1, 3, 7, 14 days) and instant test buttons.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti
- **Backend:** Node.js 22, Express 5, Better-SQLite3
- **Database:** SQLite (embedded file database located in `server/data/carepal.db`)
- **Architecture:** Zero-cloud dependency for evaluation—runs locally on any machine with one command.

---

## 4. Setup and Run Guide

### 4.1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on v22)
- npm (v9 or higher)

### 4.2. Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/carepal-visit-feedback-dashboard.git
   cd carepal-visit-feedback-dashboard
   ```

2. **Install all dependencies (Root, Server, and Client):**
   ```bash
   # Install root runner dependencies
   npm install

   # Install backend dependencies
   cd server && npm install && cd ..

   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Seed the database with realistic healthcare sample data:**
   ```bash
   npm run seed
   ```
   *Populates 8 realistic Indian nurses across Mumbai, Bengaluru, Delhi NCR, Pune, 22+ historical visit reviews, trend data, and pre-configured test tokens.*

4. **Start the application (Concurrent Development Server):**
   ```bash
   npm run dev
   ```
   - **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
   - **Backend REST API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Live Evaluation Test Scenarios

To test all edge cases during evaluation, use the pre-seeded tokens available directly in the **Demo Links** tab of the dashboard:

| Test Scenario | URL / Token | Expected System Behavior |
| :--- | :--- | :--- |
| **1. Active Valid Link** | `/feedback/demo-active-token` | Loads form for *Rajesh Nair* (Verma Family). Submit ratings to see the single-use lock engage and live dashboard stats update. |
| **2. Expired Link** | `/feedback/demo-expired-token` | Shows empathetic *"Feedback Link Expired"* screen with expiry date and TheCarePal 24/7 care helpline (+91 800-CAREPAL). |
| **3. Already-Used Link** | `/feedback/demo-used-token` | Rejects second attempt with *"Feedback Already Recorded"* screen and recorded submission date. |
| **4. Low-Score Incident** | Submit a rating $\le 3.0$ on any link | Instantly generates a critical triage ticket in the **Incident Triage** tab with urgency badge. |
| **5. Abusive Content Filter** | Submit comment with words like `rubbish`, `careless` | Word is masked in feedback stream (`****`); click toggle button to reveal raw text. |
| **6. CSV Export** | Click **Export CSV** in top bar | Downloads standard `.csv` file with all sanitized data. |
| **7. Weekly Ops Email** | Click **Weekly Email** in top bar | Opens full HTML preview modal with top caregivers and open tickets. |

---

## 6. How It Works (Security & Token Lifecycle)

```
[ CRM / Nurse App completes shift ]
                 │
                 ▼
      Generate Unique Token ───► feedback_tokens table (token, nurseId, visitId, expiresAt, status='active')
                 │
                 ▼
      Dispatched to Family (SMS/WhatsApp Link: /feedback/:token)
                 │
                 ├─► Check 1: Token exists in DB?  (No ──► 404 Invalid Link Page)
                 ├─► Check 2: status == 'submitted'? (Yes ──► 409 Already Submitted Page)
                 ├─► Check 3: now > expiresAt?       (Yes ──► 410 Expired Link Page)
                 │
                 ▼ [All Checks Passed]
          Active Feedback Form Renders
                 │
                 ▼ [Family Submits Form]
      BEGIN TRANSACTION
        1. UPDATE feedback_tokens SET status='submitted', submitted_at=NOW()
        2. Content Moderation: Regex mask profanities -> sanitizedComment
        3. Sentiment Analysis: Lexicon + Rating Calibration -> sentiment
        4. Triage Classifier: If rating <= 3.0 or dim <= 2 -> triageStatus='pending'
        5. INSERT INTO feedbacks
      COMMIT TRANSACTION
```

---

## 7. What I Would Build Next (Production Roadmap)

If deploying this system into TheCarePal's nationwide production infrastructure, the next roadmap phases would include:
1. **Automated WhatsApp & SMS Gateway:** Webhook listener attached to the Nurse mobile app shift-checkout event to trigger automated WhatsApp/SMS dispatch via Twilio/Gupshup.
2. **Scheduled Weekly Email Worker:** A Node.js cron worker (or Firebase Cloud Function `pubsub.schedule`) sending the weekly summary HTML email every Monday morning to `ops@thecarepal.com` via SendGrid/AWS SES.
3. **Multilingual Regional Support:** Translation into Hindi, Marathi, Kannada, and Bengali so elderly family members can review in their preferred regional language.
4. **Caregiver Reward & Coaching Engine:** Automated badge rewards (e.g. "Caregiver of the Month") integrated into the nurse app, alongside automated coaching modules when a caregiver's punctuality or hygiene metric drops below threshold.
5. **EHR / Hospital Portal Integration:** HL7/FHIR compliant data connector syncing quality metrics with partner hospitals for post-surgical recovery monitoring.

---

## 8. AI Tools Disclosure

As per TheCarePal assignment instructions, here is the full disclosure of AI tools utilized during this project:
- **Google Antigravity Agent (Gemini 3.8 Flash High):** Utilized for initial architectural scoping, drafting the implementation roadmap, structuring data models, and generating realistic Indian home care seed personas and clinical comments.
- **Human Candidate Role:** Architecture design, full stack development, logic validation (token transaction boundaries, NPS mathematical correctness, profanity regex boundary testing), UI/UX refinement, and verification.

---

## 9. Screen-Recorded Video Walkthrough Script (2–5 Minutes)

When recording your demo video, follow this structured outline:
1. **Introduction (0:00 - 0:30):**
   - Introduce yourself, Task ID **FS-08**, and explain why proactive feedback matters for home care safety.
2. **Family Feedback Form Demo (0:30 - 1:45):**
   - Open `/feedback/demo-active-token`. Show the mobile view.
   - Walk through the 4 rating dimensions (Punctuality, Quality, Hygiene, Behaviour), NPS rating, and comment.
   - Submit the form $\rightarrow$ show the confetti celebration and thank you screen.
   - Refresh the page to demonstrate the **Single-Use Guarantee** (*"Feedback Already Recorded"*).
   - Open `/feedback/demo-expired-token` to show the **Expiration Lock**.
3. **Care Quality Dashboard Demo (1:45 - 3:15):**
   - Navigate to `/admin`. Highlight the Overall Rating, NPS stack breakdown, and Recharts Trend chart.
   - Show the Caregiver Scorecard table with individual nurse breakdowns.
   - Demonstrate the **Profanity Masking Toggle** (*Masked* vs *Raw*).
   - Switch to the **Incident Triage Queue** $\rightarrow$ show how a low score is flagged and change its status to *"Contacted Family"*.
   - Click **Export CSV** and open the downloaded file.
   - Click **Weekly Email** to show the generated Operations Email Digest.
4. **Codebase & Architecture Walkthrough (3:15 - 4:30):**
   - Briefly show `server/src/routes/feedback.js` (transactional token invalidation & single-use guarantee).
   - Show `moderationService.js` and `sentimentService.js`.
5. **Conclusion (4:30 - 4:45):**
   - Mention production roadmap (WhatsApp triggers, scheduled cron) and thank the team.
