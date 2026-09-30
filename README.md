# UniReport

> Web platform for structured academic and institutional event documentation, accreditation outcome mapping (NAAC / ABET / NBA), and instant vector PDF publication.

```
+------------------------------------------------------------------------------+
|  [UniReport Workspace]                                  [Ready: 83%] [PDF v] |
+--------------------------------------+---------------------------------------+
|  STAGE 1 -> STAGE 2 -> STAGE 3       |  LIVE DOCUMENT CANVAS (A4)            |
|  [Identity] [Outcomes] [Publication] |  +---------------------------------+  |
|                                      |  | INSTITUTIONAL PROCEEDINGS       |  |
|  Event Title:                        |  | Department of Computer Science  |  |
|  [International AI Symposium       ] |  | Date: 2026-09-30 | Hall A       |  |
|                                      |  |                                 |  |
|  Accreditation Mapping:              |  | 1. Executive Summary            |  |
|  * CO-1, CO-4 (Bloom's Level 4)      |  | The symposium convened 280...   |  |
|  * Program Outcomes: PO-2, PO-5      |  |                                 |  |
|                                      |  | 2. Attendance & Demographics    |  |
|  Attendance Parser (280 Total):      |  | Students: 190 | Faculty: 65     |  |
|  [Pasted 280 spreadsheet rows     ]  |  | Satisfaction: [★ 4.85 / 5.0]    |  |
+--------------------------------------+---------------------------------------+
```

---

## Key Highlights

- **3-Stage Milestone Workflow**: Organized into *Stage 1: Identity & Participants*, *Stage 2: Proceedings & Outcomes*, and *Stage 3: Media & Publication* with a 6-criteria readiness meter (0% to 100%).
- **Live Side-by-Side Split Canvas**: Form edits update the simulated A4 vector paper canvas in real time.
- **Accreditation Alignment Fields**: Pre-structured data inputs for Course Outcomes (CO), Program Outcomes (PO), Bloom's Taxonomy cognitive tiers (L1 to L6), and formal HOD verification sign-offs.
- **REGAN Agent & Gemini Copilot**: Application-level agent orchestrator built on Google Gemini for structured draft generation from raw notes, section-specific refreshes, and multi-turn authoring assistance.
- **Client-Side Vector PDF Compiler**: Pure `jsPDF` vector document generator with automated coordinate pagination, institutional seals, security watermarks (-45 degrees), and tripartite signature blocks.
- **Resilient Dual-Tier Storage**: Real-time Firebase Cloud Firestore persistence backed by local `localStorage` caching for offline resilience.

---

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd unireport
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

*(Note: Firebase credentials in `.env` are optional. If omitted, UniReport operates seamlessly using browser local storage.)*

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## System Architecture

```
+-----------------------------------------------------------------------------+
|                          CLIENT (React 19 + Vite 6)                         |
|  * 3-Path Wizard Engine        * 3-Stage Progressive Workflow Stepper       |
|  * Live Split Vector Canvas    * Pure Vector PDF Compiler (jsPDF)           |
|  * Regex Attendance Parser     * LocalStorage Offline Persistence           |
+--------------------------------------+--------------------------------------+
                                       | JSON / REST API
+--------------------------------------v--------------------------------------+
|                    SERVER GATEWAY (Express 4.21 + tsx)                      |
|  * Rate Limiter (60 req/min)         * Liveness Probe (/healthz)            |
|  * /api/regan/generate               * /api/regan/regenerate-section        |
|  * /api/gemini/suggest-tags          * /api/gemini/chat                     |
+------------------+-----------------------------------+----------------------+
                   |                                   |
+------------------v---------------+   +---------------v----------------------+
|        GOOGLE GEMINI API         |   |       FIREBASE CLOUD TIER            |
|  * gemini-2.5-flash (Configurable)   |  * Cloud Firestore (Reports & Users) |
|  * Structured JSON Mode          |   |  * Firebase Authentication (OAuth)   |
+----------------------------------+   +--------------------------------------+
```

---

## Key Design Decisions & Trade-Offs

