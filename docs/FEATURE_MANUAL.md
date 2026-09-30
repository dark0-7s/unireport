# 📖 UniReport: Comprehensive Subsystem & Feature Manual

This manual provides an in-depth, technical explanation of how each subsystem and feature inside **UniReport** operates, from user interaction to backend processing, algorithmic transformations, and document compilation.

---

## 📑 Table of Contents

- [1. 3-Path Quick-Start Creation Hub](#1-3-path-quick-start-creation-hub)
- [2. 3-Stage Progressive Workflow & Dynamic Readiness Engine](#2-3-stage-progressive-workflow--dynamic-readiness-engine)
- [3. Real-Time Side-by-Side Live Document Desk](#3-real-time-side-by-side-live-document-desk)
- [4. REGAN Automated Synthesis Studio](#4-regan-automated-synthesis-studio)
- [5. Multi-Turn Gemini Institutional Copilot](#5-multi-turn-gemini-institutional-copilot)
- [6. Automated Semantic Tagging & Categorization](#6-automated-semantic-tagging--categorization)
- [7. Bulk Spreadsheet Ingestion & Demographic Analytics](#7-bulk-spreadsheet-ingestion--demographic-analytics)
- [8. Event-Type Exclusive Governance Modules](#8-event-type-exclusive-governance-modules)
- [9. Pure Vector PDF Generation Engine](#9-pure-vector-pdf-generation-engine)
- [10. LaTeX AST Transformer & Custom Template Studio](#10-latex-ast-transformer--custom-template-studio)
- [11. Cloud Persistence, Drag-and-Drop Sequencing & Security Architecture](#11-cloud-persistence-drag-and-drop-sequencing--security-architecture)

---

### 1. 3-Path Quick-Start Creation Hub

When an organizer clicks the primary **`New Report`** trigger in the application header or dashboard, UniReport intercepts the request to prevent blank-canvas paralysis. The application initiates the `CreateReportWizard` modal, which manages three distinct ingestion pipelines:

- **Autonomous Synthesis (REGAN Fast-Track)**: When the user selects this pathway, the wizard hands control over to the REGAN Studio interface. The user pastes messy text, such as rough speaker notes, an email chain containing an event itinerary, or raw bullet points. The system sends this payload to the server-side `/api/regan/generate` endpoint, which invokes the Google Gemini model (default `gemini-2.5-flash` or configured `GEMINI_MODEL`). The AI engine parses the unstructured text, extracting event dates, identifying keynote speakers, creating executive summaries, and inferring academic departments. The structured output is mapped directly onto the master `Report` data contract, instantly opening the editor with all core fields populated.
- **Accredited Institutional Standard Templates**: For faculty members who need to comply with specific accreditation bodies, selecting this pathway bypasses manual configuration. The system clones pre-configured standard schemas—such as the *NAAC/ABET Accredited Conference Template*, the *National Hackathon Framework*, the *Hands-on DevOps Workshop Module*, or the *Department Board of Studies Blueprint*. Each template pre-loads official course-outcome mappings, standardized assessment rubrics, and sponsor structures into the new report state.
- **Guided Blank Report Creation**: When the user opts to start from scratch, the system creates a clean `Report` entity assigned with a unique UUID (`crypto.randomUUID()`). The system immediately initiates a non-blocking background request to `/api/gemini/suggest-tags`, which analyzes the provisional title and event category to generate relevant organizational tags while the user begins typing.

---

### 2. 3-Stage Progressive Workflow & Dynamic Readiness Engine

UniReport organizes event documentation into a sequential three-stage lifecycle rather than presenting a flat, overwhelming cluster of tabs:

- **Stage 1: Identity & Participants**: This milestone guides the author through setting the basic event parameters, including event title, location, host department, organizing committee contacts, participant rosters, attendance matrices, and keynote speaker biographies.
- **Stage 2: Proceedings & Outcomes**: This milestone captures the qualitative and academic outputs of the event. The author compiles the executive summary, polishes rough session notes, and completes specialized governance modules, such as Bloom's Taxonomy ratings for academic conferences, winner rosters for hackathons, or action-item deadlines for board meetings.
- **Stage 3: Media & Publication**: The final milestone manages photographic evidence and generates the official vector document. The user uploads captioned high-resolution images, sets the primary cover banner, configures watermark and institutional seal settings, and downloads the archival-quality PDF.

The **Dynamic Readiness Engine** continuously tracks the completeness of the report. The calculation function inspects the active document across six core dimensions:
1. **Event Identity & Venue**: Verified presence of event title, date, and campus venue.
2. **Positive Headcount**: Total registered attendees > 0.
3. **Keynote Documentation**: At least 1 registered speaker or distinguished guest.
4. **Proceedings Summary**: Presence of a finalized or polished summary narrative (>= 60 characters).
5. **Specialized Governance Criteria**: Populated accreditation mapping, hackathon prizes, workshop exercises, or meeting minutes.
6. **Media / Finalization Lock**: At least 1 captioned photograph or an explicit finalization lock toggle.

Each fulfilled dimension contributes approximately 16.67% toward the total score (0% to 100%). Once the calculated score crosses the **80% threshold** and all mandatory fields are satisfied, the interface transitions from a numerical progress bar to an illuminated **`Publication Ready`** badge.

---

### 3. Real-Time Side-by-Side Live Document Desk

The Live Document Desk allows authors to preview the final rendered output while actively filling out form fields. When the user toggles **`Enable Live Split Canvas`**, the viewport layout transitions into a responsive multi-column grid:

The left column (occupying 60% of the screen width) displays the active form step with its input fields, text areas, and sliders. The right column (occupying 40% of the screen width) renders a simulated A4 paper document encased in an archival dark workstation frame. The live document card subscribes directly to the top-level `currentReport` React state. 

As the user modifies fields—such as typing the event title, adjusting attendance numbers, or editing the executive summary—the changes propagate down the component tree without debouncing delays, updating the typography, institutional header, attendance tables, and keynote cards in the preview canvas. The live canvas also includes an instant PDF generation button, allowing the user to produce an official vector document directly from the split-screen view without navigating away from their current editing step.

---

### 4. REGAN Automated Synthesis Studio

REGAN (Report Generator & Automated Narrative Synthesizer) acts as an application-level agent layer built on top of the Google Gemini API. The studio functions through two primary mechanisms:

- **Full End-to-End Synthesis (`POST /api/regan/generate`)**: The author enters raw, unstructured event notes into the synthesis prompt. The text is packaged with contextual information about the active user and sent to the server. The Gemini model uses system prompts instructing it to act as an institutional registrar. It analyzes the raw notes, extracts key entities, structures them according to the `Report` interface, and returns a complete, formatted document draft that populates the entire workspace in a single step.
- **Targeted Section-by-Section "Sync & Refresh" (`POST /api/regan/regenerate-section`)**: When an author only needs to update a specific portion of an existing report, REGAN provides isolated synchronization tools:
  - *Sync Executive Summary*: Reads the raw scratchpad notes and regenerates the narrative summary in formal academic prose without modifying attendee counts or guest lists.
  - *Sync Keynotes & VIPs*: Scans the input text specifically for speaker names, designations, and organizational affiliations, updating only the `guests` array.
  - *Sync Accreditation & CO/PO*: Extracts pedagogical objectives, maps them to standard Course Outcomes (`CO1` to `CO6`) and Program Outcomes (`PO1` to `PO12`), and assigns Bloom's Taxonomy cognitive tiers.
  - *Sync Attendance Breakdown*: Parses numeric figures in the text to calculate demographic splits between students, faculty, and industry delegates.

---

### 5. Multi-Turn Gemini Institutional Copilot

The Gemini Institutional Copilot provides contextual, multi-turn AI assistance throughout the authoring process. The copilot drawer maintains an active conversation history that is transmitted to the server-side `/api/gemini/chat` endpoint:

The backend formats each request with a system prompt that injects the current state of the active report—including its title, department, attendance figures, and draft notes—as grounding context. The copilot provides four specialized operational personas:
- **Proceedings Lead**: Specializes in formal university prose, institutional resolutions, and strategic recommendations.
- **Accreditation & OBE Specialist**: Analyzes curriculum alignments, maps engineering criteria, and checks compliance with NAAC Criteria 3 and 6 or ABET standards.
- **Metrics & Attainment Analyst**: Computes percentage changes in pre- and post-workshop assessments, satisfaction ratings, and participant demographics.
- **Keynote & Citations Specialist**: Generates formal biographical introductions, guest speaker citations, and award commendations.

Every message generated by the copilot includes an **`Apply to Report Summary`** action button. Clicking this button extracts the generated text and appends or inserts it directly into the active report's summary field, eliminating manual copy-pasting.

---

### 6. Automated Semantic Tagging & Categorization

The tagging system automates document classification for institutional archives. When a report is created or its core metadata is modified, the client dispatches a payload containing the title, event type, department, and organizing institution to `/api/gemini/suggest-tags`:

The server invokes the Gemini model using a system prompt configured for structured JSON generation (`responseMimeType: "application/json"`). The model evaluates the metadata against academic taxonomies and returns an array of recommended tags along with a brief explanation of its reasoning.

The client renders these suggestions in an interactive recommendation strip. The author can click **`Accept All`** to add all suggested tags at once, click individual chips to accept specific tags, or dismiss suggestions that do not apply. If the server is offline or the Gemini API is unavailable, a client-side heuristic fallback engine analyzes keyword patterns in the title (such as "workshop," "hackathon," or "board") to supply sensible categorization tags.

---

### 7. Bulk Spreadsheet Ingestion & Demographic Analytics

The Attendance module simplifies participant tracking by automating demographic calculations from raw spreadsheet data:

The author copies rows directly from Microsoft Excel, Google Sheets, or a CSV export and pastes them into the raw roster text area. The client-side parser processes the text line by line, executing regular expression patterns against job titles, designations, and institutional email addresses:
- Rows containing keywords like "Student," "Undergraduate," "Scholar," or academic student email patterns are counted toward the student total.
- Rows containing "Professor," "Lecturer," "Dean," "Faculty," or "Chair" are assigned to the faculty total.
- Rows containing corporate domains or titles like "Engineer," "Director," "Manager," or "Consultant" are categorized as external industry delegates.

The system updates the demographic matrix in real time, calculating relative percentages and rendering a proportional vector demographic bar. The module also provides a satisfaction rating slider (1.0 to 5.0 stars) that dynamically displays benchmark indicators:
- **Needs Quality Review**: score < 3.8
- **Good / Satisfactory**: 3.8 <= score < 4.3
- **Excellent Engagement**: 4.3 <= score < 4.8
- **Outstanding (Institutional Benchmark)**: score >= 4.8

---

### 8. Event-Type Exclusive Governance Modules

UniReport adapts its governance data capture based on the selected `eventType`, presenting specialized fields tailored to each type of event:

- **Conference & Seminar (Accreditation & OBE Governance)**: Captures Course Outcome mappings (e.g., `CO-1`, `CO-4`) and Program Outcome alignments (`PO-1` through `PO-12`). The author selects the appropriate Bloom's Taxonomy cognitive tier (L1 Remember through L6 Create) and enters the measured Outcome-Based Education assessment percentage (0% to 100%). A formal compliance toggle allows the Head of Department to record formal sign-off, which renders an official verification block on the exported PDF.
- **Hackathon (Tracks, Repositories & Prize Leaderboard)**: Records problem statements, technical challenge descriptions, and repository URLs (such as GitHub or Devpost links). The module includes a dynamic prize table where organizers record team rankings, project titles, and awarded cash amounts.
- **Meeting (Minutes, Resolutions & Action Items Matrix)**: Manages parliamentary records for board and committee meetings. Organizers catalog agenda items, record ratified resolutions, and manage an interactive Action Items Matrix. Each action item tracks the task description, assignee, and target deadline, with a three-state toggle (`Pending` -> `In Progress` -> `Completed`).
- **Workshop (Toolchains, Lab Exercises & Pedagogical Skill Gains)**: Documents hands-on technical training sessions. Organizers track software toolchains, frameworks used, and practical lab assignments. The module features pre-assessment and post-assessment score sliders (0 to 100) that automatically compute the net percentage skill gain:
```
Skill Gain % = ((Post Assessment Score - Pre Assessment Score) / Pre Assessment Score) * 100
```
- **Exhibition & Social (Footfall, Booths & Media Coverage)**: Tracks public engagement metrics, including total exhibitor booths, estimated campus and community footfall, featured showcase exhibits, and links to institutional press releases.

---

### 9. Pure Vector PDF Generation Engine

The PDF generation engine compiles publication-ready documents directly within the user's browser using `jspdf`, eliminating the need for server-side rendering or headless browser dependencies:

- **Coordinate Grid & Dynamic Page Layout**: The engine operates on an ISO A4 grid (210 mm x 297 mm) with standard margins (18 mm horizontal, 20 mm top). A cursor variable ($Y_{\text{pos}}$) tracks vertical layout progress. Before rendering each text block, table, or image, the engine checks whether the content fits within the remaining page height ($Y_{\text{pos}} > 265\text{ mm}$). When content exceeds the page boundary, the engine automatically creates a new page, prints running headers and footers, and resets the cursor to the top margin ($Y_{\text{pos}} = 30\text{ mm}$).
- **Archival Typography & Vector Graphic Elements**: The compiler draws institutional header banners, colored category badges, and structured attendance tables using pure vector primitives (`rect`, `line`, `circle`). An institutional seal emblem is rendered on the first page, and configurable watermark overlays (`Official Proceeding`, `Confidential`, `Draft Archive`) are applied across pages at a -45 degrees angle with 0.08 opacity.
- **Running Footers & Verification Signatures**: Every compiled page includes a running footer showing generation timestamps, document hash identifiers, and dynamic page numbering (*Page X of Y*). The final page renders formal signature blocks for the Event Coordinator, Department Chair, and Academic Dean.

---

### 10. LaTeX AST Transformer & Custom Template Studio

UniReport bridges the gap between web-based reporting and traditional academic typesetting through two specialized tools:

- **LaTeX AST Drop-In Importer (`LatexTransformerModal.tsx`)**: Authors can paste raw `.tex` source code from LaTeX document classes (such as `article`, `ieeeconf`, or `acmart`). The built-in regular expression and Abstract Syntax Tree (AST) parser extracts the title from `\title{}`, author and institutional affiliations from `\author{}`, and section headings from `\section{}` and `\subsection{}` tags. It also parses tabular environments (`\begin{tabular}`) to populate attendance numbers and keynote lists, converting raw LaTeX code into structured database records in one step.
- **Visual Template Customizer (`TemplateCustomizerModal.tsx`)**: Allows departments to create standardized document templates. Administrators can pre-configure default department names, institutional headers, standard disclaimer text, default sponsor lists, and custom color themes, ensuring visual and structural consistency across all departmental reports.

---

### 11. Cloud Persistence, Drag-and-Drop Sequencing & Security Architecture

UniReport uses a dual-layer persistence model combining cloud synchronization with client-side caching:

- **Firebase Authentication & Cloud Firestore**: User identities are managed through Firebase Authentication, supporting Google One-Click OAuth and verified email/password sign-in. Each report document is stored in Firestore under `/reports/{reportId}` with an explicit `userId` attribute. Security rules (`firestore.rules`) enforce document-level access control, ensuring that only authenticated users can read, update, or delete their own reports.
- **Drag-and-Drop Dashboard Reordering**: The dashboard allows users to prioritize and reorder their report cards using drag-and-drop handles or nudge buttons. When the order changes, the updated sequence of report IDs is saved to the user's profile document in Firestore (`/users/{userId}` under `reportOrder: string[]`), ensuring that custom display preferences persist across devices.
- **Offline Resilience & Auto-Save Bus**: All editing actions trigger an auto-save handler that updates the local cache (`localStorage`) immediately before dispatching debounced writes to Firestore. This guarantees that work is preserved even during network interruptions or unexpected browser restarts.
