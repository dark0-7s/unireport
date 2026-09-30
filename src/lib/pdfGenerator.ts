import { jsPDF } from "jspdf";
import { Report, User, CustomTemplate } from "../types";

export interface PDFExportOptions {
  watermark?: "none" | "official" | "confidential" | "draft" | "custom" | "logo";
  watermarkMode?: "text" | "logo" | "none";
  customWatermarkText?: string;
  watermarkLogoUrl?: string;
  watermarkOpacity?: number;
  watermarkRotation?: number;
  showSeal?: boolean;
  customSealUrl?: string;
  includeUniReportBranding?: boolean;
}

function hexToRgb(hex?: string, fallback: [number, number, number] = [49, 46, 129]): [number, number, number] {
  if (!hex || typeof hex !== "string") return fallback;
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  return fallback;
}

export function downloadReportPDF(
  report: Report,
  user: User,
  customTemplate?: CustomTemplate | null,
  options?: PDFExportOptions
): void {
  const pageOrientation = customTemplate?.layout?.pageOrientation || "portrait";
  const doc = new jsPDF({
    orientation: pageOrientation,
    unit: "mm",
    format: "a4",
  });

  const font = customTemplate?.typography?.fontFamily || "helvetica";
  const primaryIndigo = hexToRgb(customTemplate?.typography?.primaryColor, [49, 46, 129]); // Indigo 900
  const accentIndigo = hexToRgb(customTemplate?.typography?.accentColor, [79, 70, 229]);  // Indigo 600
  const slateDark: [number, number, number] = [30, 41, 59];
  const slateMuted: [number, number, number] = [100, 116, 139];
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const amberGold: [number, number, number] = [217, 119, 6];
  const purpleViolet: [number, number, number] = [139, 92, 246];

  // Watermark options resolution (customTemplate defaults if not overridden)
  const templateWm = customTemplate?.watermarkConfig;
  const watermarkOption = options?.watermark || templateWm?.preset || "official";
  const watermarkMode = options?.watermarkMode || templateWm?.mode || "text";
  const showSeal = options?.showSeal !== undefined ? options.showSeal : (templateWm?.showSeal ?? true);
  const includeUniReport = options?.includeUniReportBranding !== undefined ? options.includeUniReportBranding : (!templateWm?.removeUniReportBranding);

  const PAGE_WIDTH = pageOrientation === "landscape" ? 297 : 210;
  const PAGE_HEIGHT = pageOrientation === "landscape" ? 210 : 297;
  
  // Custom margin calculations
  const leftMarginMm = customTemplate?.margins?.left ?? 20;
  const rightMarginMm = customTemplate?.margins?.right ?? 20;
  const bottomMarginMm = customTemplate?.margins?.bottom ?? 52;
  
  const MARGIN_LEFT = leftMarginMm;
  const MARGIN_RIGHT = PAGE_WIDTH - rightMarginMm;
  const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT;
  const BOTTOM_MARGIN = PAGE_HEIGHT - bottomMarginMm;

  // Helper to draw top accent header stripe
  const drawPageHeader = (pageNumber: number) => {
    // Top Accent Stripe
    doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
    doc.rect(0, 0, PAGE_WIDTH, 8, "F");

    if (pageNumber > 1) {
      // Running header on page 2+
      doc.setFont(font, "bold");
      doc.setFontSize(8);
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      const org = report.content.eventDetails.organization || user.organization || "INSTITUTIONAL EVENT PROCEEDINGS";
      doc.text(org.toUpperCase(), MARGIN_LEFT, 15);
      doc.setFont(font, "normal");
      doc.text(report.title || "Official Event Report", MARGIN_LEFT, 20);

      doc.setDrawColor(226, 232, 240);
      doc.line(MARGIN_LEFT, 23, MARGIN_RIGHT, 23);
    }
  };

  // Helper to draw official institutional seal emblem
  const drawOfficialSeal = (x: number, y: number) => {
    // Outer seal circle
    doc.setDrawColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.setLineWidth(0.8);
    doc.circle(x, y, 11, "S");

    // Inner dashed ring
    doc.setDrawColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
    doc.setLineWidth(0.3);
    doc.circle(x, y, 9.5, "S");

    // Center star / emblem fill
    doc.setFillColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.circle(x, y, 2.5, "F");

    // Seal text arc/label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.5);
    doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.text("OFFICIAL SEAL", x - 7, y - 5);
    doc.text("VERITAS", x - 4.5, y + 6.5);
  };

  // Helper to check overflow and add page if needed
  const checkPageOverflow = (currentY: number, requiredSpace: number): number => {
    if (currentY + requiredSpace > BOTTOM_MARGIN) {
      doc.addPage();
      const newPage = doc.getNumberOfPages();
      drawPageHeader(newPage);
      return 32; // Reset Y below page 2+ header
    }
    return currentY;
  };

  // START PAGE 1
  drawPageHeader(1);

  // Draw seal on top right of page 1 if enabled
  if (showSeal) {
    drawOfficialSeal(178, 26);
  }

  // Institution Header
  doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const org = report.content.eventDetails.organization || user.organization || "INSTITUTIONAL EVENT PROCEEDINGS";
  doc.text(org.toUpperCase(), MARGIN_LEFT, 20);

  // Department Subheader
  if (report.content.eventDetails.department) {
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(report.content.eventDetails.department, MARGIN_LEFT, 26);
  }

  // Report Title
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(report.title || "Official Event Report", MARGIN_LEFT, 36);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_LEFT, 42, MARGIN_RIGHT, 42);

  // Metadata Grid
  doc.setFontSize(8.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.setFont("helvetica", "bold");
  doc.text("EVENT DATE", MARGIN_LEFT, 50);
  doc.text("LOCATION / VENUE", 70, 50);
  doc.text("EVENT TYPE", 135, 50);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(report.content.eventDetails.date || "Not specified", MARGIN_LEFT, 56);
  doc.text(report.content.eventDetails.location || "Main Campus", 70, 56);
  doc.text(report.content.eventDetails.eventType || "Conference", 135, 56);

  // ==========================================
  // ATTENDANCE & VISUAL DEMOGRAPHIC CHART BLOCK
  // ==========================================
  let y = 64;
  const att = report.content.attendance;
  const total = att.totalAttendees || 0;
  const students = att.studentCount || 0;
  const faculty = att.facultyCount || 0;
  const external = att.externalCount || 0;
  const virtualAtt = att.virtualAttendees || 0;
  const rating = att.satisfactionRating || 5.0;

  // Background Box
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 44, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 44, "D");

  // Box Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.text("ATTENDANCE AUDIT & DEMOGRAPHIC BREAKDOWN", MARGIN_LEFT + 5, y + 7);

  // Headcount Summary Row
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Total Headcount: ${total}`, MARGIN_LEFT + 5, y + 14);
  doc.text(`Students: ${students}`, MARGIN_LEFT + 42, y + 14);
  doc.text(`Faculty: ${faculty}`, MARGIN_LEFT + 75, y + 14);
  doc.text(`Industry / External: ${external}`, MARGIN_LEFT + 105, y + 14);

  // Satisfaction Badge
  doc.setFont("helvetica", "bold");
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`Satisfaction: ${rating.toFixed(1)} / 5.0 ★`, MARGIN_LEFT + 138, y + 14);

  // VISUAL PROGRESS / DEMOGRAPHIC BAR
  const barY = y + 19;
  const barWidth = CONTENT_WIDTH - 10;
  const barHeight = 8;
  const barX = MARGIN_LEFT + 5;

  // Empty bar background
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(barX, barY, barWidth, barHeight, 1.5, 1.5, "F");

  if (total > 0) {
    const studentRatio = Math.min(students / total, 1);
    const facultyRatio = Math.min(faculty / total, 1 - studentRatio);
    const externalRatio = Math.min(external / total, 1 - studentRatio - facultyRatio);
    const virtualRatio = Math.min(virtualAtt / total, 1 - studentRatio - facultyRatio - externalRatio);

    let currentX = barX;

    // Student segment (Indigo)
    if (studentRatio > 0) {
      const segW = barWidth * studentRatio;
      doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
      doc.rect(currentX, barY, segW, barHeight, "F");
      currentX += segW;
    }

    // Faculty segment (Emerald)
    if (facultyRatio > 0) {
      const segW = barWidth * facultyRatio;
      doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.rect(currentX, barY, segW, barHeight, "F");
      currentX += segW;
    }

    // External segment (Amber)
    if (externalRatio > 0) {
      const segW = barWidth * externalRatio;
      doc.setFillColor(amberGold[0], amberGold[1], amberGold[2]);
      doc.rect(currentX, barY, segW, barHeight, "F");
      currentX += segW;
    }

    // Virtual segment (Purple)
    if (virtualRatio > 0) {
      const segW = barWidth * virtualRatio;
      doc.setFillColor(purpleViolet[0], purpleViolet[1], purpleViolet[2]);
      doc.rect(currentX, barY, segW, barHeight, "F");
    }
  }

  // Demographic Legend Row Below Bar
  const legY = y + 34;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");

  // Students Legend
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(barX, legY - 2.5, 3, 3, "F");
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const stuPct = total > 0 ? Math.round((students / total) * 100) : 0;
  doc.text(`Students: ${stuPct}% (${students})`, barX + 5, legY);

  // Faculty Legend
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.rect(barX + 42, legY - 2.5, 3, 3, "F");
  const facPct = total > 0 ? Math.round((faculty / total) * 100) : 0;
  doc.text(`Faculty: ${facPct}% (${faculty})`, barX + 47, legY);

  // External Legend
  doc.setFillColor(amberGold[0], amberGold[1], amberGold[2]);
  doc.rect(barX + 85, legY - 2.5, 3, 3, "F");
  const extPct = total > 0 ? Math.round((external / total) * 100) : 0;
  doc.text(`External: ${extPct}% (${external})`, barX + 90, legY);

  // Satisfaction Gauge Tag
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(barX + 128, legY - 3.5, 32, 5.5, 1, 1, "FD");
  doc.setTextColor(6, 95, 70);
  doc.text(`Impact Score: ${rating >= 4.5 ? "Exceptional" : "Approved"}`, barX + 130, legY);

  y += 54;

  // ==========================================
  // EXECUTIVE SUMMARY NARRATIVE (WITH OVERFLOW)
  // ==========================================
  y = checkPageOverflow(y, 35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.text("EXECUTIVE PROCEEDINGS SUMMARY", MARGIN_LEFT, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  const summaryContent =
    report.content.summary.finalizedText ||
    report.content.summary.polishedText ||
    report.content.summary.rawNotes ||
    "No summary text provided for this report.";

  const splitSummary = doc.splitTextToSize(summaryContent, CONTENT_WIDTH);

  // Print paragraph lines with multi-page handling
  for (let i = 0; i < splitSummary.length; i++) {
    y = checkPageOverflow(y, 6);
    doc.text(splitSummary[i], MARGIN_LEFT, y);
    y += 5;
  }
  y += 10;

  // ==========================================
  // DISTINGUISHED SPEAKERS & GUESTS
  // ==========================================
  if (report.content.guests && report.content.guests.length > 0) {
    y = checkPageOverflow(y, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.text("DISTINGUISHED SPEAKERS & GUESTS", MARGIN_LEFT, y);
    y += 7;

    report.content.guests.forEach((guest) => {
      y = checkPageOverflow(y, 20);

      // Guest Role Pill & Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text(`${guest.name} (${guest.role})`, MARGIN_LEFT, y);

      if (guest.organization || guest.designation) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
        doc.text(`— ${guest.designation || ""} ${guest.organization ? `· ${guest.organization}` : ""}`, MARGIN_LEFT + doc.getTextWidth(`${guest.name} (${guest.role}) `), y);
      }
      y += 5;

      if (guest.bio) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
        const bioLines = doc.splitTextToSize(guest.bio, CONTENT_WIDTH);
        for (let b = 0; b < bioLines.length; b++) {
          y = checkPageOverflow(y, 5);
          doc.text(bioLines[b], MARGIN_LEFT, y);
          y += 4;
        }
      }
      y += 3;
    });
    y += 6;
  }

  // ===============================================================
  // EVENT-SPECIFIC SPECIALIZED SECTION (RESPECTIVE TO EVENT TYPE)
  // ===============================================================
  const eventType = report.content.eventDetails.eventType;

  // 1. Conference & Seminar: Academic Accreditation & Outcome Mapping
  if ((eventType === "Conference" || eventType === "Seminar") && report.content.accreditation) {
    const acc = report.content.accreditation;
    y = checkPageOverflow(y, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.text("ACADEMIC ACCREDITATION & OUTCOME (CO/PO) COMPLIANCE", MARGIN_LEFT, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    if (acc.programName) {
      doc.text(`Academic Program: ${acc.programName}`, MARGIN_LEFT, y);
      y += 5;
    }
    if (acc.bloomsLevel) {
      doc.text(`Bloom's Cognitive Level: ${acc.bloomsLevel}`, MARGIN_LEFT, y);
      y += 5;
    }
    if (acc.courseOutcomeMapping) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      const coLines = doc.splitTextToSize(`Outcome Mapping: ${acc.courseOutcomeMapping}`, CONTENT_WIDTH);
      for (const line of coLines) {
        y = checkPageOverflow(y, 5);
        doc.text(line, MARGIN_LEFT, y);
        y += 4.5;
      }
    }
    if (acc.feedbackSummary) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      const fbLines = doc.splitTextToSize(`Participant Feedback: ${acc.feedbackSummary}`, CONTENT_WIDTH);
      for (const line of fbLines) {
        y = checkPageOverflow(y, 5);
        doc.text(line, MARGIN_LEFT, y);
        y += 4.5;
      }
    }
    if (acc.hodSignOffApproved) {
      y = checkPageOverflow(y, 10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.text(`✓ Formally Approved by Academic Chair: ${acc.hodName || "Dean"} (${acc.hodTitle || "Head of Department"})`, MARGIN_LEFT, y);
      y += 6;
    }
    y += 5;
  }

  // 2. Hackathon: Innovation, Problem Statements & Winning Teams
  else if (eventType === "Hackathon") {
    const hack = report.content.hackathon;
    const awards = hack?.awards || report.content.awards || [];
    if (awards.length > 0 || (hack?.problemStatements && hack.problemStatements.length > 0)) {
      y = checkPageOverflow(y, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
      doc.text("HACKATHON INNOVATION, CHALLENGES & WINNING TEAMS", MARGIN_LEFT, y);
      y += 7;

      if (hack?.submissionCount) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text(`Submissions: ${hack.submissionCount} Teams | Finalists Evaluated: ${hack.shortlistedCount || 10}`, MARGIN_LEFT, y);
        y += 5;
      }

      if (awards.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text("Distinguished Award Winners & Cash Grants:", MARGIN_LEFT, y);
        y += 5;

        awards.forEach((awd) => {
          y = checkPageOverflow(y, 10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
          doc.text(`• ${awd.title}: ${awd.recipientName}`, MARGIN_LEFT + 2, y);

          if (awd.prize || awd.category) {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
            const detailsText = ` [${awd.category ? `Track: ${awd.category} | ` : ""}Prize: ${awd.prize || "Certificate"}]`;
            doc.text(detailsText, MARGIN_LEFT + 4 + doc.getTextWidth(`• ${awd.title}: ${awd.recipientName}`), y);
          }
          y += 4.5;
        });
        y += 3;
      }
      y += 4;
    }
  }

  // 3. Meeting: Minutes, Resolutions & Action Items Table
  else if (eventType === "Meeting") {
    const meet = report.content.meeting;
    if (meet) {
      y = checkPageOverflow(y, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
      doc.text("OFFICIAL COMMITTEE MINUTES, RESOLUTIONS & ACTION ITEMS", MARGIN_LEFT, y);
      y += 7;

      if (meet.meetingType || meet.presidedBy) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text(`Committee: ${meet.meetingType || "Department Board"} | Presided By: ${meet.presidedBy || "Chairperson"}`, MARGIN_LEFT, y);
        y += 5.5;
      }

      if (meet.resolutionsPassed && meet.resolutionsPassed.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
        doc.text("Ratified Resolutions:", MARGIN_LEFT, y);
        y += 5;

        meet.resolutionsPassed.forEach((res) => {
          y = checkPageOverflow(y, 8);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
          const lines = doc.splitTextToSize(`✓ ${res}`, CONTENT_WIDTH);
          for (const l of lines) {
            doc.text(l, MARGIN_LEFT + 2, y);
            y += 4.2;
          }
        });
        y += 3;
      }

      if (meet.actionItems && meet.actionItems.length > 0) {
        y = checkPageOverflow(y, 15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text("Action Items & Assignee Matrix:", MARGIN_LEFT, y);
        y += 5;

        meet.actionItems.forEach((act) => {
          y = checkPageOverflow(y, 10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
          doc.text(`• [${act.status}] ${act.action}`, MARGIN_LEFT + 2, y);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
          doc.text(`   Assignee: ${act.assignedTo} | Deadline: ${act.deadline}`, MARGIN_LEFT + 2, y + 4);
          y += 8;
        });
      }
      y += 4;
    }
  }

  // 4. Workshop: Lab Exercises & Skill Metrics
  else if (eventType === "Workshop") {
    const ws = report.content.workshop;
    if (ws) {
      y = checkPageOverflow(y, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
      doc.text("HANDS-ON LABORATORY EXERCISES & PEDAGOGICAL SKILL GAIN", MARGIN_LEFT, y);
      y += 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      const pre = ws.preAssessmentAverage ?? 45;
      const post = ws.postAssessmentAverage ?? 88;
      const gain = Math.max(0, post - pre);
      doc.text(`Technical Rigor: ${ws.skillLevel || "Intermediate"} Level | Competency Gain: +${gain}% (Pre: ${pre}% -> Post: ${post}%)`, MARGIN_LEFT, y);
      y += 5.5;

      if (ws.softwareToolsUsed && ws.softwareToolsUsed.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
        doc.text(`Toolchain & SDKs: ${ws.softwareToolsUsed.join(", ")}`, MARGIN_LEFT, y);
        y += 5;
      }

      if (ws.handsOnExercises && ws.handsOnExercises.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text("Practical Lab Milestones Completed:", MARGIN_LEFT, y);
        y += 4.5;

        ws.handsOnExercises.forEach((lab, idx) => {
          y = checkPageOverflow(y, 6);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
          doc.text(`Milestone ${idx + 1}: ${lab}`, MARGIN_LEFT + 2, y);
          y += 4.5;
        });
      }
      y += 4;
    }
  }

  // 5. Exhibition & Social: Public Showcase & Footfall
  else if (eventType === "Exhibition" || eventType === "Social") {
    const exh = report.content.exhibition;
    if (exh) {
      y = checkPageOverflow(y, 25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
      doc.text("EXHIBITION SHOWCASE DEMOGRAPHICS & HIGHLIGHTS", MARGIN_LEFT, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text(`Stalls / Booths: ${exh.stallsOrBoothsCount || 0} | Estimated Footfall: ${exh.estimatedFootfall || 0} Visitors`, MARGIN_LEFT, y);
      y += 5.5;

      if (exh.bestExhibitAward) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
        doc.text(`Best Exhibit Citation: ${exh.bestExhibitAward}`, MARGIN_LEFT, y);
        y += 5;
      }
      y += 3;
    }
  }

  // ==========================================
  // SIGNATURES & OFFICIAL SEAL BLOCK
  // ==========================================
  // Check if signatures fit on current page; otherwise break to next page
  y = checkPageOverflow(y, 38);

  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`Report Prepared By: ${report.content.eventDetails.organizerName || user.name}`, MARGIN_LEFT, y);
  doc.text(`Official Email: ${report.content.eventDetails.organizerEmail || user.email || "Verified"}`, MARGIN_LEFT, y + 4.5);
  doc.text(`Archival ID: ${report.id}`, MARGIN_LEFT, y + 9);

  // Committee Sign-off box on right
  doc.text("Official Department Sign-Off / Verification", 125, y);
  doc.setDrawColor(180, 180, 180);
  doc.line(125, y + 14, MARGIN_RIGHT, y + 14);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature & Date", 125, y + 18);

  // ==========================================
  // FOOTER & WATERMARK PASS ACROSS ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Apply Watermark if enabled
    const isLogoWatermark = options?.watermarkMode === "logo" || watermarkOption === "logo";
    const isWatermarkEnabled = watermarkOption !== "none" && options?.watermarkMode !== "none";

    if (isWatermarkEnabled) {
      if (isLogoWatermark && options?.watermarkLogoUrl) {
        // Draw centered logo watermark on this page
        try {
          const logoW = 85;
          const logoH = 85;
          const logoX = (PAGE_WIDTH - logoW) / 2;
          const logoY = (PAGE_HEIGHT - logoH) / 2;

          // Apply opacity if supported by jsPDF GState
          const GState = (doc as any).GState;
          if (GState && typeof (doc as any).setGState === "function") {
            (doc as any).setGState(new GState({ opacity: options.watermarkOpacity || 0.08 }));
          }

          doc.addImage(
            options.watermarkLogoUrl,
            "PNG",
            logoX,
            logoY,
            logoW,
            logoH,
            undefined,
            "FAST"
          );

          if (GState && typeof (doc as any).setGState === "function") {
            (doc as any).setGState(new GState({ opacity: 1.0 }));
          }
        } catch (err) {
          console.warn("Could not render logo watermark on page", p, err);
        }
      } else {
        // Draw text watermark
        const watermarkText =
          watermarkOption === "custom" && options?.customWatermarkText?.trim()
            ? options.customWatermarkText.trim().toUpperCase()
            : watermarkOption === "official"
            ? "OFFICIAL PROCEEDINGS"
            : watermarkOption === "confidential"
            ? "CONFIDENTIAL"
            : watermarkOption === "draft"
            ? "DRAFT REPORT"
            : options?.customWatermarkText?.trim()
            ? options.customWatermarkText.trim().toUpperCase()
            : "OFFICIAL PROCEEDINGS";

        const GState = (doc as any).GState;
        if (GState && typeof (doc as any).setGState === "function") {
          (doc as any).setGState(new GState({ opacity: options?.watermarkOpacity || 0.09 }));
        }

        doc.setFont("helvetica", "bold");
        const fontSize = watermarkText.length > 22 ? 28 : watermarkText.length > 14 ? 34 : 40;
        doc.setFontSize(fontSize);
        doc.setTextColor(220, 224, 233); // Very light subtle gray

        const angle = options?.watermarkRotation !== undefined ? options.watermarkRotation : 45;

        // Draw centered diagonally
        doc.text(watermarkText, PAGE_WIDTH / 2, PAGE_HEIGHT / 2, {
          align: "center",
          angle: angle,
        });

        if (GState && typeof (doc as any).setGState === "function") {
          (doc as any).setGState(new GState({ opacity: 1.0 }));
        }
      }
    }

    // Dynamic Page Numbering Footer ("Page X of Y")
    const footerY = 286;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, footerY - 4, MARGIN_RIGHT, footerY - 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);

    const generatedDate = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const leftFooterText =
      options?.includeUniReportBranding !== false
        ? `UniReport Document System · Generated on ${generatedDate}`
        : `Official Proceedings · Generated on ${generatedDate}`;

    doc.text(leftFooterText, MARGIN_LEFT, footerY);
    doc.text(
      `Page ${p} of ${totalPages}`,
      MARGIN_RIGHT,
      footerY,
      { align: "right" }
    );
  }

  // Trigger download
  const filename = (report.title || "Event-Proceedings").replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
  doc.save(filename);
}
