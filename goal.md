# TheCarePal Internship Assignment: Visit Feedback and Care Quality Dashboard

**Task ID:** FS-08  
**Role:** Full Stack Developer Intern  
**Organization:** TheCarePal (India)  
**Work Mode:** Remote (Stipend Provided)  
**Submission Deadline:** Friday, 20 November 2026, 2:00 PM IST  

---

## 1. Organization Background

TheCarePal is a leading home care provider across India offering specialized, compassionate in-home care services:
- **Elderly Care & Companion Support**
- **Alzheimer’s & Dementia Specialized Care**
- **Newborn & Baby Care**
- **Post-Surgical & Post-Hospitalization Recovery**

### Operational Ecosystem
- **Families & Care Recipients:** Manage care schedules, invoices, and care requests through member mobile apps and the web portal.
- **Nurses & Caregivers:** Utilize dedicated nurse mobile applications for attendance, shift management, and visit notes.
- **Operations Team:** Coordinates scheduling, quality audits, dispute resolutions, and nurse deployments via an internal CRM.
- **Preferred Tech Stack:** React (Vite) with Firebase (Auth, Firestore, Realtime Database, Storage, Cloud Functions) or Node.js (Express) backend.

---

## 2. Core Motive: Why This Task Matters

> *"We want to hear from families regularly and spot problems with a nurse before they turn into a complaint. A simple feedback loop with a quality dashboard gives us that view."*

In home care services, quality of care, emotional trust, and safety are non-negotiable. Traditional complaint systems are reactive—by the time a family files a formal complaint, the patient may have experienced poor care, distress, or trust may have been permanently fractured.

The objective of this assignment is to build a proactive, closed-loop visit feedback collection system and care quality intelligence dashboard that:
1. **Lowers Friction for Families:** Allows families to give immediate, honest post-visit feedback on their phones via a unique, single-use, no-login link.
2. **Detects Early Warning Signals:** Flags low ratings, punctuality drops, behavioral issues, or hygiene problems immediately.
3. **Empowers Operations Teams:** Provides actionable intelligence with real-time analytics (NPS, nurse-level scorecards, longitudinal trends, and an incident triage queue).
4. **Maintains Trust and Integrity:** Protects the platform with link expiry, single-use guarantees, and content safety filters.

---

## 3. Scope of Work & Requirements

### 3.1. Must-Have Requirements

#### A. Family Feedback Form (Public, Frictionless)
- **Unique Link Access:** Accessed via a secure unique tokenized link (`/feedback/:token`); no login or authentication required for the family member.
- **One-Time Use Guarantee:** Each feedback link works exactly once. Once submitted, the link becomes invalid.
- **Expiration Policy:** Each link expires after a predefined window (e.g., 3 to 7 days from generation/visit completion).
- **Graceful Error Handling:** Dedicated user feedback states for:
  - Valid & Active Form
  - Already Submitted / Used Link
  - Expired Link
  - Invalid / Non-existent Token
- **Evaluation Metrics (Form Fields):**
  - **Punctuality** (Rating: 1–5 stars or scale)
  - **Quality of Care** (Rating: 1–5 stars or scale)
  - **Hygiene & Cleanliness** (Rating: 1–5 stars or scale)
  - **Behaviour & Compassion** (Rating: 1–5 stars or scale)
  - **Detailed Qualitative Comment** (Text field for specific feedback)
  - **Net Promoter Score (NPS) Question** (*"How likely are you to recommend TheCarePal to friends and family?"* 0–10 scale)

#### B. Admin Care Quality Dashboard
- **Nurse Performance Scorecard:**
  - Average overall rating per nurse.
  - Granular category breakdown (Punctuality, Quality of Care, Hygiene, Behaviour).
  - Total visits completed and total feedback received.
- **Trend Over Time:**
  - Longitudinal performance tracking (ratings over days/weeks/months).
  - Visual charts showing care trajectory and service improvements/declines.
- **Net Promoter Score (NPS) Metric:**
  - Automated calculation: `% Promoters (9-10) - % Detractors (0-6)`.
  - NPS tier categorization (Passive: 7-8).
- **Incident Triage & Low-Score Alerts:**
  - Real-time queue highlighting low scores (e.g., overall rating $\le 3$ or individual dimension $\le 2$).
  - Actionable status management for Operations (e.g., *Pending Review*, *Contacted Family*, *Resolved*).
- **Abusive Language / Content Safety Filter:**
  - Automated profanity and abusive language filter that censors/masks offensive terms from the default dashboard view.
  - Administrative toggle to reveal raw text when investigation is required.
- **CSV Data Export:**
  - One-click export of complete feedback records, timestamps, nurse details, ratings, and sanitized comments for external reporting.

---

### 3.2. Good-to-Have Requirements (Bonus Features)

- **Comment Sentiment Analysis:** Automated tagging of comments as **Positive**, **Neutral**, or **Negative** to help operations scan customer mood quickly.
- **Operations Weekly Digest / Summary Email:** Automated or previewable email report sent to the operations team highlighting:
  - Weekly Average Quality Score
  - Current NPS & Trend
  - Top Performing Nurses
  - Nurses needing training/support
  - Summary of open low-score follow-ups

---

## 4. Technical Specifications & Guidelines

- **Frontend:** React with Vite (responsive, mobile-first design for families submitting on smartphones).
- **Backend / Database Options:**
  - Option 1: Node.js (Express) with relational/document database (SQLite/PostgreSQL/MongoDB).
  - Option 2: Firebase (Firestore, Cloud Functions, Firebase Hosting).
- **Data Seeding:** Seed script with realistic synthetic data:
  - 5–10 Indian nurses and caregivers across different specialties (Elderly Care, Baby Care, Dementia Care).
  - 30–50+ realistic visits and feedback submissions across past weeks for rich trend analysis.
  - Active, expired, and already-used test tokens for seamless demonstration.
- **Security & Hygiene:**
  - Zero hardcoded secrets/API keys.
  - `.env.example` file provided.
  - Clean directory structure and type safety/linting standards.

---

## 5. Submission & Evaluation Deliverables

### 5.1. Submission Checklist
1. **Screen-Recorded Demo Video (2–5 Minutes):**
   - End-to-end working demonstration first (token validation, submission, dashboard update, CSV export, profanity filter).
   - Brief code architecture walkthrough and key design decisions.
   - Uploaded to Google Drive or YouTube (Unlisted) with public viewing access.
2. **Public GitHub Repository:**
   - Comprehensive `README.md` covering:
     - Project overview and architecture.
     - Step-by-step local setup instructions.
     - How the token lifecycle and security works.
     - What would be built next in a production roadmap.
     - Disclosure of AI tools utilized and their specific applications.
     - Complete `.env.example`.
3. **TheCarePal Submission Portal:**
   - Submit by **Friday, 20 November 2026, 2:00 PM IST** under Task ID **FS-08**.

### 5.2. Evaluation Pillars
- **End-to-End Functionality:** 100% completion of all Must-Have requirements.
- **Code Quality:** Modularity, error handling, clean abstractions, and configuration hygiene.
- **Product & UI/UX Sense:** Thoughtful, compassionate design suited for real families and busy operations personnel.
- **Engineering Justification:** Clear articulation of trade-offs and decisions in documentation and video walkthrough.