| Decision | Selected Approach | Alternative Considered | Rationale & Trade-Off |
| :--- | :--- | :--- | :--- |
| **PDF Generation** | Client-Side pure `jsPDF` | Server-Side Headless Chrome (Puppeteer / Playwright) | `jsPDF` operates with zero server compute overhead, sub-second generation latency, and deterministic geometry. *Trade-off*: Custom complex CSS layouts must be calculated manually via coordinate geometry. |
| **LLM Output Enforcement** | Structured JSON Mode (`responseMimeType: "application/json"`) + Client Schema Validation | Raw markdown completion + post-hoc regex parsing | Guarantees strict adherence to the `Report` TypeScript interface with minimal extraction drift. Includes a JSON repair fallback for malformed chunks. |
| **Event Tagging** | Hybrid: Gemini Semantic Classifier with Rule-Based Regex Fallback | Pure LLM Classification | Provides instantaneous semantic recommendations while guaranteeing zero-delay fallback when offline or during network constraints. |
| **State Persistence** | Optimistic Local-First Cache + Debounced Cloud Firestore Sync | Synchronous Remote-Only Writes | Guarantees zero authoring latency during rapid typing; updates persist locally immediately and sync to Firestore after a 1000ms debounce. |

---

## Evaluation & Extraction Quality Checks

The repository includes a dedicated evaluation test suite located in `/eval/` containing representative institutional input fixtures:

- **Conference Itinerary**: `eval/fixtures/conference_itinerary.txt` (Dates, Venue, 3 Keynotes, CO-PO alignments)
- **Hackathon Brief**: `eval/fixtures/hackathon_brief.txt` (4 Problem Tracks, 3 Award Tiers, Sponsors)
- **Workshop Outline**: `eval/fixtures/workshop_outline.txt` (Toolchain, 3 Lab Exercises, Pre/Post Metrics)
- **Board of Studies Minutes**: `eval/fixtures/meeting_minutes.txt` (Presiding Chair, Resolutions, Action Items)

Run the evaluation check locally:

```bash
npm run eval
```

---

## API Reference & Security

All backend API routes are hosted under `/api/*` and proxied through Express with built-in in-memory rate limiting (**60 requests per minute per IP**).

### 1. `POST /api/regan/generate`
Generates a structured report draft from raw text notes.
- **Request Body**:
  ```json
  {
    "details": "Annual AI Workshop schedule...",
    "eventType": "Workshop",
    "tone": "Executive",
    "instruction": "Focus on cloud computing outcomes"
  }
  ```
- **Response**: `{ "success": true, "data": { ...ReportFields } }`
- **Error Codes**: `400 Bad Request` (missing details), `429 Too Many Requests`, `500 Internal Server Error`.

### 2. `POST /api/regan/regenerate-section`
Refreshes a targeted section (`summary`, `guests`, `accreditation`, `attendance`) without altering other fields.
- **Request Body**:
  ```json
  {
    "sectionKey": "accreditation",
    "currentReport": { ...ReportObject },
    "instruction": "Map to ABET criteria 3 and 5"
  }
  ```
- **Response**: `{ "success": true, "data": { "accreditation": { ... } } }`

### 3. `POST /api/gemini/suggest-tags`
Classifies event metadata into 3 to 6 institutional category tags.
- **Request Body**:
  ```json
  {
    "title": "National Hackathon 2026",
    "eventType": "Hackathon",
    "organization": "Faculty of Engineering",
    "department": "Computer Science"
  }
  ```
- **Response**: `{ "success": true, "tags": ["Academic", "Hackathon", "Innovation", "Technical"], "rationale": "..." }`

### 4. `POST /api/gemini/chat`
Multi-turn conversational assistance grounded in active report context.
- **Request Body**:
  ```json
  {
    "persona": "documentarian",
    "messages": [{ "role": "user", "content": "Summarize the panel into 3 bullets." }],
    "currentReport": { ...ReportObject }
  }
  ```
- **Response**: `{ "success": true, "reply": "markdown string" }`

---

## Data Models & Readiness Score

### Readiness Score Calculation
The document readiness engine counts 6 core completed sections, with each satisfied criterion adding 1/6 (approx 16.67%) toward the total score (0% to 100%):

1. **Event Identity & Venue**: Title and location populated.
2. **Attendance Headcount**: Total attendees > 0.
3. **Keynote & Speakers**: At least 1 guest profile documented.
4. **Proceedings Summary**: Finalized or polished summary narrative present.
5. **Specialized Governance**: Populated accreditation mapping, hackathon prizes, workshop exercises, or meeting minutes.
6. **Media or Finalization Lock**: At least 1 photo uploaded or report marked finalized.

$$\text{Readiness \%} = \text{round}\left(\frac{\text{Completed Criteria}}{6} \times 100\right)$$

*A score >= 80% (5 of 6 criteria satisfied) illuminates the "Publication Ready" badge.*

