# TheCarePal: Visit Feedback & Care Quality Dashboard

[![Task ID](https://img.shields.io/badge/Task%20ID-FS--08-teal.svg)](#)
[![Role](https://img.shields.io/badge/Role-Full%20Stack%20Developer%20Intern-blue.svg)](#)
[![Status](https://img.shields.io/badge/Status-Completed-success.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Node.js%20%7C%20SQLite%20%7C%20TailwindCSS-0d9488.svg)](#)

A full-stack, closed-loop quality assurance and caregiver intelligence platform built for **TheCarePal** home healthcare operations across India.

---

## 1. Why This Task Matters (The Core Motive)

> *"We want to hear from families regularly and spot problems with a nurse before they turn into a complaint. A simple feedback loop with a quality dashboard gives us that view."*

In home nursing (elderly care, dementia, neonatal care, post-surgical recovery), family trust and patient dignity are paramount. Traditional complaint systems are reactive—by the time an incident escalates to a formal customer complaint, care recipient distress has already happened.

This application provides:
1. **Frictionless Family Experience:** A lightweight, mobile-first feedback form accessed via a unique token link (`/feedback/:token`) with **zero login required**.
2. **Guaranteed Integrity:** Each link works **only once** and automatically **expires** after a preset window (e.g., 1, 3, 7, or 14 days).
3. **Doctor & Caregiver Specific Sharing:** Instant link generation for specific caregivers/doctors with direct WhatsApp and Email dispatch.
4. **Proactive Operations Intelligence:** A real-time executive dashboard calculating **Net Promoter Score (NPS)**, **longitudinal care quality trends**, **caregiver scorecards**, and an **Incident Triage Queue** that immediately surfaces ratings $\le 3.0$ for proactive intervention.
5. **Team Roster Management:** Ability to add new doctors/nurses to the active roster or remove inactive members with full database integrity.
6. **Content Safety & Moderation:** Automated profanity masking hides abusive terms from the default view with an administrative reveal toggle.
7. **Instant Data Portability & Reporting:** One-click RFC-compliant CSV export and automated weekly email digests.

---

## 2. Feature Highlights

### 2.1. Must-Have Requirements

- **Single-Use Tokenized Feedback Form (`/feedback/:token`):**
  - Frictionless access with no login or authentication barrier for the family member.
  - Granular 1–5 star ratings across: **Punctuality**, **Quality of Care**, **Hygiene & Safety**, **Behaviour & Compassion** with a live calculated care score.
  - **Progressive NPS Meter (0–10):** Color-graded visual meter that progressively fills from **Red** (0–6 Detractors) through **Yellow/Amber** (7–8 Passives) to **Green/Emerald** (9–10 Promoters) up to the active score.
  - Quick impression tags & qualitative comments textarea (up to 1,000 characters).

- **Link Security & Expiration Engine:**
  - **Single-Use Guarantee:** Once submitted, the token status changes to `submitted` within a transactional database operation; subsequent attempts are safely rejected with HTTP 409 (*"Feedback Already Recorded"*).
  - **Expiry Enforcement:** Automatic check comparing `expires_at` against current timestamp with HTTP 410 (*"Feedback Link Expired"*).
  - Dedicated UX states for **Active**, **Already Submitted**, **Expired**, and **Invalid (404)** tokens.

- **Care Quality & Operations Dashboard (`/admin`):**
  - **Key Performance Indicators (KPIs):** Overall care quality average, 30-day feedback volume, category averages.
  - **Net Promoter Score (NPS):** Computed dynamically using the official formula:
    $$\text{NPS} = \% \text{Promoters (9-10)} - \% \text{Detractors (0-6)}$$
  - **Longitudinal Trend Chart:** Recharts Area chart tracking daily/weekly quality score trajectories across all 4 care dimensions.
  - **Caregiver Scorecards & Member Management:** Granular metrics per nurse (total visits, average rating, punctuality, hygiene, behaviour, and sentiment balance). Includes ability to **Add New Caregiver Members** to the active roster and **Remove Members** with cascading integrity.
  - **Caregiver Evaluation Dossier:** Comprehensive drill-down modal per nurse showing historical review timeline, dimension averages vs benchmarks, and commendation triggers.
  - **Incident Triage Queue (Low-Score Alerts):** Immediate alerting for ratings $\le 3.0$ or individual dimensions $\le 2$, with workflow actions (`Pending` $\rightarrow$ `Contacted Family` $\rightarrow$ `Resolved`) and one-click quick note templates.

- **Content Moderation & Profanity Masking:**
  - Automated regex engine censors abusive words with asterisks (`****`).
  - Dashboard control: *"Content Filter: Masked"* vs *"Content Filter: Raw"* toggle for operations audits.

- **CSV Data Export:**
  - Downloads a clean, RFC-compliant CSV containing timestamps, patient names, caregiver names, granular ratings, sanitized comments, and triage statuses.

### 2.2. Good-to-Have Requirements (Bonus Features)

- **Per-Doctor Feedback Form Sharing Modal:**
  - Allows operations leads to select any doctor/caregiver from the roster, input patient/family details, select expiry (1, 3, 7, 14 days), and generate a unique single-use link.
  - Instant dispatch buttons: **Send via WhatsApp** (pre-composed invitation) and **Send via Email** (formal care check-in).
  - Accessible directly from the sidebar, sticky top header, caregiver scorecard rows, and dossier modal.

- **Comment Sentiment Analysis:** Automated tagging of comments as **Positive** (green), **Neutral** (gray), or **Negative** (red) using an intelligent domain lexicon calibrated with numerical star ratings.

- **Weekly Operations Summary Email:** Built-in digest generator compiling weekly KPIs, caregiver-of-the-week awards, and open incidents into an attractive, responsive HTML email template.

- **Interactive Token Generator & Sandbox:** An admin utility to test single-use links on the fly with customizable expiry days and instant test buttons.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance SPA with rapid hot module replacement |
| **Styling** | Tailwind CSS, Lucide Icons | Responsive enterprise healthcare UI with vertical navigation |
| **Data Viz** | Recharts, Canvas-Confetti | Longitudinal quality trend curves & milestone celebrations |
| **Backend** | Node.js 22, Express 5 | REST API with modular routers for dashboard, feedback, and triage |
| **Database** | SQLite (Better-SQLite3) | Embedded ACID SQL database running in WAL mode (zero cloud setup) |
| **Security** | Crypto UUIDv4, Parameterized SQL | Tamper-proof single-use tokenization and SQL injection prevention |

---

## 4. Repository Structure & File Meaning

```
Carepal-Internship-assignment/
├── .env.example                       # Environment configuration template
├── .gitignore                         # Git exclusion rules (node_modules, SQLite WAL, builds)
├── package.json                       # Root script orchestrator (concurrent dev runner & seed)
├── package-lock.json                  # Root dependency lockfile
├── README.md                          # Full architectural documentation & walkthrough guide
├── goal.md                            # Comprehensive requirement & grading rubric breakdown
│
├── client/                            # React 18 + Vite Frontend Application
│   ├── index.html                     # HTML root document with healthcare fonts & meta tags
│   ├── vite.config.js                 # Vite build settings & dev server proxy configuration
│   ├── tailwind.config.js             # Tailwind design system tokens, colors & typography
│   ├── postcss.config.js              # PostCSS pipeline for Tailwind processing
│   ├── package.json                   # Client-side dependencies and build scripts
│   ├── public/                        # Static brand assets & vector favicons
│   │   ├── favicon.svg                # CarePal heart-handshake vector favicon
│   │   └── icons.svg                  # Brand SVG icons sprite
│   └── src/
│       ├── main.jsx                   # React DOM application bootstrap
│       ├── App.jsx                    # Root view controller, routing & global modal states
│       ├── index.css                  # Global styles, Tailwind directives & scrollbar rules
│       │
│       ├── pages/                     # High-level route views
│       │   ├── AdminDashboard.jsx     # Clinical KPI cards, Recharts trends, scorecards & stream
│       │   ├── FeedbackPortal.jsx     # Zero-login family form (stars, NPS meter, tags & comment)
│       │   ├── IncidentTriage.jsx     # Low-score (<3.0) queue with workflow action controls
│       │   └── TokenTester.jsx        # Sandbox for Active/Expired/Used tokens & 1-click DB reset
│       │
│       ├── components/                # Modular reusable UI widgets
│       │   ├── Sidebar.jsx            # Left vertical nav sidebar with live quality monitor status
│       │   ├── TopHeader.jsx          # Sticky context bar with quick-actions & triage alert badge
│       │   ├── ShareFeedbackModal.jsx # Doctor-specific link generator with WhatsApp & Email share
│       │   ├── AddCaregiverModal.jsx  # Member onboarding form to add new caregivers to roster
│       │   ├── CaregiverModal.jsx     # Clinical dossier drill-down with benchmarks & commendations
│       │   ├── NpsSelector.jsx        # Progressive Red->Yellow->Green 0-10 NPS visual scale
│       │   ├── StarRating.jsx         # Accessible 1-5 star rating component with hover labels
│       │   └── EmailDigestModal.jsx   # Weekly operations summary email preview & HTML copy
│       │
│       └── services/
│           └── api.js                 # Unified frontend API client (fetch wrapper with error handling)
│
└── server/                            # Node.js + Express 5 Backend REST API
    ├── package.json                   # Backend dependencies & seeding scripts
    ├── data/
    │   └── carepal.db                 # Embedded SQLite ACID database file (WAL mode enabled)
    └── src/
        ├── index.js                   # Express server entry point, CORS, routes & health check
        ├── data/
        │   ├── db.js                  # SQLite connection singleton & table schema definitions
        │   └── seed.js                # Database seeder (8 caregivers, 22+ reviews, test tokens)
        ├── routes/
        │   ├── feedback.js            # Public token verification & transactional submission
        │   ├── dashboard.js           # Metrics, longitudinal trends, nurse roster & member CRUD
        │   └── admin.js               # Low-score triage queue, status patches, CSV export & token gen
        └── services/
            ├── moderationService.js   # Automated abusive language regex censor (****)
            ├── sentimentService.js    # Domain sentiment classifier (Positive, Neutral, Negative)
            └── emailDigestService.js  # Weekly operations digest compiler & HTML email template
```

### Detailed File Meaning Reference

| Directory / File | Type | Meaning & Responsibilities |
| :--- | :--- | :--- |
| **Root Level** | | |
| `package.json` | Config | Defines top-level commands (`npm run dev`, `npm run seed`, `npm run install:all`) to concurrently run frontend and backend without terminal clutter. |
| `goal.md` | Doc | Architectural brief breaking down the motives, must-have requirements, and clinical quality pillars from the internship PDF (`FS-08`). |
| `.env.example` | Config | Template specifying default ports (`PORT=5000`, `VITE_PORT=5173`) and base URLs. |
| **Client Core** | | |
| `client/src/App.jsx` | React Component | Master layout coordinator that switches between the distraction-free public family portal and the enterprise admin view with left vertical navigation. |
| `client/src/services/api.js` | Service | Frontend HTTP client centralizing all REST calls (`getMetrics`, `verifyToken`, `submitFeedback`, `addNurse`, `deleteNurse`, `generateToken`). |
| **Client Pages** | | |
| `AdminDashboard.jsx` | Page View | Executive operations dashboard displaying high-level KPIs, 30-day volume, Recharts area trends, caregiver scorecard table, and family feedback stream. |
| `FeedbackPortal.jsx` | Page View | Clean, frictionless form opened via single-use link. Validates token validity, renders caregiver details, star ratings, NPS meter, and celebratory confetti upon submit. |
| `IncidentTriage.jsx` | Page View | Escalation queue displaying all ratings $\le 3.0$. Enables operations leads to transition status (`Pending` $\rightarrow$ `Contacted Family` $\rightarrow$ `Resolved`) and append notes. |
| `TokenTester.jsx` | Page View | Reviewer utility testing active tokens, expired tokens, and already-submitted tokens, plus a 1-click database reset button. |
| **Client Components** | | |
| `Sidebar.jsx` | UI Component | Enterprise left vertical navigation sidebar featuring live system monitor pill, core navigation tabs, report triggers, and team profile. |
| `TopHeader.jsx` | UI Component | Sticky top context bar showing current page header, system normal pill, real-time triage alert counter, and "Share Feedback Form" quick action. |
| `ShareFeedbackModal.jsx` | UI Component | Doctor-specific feedback sharing modal allowing operations to choose a doctor, enter patient name, pick expiry (1–14 days), and send via WhatsApp or Email. |
| `AddCaregiverModal.jsx` | UI Component | Modal form allowing administrators to onboard new healthcare professionals (name, specialty, city, phone, experience) to the active roster. |
| `CaregiverModal.jsx` | UI Component | Clinical evaluation dossier modal displaying individual nurse dimension averages vs benchmarks, visit history, commendations, and direct share. |
| `NpsSelector.jsx` | UI Component | Interactive 0 to 10 NPS rating meter that progressively fills from Red (Detractors) through Yellow (Passives) to Green (Promoters) up to the selected score. |
| `StarRating.jsx` | UI Component | Accessible 1 to 5 star rating widget supporting interactive rating and read-only displays. |
| `EmailDigestModal.jsx` | UI Component | Modal displaying the generated responsive HTML operations email digest with 1-click clipboard copy. |
| **Server Core** | | |
| `server/src/index.js` | Express Server | REST API entry point configuring CORS, body parsing, route mounting, static assets serving, and graceful shutdown handlers. |
| `server/src/data/db.js` | Database Layer | SQLite database connector utilizing `better-sqlite3` in WAL mode with foreign key enforcement and table schema creation. |
| `server/src/data/seed.js` | Database Seed | Populates 8 realistic Indian caregivers, 22+ historical visit reviews, and active/expired/used tokens for evaluation. |
| **Server Routes** | | |
| `routes/feedback.js` | Express Router | Handles `/api/feedback/verify/:token` and `/api/feedback/submit`. Enforces single-use sealing within an ACID database transaction. |
| `routes/dashboard.js` | Express Router | Supplies analytics data (`/metrics`, `/trends`, `/nurses`), individual dossiers, and caregiver roster management (`POST` and `DELETE` nurse). |
| `routes/admin.js` | Express Router | Administrative endpoints for low-score triage queue, ticket status updates, RFC-compliant CSV export, token generation, and database reset. |
| **Server Services** | | |
| `moderationService.js`| Micro-service | High-performance regex content filter that masks abusive or offensive words with asterisks (`****`). |
| `sentimentService.js` | Micro-service | Domain sentiment classifier analyzing family comments and calibrating semantic tone with numerical star ratings. |
| `emailDigestService.js`| Micro-service | Weekly summary compiler that calculates 7-day KPIs, top caregivers, open incidents, and renders a clean HTML email template. |

---

## 5. Setup and Run Guide

### 5.1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on v22.17)
- npm (v9 or higher)

### 5.2. Quick Start (Zero Cloud Dependencies)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tanishkrit/Carepal-Internship-assignment.git
   cd Carepal-Internship-assignment
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   *(Or run `npm install` in root, `server/`, and `client/`)*

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
   - **Backend REST API:** [http://localhost:5000/api/dashboard/metrics](http://localhost:5000/api/dashboard/metrics)

---

## 6. Live Evaluation Test Scenarios

To test all edge cases during evaluation, use the pre-seeded tokens available directly in the **Demo Link Sandbox** tab of the dashboard:

| Test Scenario | URL / Token | Expected System Behavior |
| :--- | :--- | :--- |
| **1. Active Valid Link** | `/feedback/demo-active-token` | Loads form for *Rajesh Nair* (Verma Family). Submit ratings to see the single-use lock engage and live dashboard stats update. |
| **2. Expired Link** | `/feedback/demo-expired-token` | Shows empathetic *"Feedback Link Expired"* screen with expiry date and TheCarePal 24/7 care helpline (+91 800-CAREPAL). |
| **3. Already-Used Link** | `/feedback/demo-used-token` | Rejects second attempt with *"Feedback Already Recorded"* screen and recorded submission date. |
| **4. Low-Score Incident** | Submit a rating $\le 3.0$ on any link | Instantly generates a critical triage ticket in the **Incident Triage** tab with urgency badge. |
| **5. Abusive Content Filter** | Submit comment with words like `rubbish`, `careless` | Word is masked in feedback stream (`****`); click toggle button to reveal raw text. |
| **6. Share Doctor Link** | Click **Share** on any nurse row | Generates a custom token for that caregiver with WhatsApp and Email share buttons. |
| **7. Add/Remove Member** | Click **Add Member** in Scorecard | Onboards a new caregiver to the active roster; or remove with cascading database cleanup. |
| **8. CSV Export** | Click **Export CSV** in top bar | Downloads standard `.csv` file with all sanitized data. |
| **9. Weekly Ops Email** | Click **Weekly Summary** in top bar | Opens full HTML preview modal with top caregivers and open tickets. |

---

## 7. How It Works (Security & Token Lifecycle)

```
[ Caregiver completes home visit ]
                 │
                 ▼
      Generate Unique Token ───► feedback_tokens (token, nurseId, visitId, expiresAt, status='active')
                 │
                 ▼
      Dispatched to Family (WhatsApp / SMS / Email Link: /feedback/:token)
                 │
                 ├─► Check 1: Token exists in DB?    (No  ──► 404 Invalid Link Page)
                 ├─► Check 2: status == 'submitted'? (Yes ──► 409 Already Submitted Page)
                 ├─► Check 3: now > expiresAt?       (Yes ──► 410 Expired Link Page)
                 │
                 ▼ [All Checks Passed]
          Active Feedback Form Renders (Zero Login Required)
                 │
                 ▼ [Family Submits Star Ratings + NPS + Comment]
      BEGIN TRANSACTION
        1. UPDATE feedback_tokens SET status='submitted', submitted_at=NOW()
        2. Content Moderation: Regex mask profanities -> sanitizedComment
        3. Sentiment Analysis: Domain Lexicon + Rating Calibration -> sentiment
        4. Triage Classifier: If rating <= 3.0 or dim <= 2 -> triageStatus='pending'
        5. INSERT INTO feedbacks
      COMMIT TRANSACTION
```

---

## 8. What I Would Build Next (Production Roadmap)

If deploying this system into TheCarePal's nationwide production infrastructure, the next roadmap phases would include:
1. **Automated WhatsApp & SMS Gateway:** Webhook listener attached to the Nurse mobile app shift-checkout event to trigger automated WhatsApp/SMS dispatch via Twilio/Gupshup.
2. **Scheduled Weekly Email Worker:** A Node.js cron worker (or Firebase Cloud Function `pubsub.schedule`) sending the weekly summary HTML email every Monday morning to `ops@thecarepal.com` via SendGrid/AWS SES.
3. **Multilingual Regional Support:** Translation into Hindi, Marathi, Kannada, and Bengali so elderly family members can review in their preferred regional language.
4. **Caregiver Reward & Coaching Engine:** Automated badge rewards (e.g. "Caregiver of the Month") integrated into the nurse app, alongside automated coaching modules when a caregiver's punctuality or hygiene metric drops below threshold.
5. **EHR / Hospital Portal Integration:** HL7/FHIR compliant data connector syncing quality metrics with partner hospitals for post-surgical recovery monitoring.

---

## 9. AI Tools Disclosure

As per TheCarePal assignment instructions, here is the full disclosure of AI tools utilized during this project:
- **Google Antigravity Agent (Gemini 3.8 Flash High):** Utilized for initial architectural scoping, drafting the implementation roadmap, structuring data models, and generating realistic Indian home care seed personas and clinical comments.
- **Human Candidate Role:** Architecture design, full stack development, logic validation (token transaction boundaries, NPS mathematical correctness, profanity regex boundary testing), UI/UX refinement, and verification.

---

## 10. Screen-Recorded Video Walkthrough Script (2–5 Minutes)

When recording your demo video, follow this structured outline:
1. **Introduction (0:00 - 0:30):**
   - Introduce yourself, Task ID **FS-08**, and explain why proactive feedback matters for home care safety.
2. **Family Feedback Form Demo (0:30 - 1:45):**
   - Open `/feedback/demo-active-token`. Show the mobile view.
   - Walk through the 4 rating dimensions (Punctuality, Quality, Hygiene, Behaviour), progressive NPS rating, and comment.
   - Submit the form $\rightarrow$ show the confetti celebration and thank you screen.
   - Refresh the page to demonstrate the **Single-Use Guarantee** (*"Feedback Already Recorded"*).
   - Open `/feedback/demo-expired-token` to show the **Expiration Lock**.
3. **Care Quality Dashboard Demo (1:45 - 3:15):**
   - Navigate to `/`. Highlight the Overall Rating, NPS stack breakdown, and Recharts Trend chart.
   - Show the Caregiver Scorecard table with individual nurse breakdowns.
   - Demonstrate the **Share Link** button for a specific doctor with WhatsApp/Email options.
   - Demonstrate the **Add Member** modal and **Remove Member** action.
   - Demonstrate the **Profanity Masking Toggle** (*Masked* vs *Raw*).
   - Switch to the **Incident Triage Queue** $\rightarrow$ show how a low score is flagged and change its status to *"Contacted Family"*.
   - Click **Export CSV** and open the downloaded file.
   - Click **Weekly Summary** to show the generated Operations Email Digest.
4. **Codebase & Architecture Walkthrough (3:15 - 4:30):**
   - Briefly show `server/src/routes/feedback.js` (transactional token invalidation & single-use guarantee).
   - Show `moderationService.js` and `sentimentService.js`.
5. **Conclusion (4:30 - 4:45):**
   - Mention production roadmap (WhatsApp triggers, scheduled cron) and thank the team.