### Attendance Benchmark Ratings (Half-Open Intervals)
- **Needs Quality Review**: score < 3.8
- **Good / Satisfactory**: 3.8 <= score < 4.3
- **Excellent Engagement**: 4.3 <= score < 4.8
- **Outstanding (Institutional Benchmark)**: score >= 4.8

### Workshop Pedagogical Skill Gain Formula
```
Skill Gain % = ((Post Assessment Score - Pre Assessment Score) / Pre Assessment Score) * 100
```

---

## Privacy, Security & Data Boundaries

- **Local-Memory Roster Parsing**: Spreadsheet text pasted into the `AttendanceTab` is parsed in browser memory into aggregate counts (total, students, faculty, external delegates). Raw attendee names and email addresses are **never** written to Firestore or transmitted to AI endpoints.
- **AI Narrative Context**: User-entered session notes, qualitative outlines, and speaker profiles explicitly passed to REGAN, the Copilot, or the Summarizer are transmitted over HTTPS to the Google Gemini API proxy routes.
- **Data Persistence**: Report documents and user profile sequences are stored in your configured Firebase Cloud Firestore project protected by `firestore.rules`.
- **API Gateway Rate Limiting**: The server enforces a sliding-window rate limit (60 requests/min per IP) returning `429 Too Many Requests` when exceeded.

---

## Known Limitations

1. **Font Glyphs**: The core `jsPDF` engine uses standard Helvetica/Times font tables. Non-Latin Unicode scripts (e.g., Devanagari, Cyrillic, East Asian ideograms) require registering custom TrueType `.ttf` font files into the virtual file system.
2. **Embedded Raster Imagery**: While document typography, tables, and borders compile to pure vector shapes, uploaded event photos are embedded as standard raster bitmaps (JPEG/PNG).
3. **Spreadsheet Ingestion**: The regex roster parser expects tabular lines containing distinguishable role titles or email formats; heavily formatted non-standard spreadsheets may require manual field adjustment.

---

## Project Structure

```
unireport/
├── docs/
│   └── FEATURE_MANUAL.md     # In-depth operational manual for all 11 subsystems
├── eval/
│   ├── fixtures/             # Evaluation inputs (Conference, Hackathon, Workshop, Minutes)
│   └── evaluate_regan.ts     # Automated REGAN fixture evaluation script
├── src/
│   ├── components/
│   │   ├── CreateReportWizard.tsx  # 3-path onboarding wizard modal
│   │   ├── Dashboard.tsx           # Portfolio manager with drag-and-drop ordering
│   │   ├── GeminiChatbot.tsx       # Multi-turn contextual copilot drawer
│   │   ├── LiveDocumentCard.tsx    # Split-canvas real-time vector preview
│   │   ├── ReganStudio.tsx         # Autonomous synthesis & targeted section sync
│   │   ├── TabNavigation.tsx       # 3-stage milestone stepper & readiness bar
│   │   └── tabs/                   # Modular editing steps (Details, Attendance, etc.)
│   ├── lib/
│   │   ├── pdfGenerator.ts         # Client-side jsPDF coordinate compilation engine
│   │   └── firebase.ts             # Firebase Auth & Firestore client configuration
│   ├── App.tsx                     # Top-level workspace orchestrator & state bus
│   └── types.ts                    # Master data interfaces and governance schemas
├── server.ts                       # Express 4.21 API proxy & Vite middleware entry
├── firestore.rules                 # Cloud Firestore security rules
├── .env.example                    # Environment variable template
└── package.json                    # Project scripts and dependencies
```

---

## Testing & Verification

```bash
# Run TypeScript compilation and static lint check
npm run lint

# Run REGAN extraction evaluation suite
npm run eval

# Compile production client build
npm run build

# Start production server
npm start
```

---

## Roadmap

- [ ] **Multimodal Flyer Ingestion**: Extract event metadata, speaker bios, and sponsor logos directly from uploaded flyer images/PDFs via Gemini Vision.
- [ ] **Custom Unicode TTF Fonts**: Support Devanagari and international font packages for regional institutional compliance.
- [ ] **Multi-Format Export Bundle**: 1-click download of raw `.tex` LaTeX sources, Markdown `.md`, and vector PDF in a single ZIP archive.
- [ ] **Cryptographic QR Verification**: Public verification landing page confirming document integrity and HOD sign-off status.

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Verify static analysis and evaluation pass without errors (`npm run lint && npm run eval`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to your branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request with a description of the changes.

---

## License

Distributed under the [Apache-2.0 License](LICENSE). Designed and engineered for universities, academic departments, and research institutions worldwide.
