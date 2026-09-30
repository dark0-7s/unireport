import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  Zap,
  Play,
  CheckCircle2,
  FileText,
  Code2,
  Eye,
  Sliders,
  Download,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  MapPin,
  Users,
  Award,
  BookOpen,
  Building,
  Terminal,
  ChevronRight,
  Maximize2,
  Minimize2,
  Cpu,
  Columns,
  MessageSquareCode,
  Wand2,
  GraduationCap,
  Briefcase,
  FlaskConical,
  HeartHandshake,
  Rocket,
  Lightbulb,
  RotateCw,
  SlidersHorizontal,
  Star,
  CheckCheck,
  Plus,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from "lucide-react";
import {
  Report,
  User,
  EventType,
  Guest,
  AwardItem,
  SponsorItem,
  MeetingActionItem,
  CustomTemplate,
} from "../types";
import { downloadReportPDF } from "../lib/pdfGenerator";
import { getCustomTemplates } from "../lib/customTemplatesStorage";

interface ReganStudioProps {
  currentReport: Report | null;
  currentUser: User;
  onApplyReportToApp: (generatedReport: Partial<Report>) => void;
  onClose: () => void;
}

export type OrganizationType =
  | "university"
  | "corporate"
  | "research"
  | "nonprofit"
  | "student_club";

export type StudioTab = "prompt" | "editor" | "sync_refresh" | "json";

interface OrgTypeConfig {
  id: OrganizationType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultEventType: EventType;
  smartSuggestions: {
    id: string;
    title: string;
    description: string;
    promptInjection: string;
    sectionTarget?: "summary" | "guests" | "attendance" | "domainOutcomes" | "eventDetails";
  }[];
}

const ORG_TYPE_CONFIGS: Record<OrganizationType, OrgTypeConfig> = {
  university: {
    id: "university",
    label: "University / Higher Education",
    shortLabel: "Academic",
    icon: GraduationCap,
    defaultEventType: "Conference",
    smartSuggestions: [
      {
        id: "univ_honors",
        title: "Academic Honors & Dean's List",
        description: "Add scholastic citations, student honors, and research distinctions",
        promptInjection: "Include an Academic Honors & Scholastic Distinctions section with 3 student paper honors and awards.",
        sectionTarget: "domainOutcomes",
      },
      {
        id: "univ_faculty",
        title: "Faculty Spotlight & Chair Remarks",
        description: "Highlight department faculty leadership and keynote contributions",
        promptInjection: "Include a Faculty Spotlight section highlighting lead professors, session chairs, and research advisors.",
        sectionTarget: "guests",
      },
      {
        id: "univ_accreditation",
        title: "NAAC / ABET CO-PO Outcome Mapping",
        description: "Map proceedings directly to program educational objectives & Bloom's taxonomy",
        promptInjection: "Map proceedings to ABET/NAAC Course Outcomes (CO1, CO3, CO4) and Program Outcomes (PO1, PO3, PO12) with Bloom's Level L5 Evaluate.",
        sectionTarget: "domainOutcomes",
      },
      {
        id: "univ_signoff",
        title: "HOD & Dean Formal Ratification",
        description: "Include formal administrative verification and academic sign-off strip",
        promptInjection: "Include institutional Dean and Head of Department sign-off block with formal ratification remarks.",
        sectionTarget: "eventDetails",
      },
    ],
  },
  corporate: {
    id: "corporate",
    label: "Corporate / Enterprise",
    shortLabel: "Corporate",
    icon: Briefcase,
    defaultEventType: "Seminar",
    smartSuggestions: [
      {
        id: "corp_roi",
        title: "Executive ROI & Fiscal Impact",
        description: "Highlight commercial deliverables, budget efficiency, and business KPI outcomes",
        promptInjection: "Include an Executive ROI & Business Deliverables breakdown with financial KPIs and strategic next steps.",
        sectionTarget: "summary",
      },
      {
        id: "corp_stakeholders",
        title: "Keynote VIP & Stakeholder Matrix",
        description: "Spotlight C-suite remarks, enterprise partners, and client delegates",
        promptInjection: "Highlight keynote C-level executives, enterprise partner tiers, and strategic commercial delegates.",
        sectionTarget: "guests",
      },
      {
        id: "corp_actionitems",
        title: "Strategic Action Items & Milestones",
        description: "Detail department quarterly deadlines and assignee matrices",
        promptInjection: "Include a formal strategic action items matrix with assigned leads and quarterly target dates.",
        sectionTarget: "domainOutcomes",
      },
    ],
  },
  research: {
    id: "research",
    label: "Research Lab & R&D",
    shortLabel: "R&D Lab",
    icon: FlaskConical,
    defaultEventType: "Conference",
    smartSuggestions: [
      {
        id: "res_benchmarks",
        title: "Methodology & Benchmark Metrics",
        description: "Include computational accuracy gains, datasets, and technical experiment specs",
        promptInjection: "Detail experimental methodology, computational benchmark scores, and baseline performance comparisons.",
        sectionTarget: "domainOutcomes",
      },
      {
        id: "res_citations",
        title: "IEEE / ArXiv Paper Citations",
        description: "Format publication references, preprint links, and patent disclosures",
        promptInjection: "Format academic citations following IEEE style with DOI/ArXiv identifiers and patent disclosures.",
        sectionTarget: "summary",
      },
      {
        id: "res_labspotlight",
        title: "Principal Investigator Spotlight",
        description: "Highlight lab directors, postdocs, and research grant sponsors",
        promptInjection: "Spotlight the Principal Investigator, laboratory research directors, and federal grant sponsors.",
        sectionTarget: "guests",
      },
    ],
  },
  nonprofit: {
    id: "nonprofit",
    label: "Non-Profit & Community",
    shortLabel: "Non-Profit",
    icon: HeartHandshake,
    defaultEventType: "Social",
    smartSuggestions: [
      {
        id: "ngo_impact",
        title: "Community Beneficiary Impact",
        description: "Showcase direct outreach metrics, volunteer hours, and community reach",
        promptInjection: "Highlight community beneficiary reach, volunteer engagement hours, and grassroots social outcomes.",
        sectionTarget: "attendance",
      },
      {
        id: "ngo_donors",
        title: "Donor & Grant Acknowledgements",
        description: "Recognize philanthropic grants, community sponsors, and patron contributions",
        promptInjection: "Include a Donor & Philanthropic Partner Acknowledgement matrix with grant impact statements.",
        sectionTarget: "domainOutcomes",
      },
      {
        id: "ngo_press",
        title: "Press & Media Coverage",
        description: "Cite news publication features and public engagement quotes",
        promptInjection: "Summarize regional media coverage, public press mentions, and attendee testimonial quotes.",
        sectionTarget: "summary",
      },
    ],
  },
  student_club: {
    id: "student_club",
    label: "Student Club & Society",
    shortLabel: "Student Club",
    icon: Rocket,
    defaultEventType: "Hackathon",
    smartSuggestions: [
      {
        id: "club_leaderboard",
        title: "Contest / Hackathon Leaderboard",
        description: "List 1st, 2nd, 3rd place student teams, tracks, and prize sponsors",
        promptInjection: "Include complete Hackathon & Competition Awards leaderboard with prize tiers and track categories.",
        sectionTarget: "domainOutcomes",
      },
      {
        id: "club_engagement",
        title: "Student Engagement & Feedback",
        description: "Highlight net promoter score, food/swag satisfaction, and student turnout",
        promptInjection: "Detail student attendance turnout, satisfaction rating (4.9/5), and participant feedback highlights.",
        sectionTarget: "attendance",
      },
      {
        id: "club_toolchain",
        title: "Hands-on Technical Toolchain",
        description: "List dev tools, APIs, hardware kits, and cloud sponsors utilized",
        promptInjection: "List technical developer toolchains, APIs, GitHub repos, and cloud credits sponsored.",
        sectionTarget: "domainOutcomes",
      },
    ],
  },
};

const VIBE_PRESETS = [
  {
    label: "🚀 AI & Cloud Hackathon",
    eventType: "Hackathon" as EventType,
    orgType: "university" as OrganizationType,
    prompt:
      "Synthesize a 36-hour National AI Hackathon with 140 participants, 28 submitted prototypes. Grand Winner: Team NeuralEdge ($2,500 AWS credits) for Autonomous Healthcare Triage. Silver Winner: Team GreenGrid for IoT Solar Optimization. Chief Judge: Dr. Elena Rostova (Senior Director, AI Research Institute). Include financial budget balance, sponsor tiers (Google Cloud, GitHub), and high-energy summary.",
  },
  {
    label: "🎓 International Conference (NAAC/ABET)",
    eventType: "Conference" as EventType,
    orgType: "university" as OrganizationType,
    prompt:
      "Synthesize proceedings for the 5th International Conference on Computational Intelligence (ICCI-2026). Keynote by Prof. Marcus Sterling on Quantum Neural Networks. 280 registered delegates, 45 peer-reviewed papers presented. Map to ABET Criteria PO1, PO3, PO12 and Blooms Level L5 Evaluate. Include institutional recommendations and HOD approval sign-off.",
  },
  {
    label: "💻 Hands-on DevOps Workshop",
    eventType: "Workshop" as EventType,
    orgType: "university" as OrganizationType,
    prompt:
      "A 2-day hands-on technical workshop on Kubernetes, Docker, and CI/CD Microservices Architecture. 65 undergraduate and graduate students attended. Instructor: Sarah Jenkins (Principal DevOps Architect). Pre-assessment average was 42%, post-assessment rose to 89% (net skill gain +47%). Include hands-on lab milestones and take-home containerized repo project.",
  },
  {
    label: "📝 Faculty Board of Studies Meeting",
    eventType: "Meeting" as EventType,
    orgType: "university" as OrganizationType,
    prompt:
      "Department Board of Studies Meeting presided by Dr. Arthur Pendelton. Ratified resolutions for 2026-2027 curriculum update including new Generative AI & Ethics core course and procurement of 30 GPU lab workstations. Action items assigned to Prof. Vance (Syllabus revision due Oct 15) and Dr. Chen (Lab procurement RFP due Oct 30).",
  },
  {
    label: "🎨 Tech & Project Exhibition",
    eventType: "Exhibition" as EventType,
    orgType: "student_club" as OrganizationType,
    prompt:
      "Annual Inter-Departmental Engineering Showcase & Tech Expo. 52 student booths across Robotics, Renewable Energy, and Biomedical Devices. Over 850 visitors and industry recruiters attended. Best Exhibit Award went to BioVest Bionic Exoskeleton by Department of Mechatronics.",
  },
];

export const ReganStudio: React.FC<ReganStudioProps> = ({
  currentReport,
  currentUser,
  onApplyReportToApp,
  onClose,
}) => {
  // Primary Workflow Navigation Tab in Left Pane: "prompt" | "editor" | "sync_refresh" | "json"
  const [activeTab, setActiveTab] = useState<StudioTab>("prompt");
  // Split pane ratio / layout: "split" | "editor-only" | "preview-only"
  const [layoutMode, setLayoutMode] = useState<"split" | "editor-only" | "preview-only">("split");
  // Canvas Zoom level: 85 | 100 | 115
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Input & Synthesis Parameters
  const [detailsInput, setDetailsInput] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<EventType>(
    currentReport?.content.eventDetails.eventType || "Conference"
  );
  const [selectedTone, setSelectedTone] = useState<"Executive" | "Formal" | "Concise" | "Highlights">("Executive");
  const [customInstruction, setCustomInstruction] = useState("");

  // Organization Type Selection & Smart Suggestions State
  const [orgType, setOrgType] = useState<OrganizationType>(() => {
    const orgStr = (currentUser.organization || "").toLowerCase();
    if (orgStr.includes("corp") || orgStr.includes("inc") || orgStr.includes("llc")) return "corporate";
    if (orgStr.includes("lab") || orgStr.includes("research") || orgStr.includes("institute")) return "research";
    if (orgStr.includes("club") || orgStr.includes("society") || orgStr.includes("chapter")) return "student_club";
    if (orgStr.includes("ngo") || orgStr.includes("foundation") || orgStr.includes("charity")) return "nonprofit";
    return "university";
  });
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  // Agent State
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshingSection, setRefreshingSection] = useState<string | null>(null);
  const [sectionCustomTweaks, setSectionCustomTweaks] = useState<Record<string, string>>({});
  const [agentLogs, setAgentLogs] = useState<string[]>([
    "⚡ REGAN Autonomous Agent ready. Select an organization type or paste event details to synthesize.",
  ]);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Active Report draft generated/edited inside REGAN Studio
  const [liveReport, setLiveReport] = useState<Report>(() => {
    if (currentReport) return currentReport;
    return {
      id: "regan_" + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      title: "Proceedings of Annual Institutional Symposium",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["Academic", "Symposium"],
      content: {
        eventDetails: {
          name: "Annual Institutional Symposium & Tech Conclave",
          date: new Date().toISOString().split("T")[0],
          location: "Main Auditorium & Grand Hall",
          organizerName: currentUser.name || "Academic Committee",
          organization: currentUser.organization || "Department of Academic & Research Excellence",
          eventType: "Conference",
          department: "Computer Science & Engineering",
        },
        attendance: {
          totalAttendees: 150,
          studentCount: 120,
          facultyCount: 20,
          externalCount: 10,
          satisfactionRating: 4.8,
          notes: "Full capacity with active student engagement and Q&A participation.",
        },
        summary: {
          rawNotes: "Proceedings synthesized by REGAN Automated Agent.",
          polishedText:
            "The event convened distinguished scholars, faculty researchers, and student innovators for a comprehensive exploration of emerging technologies. Keynote deliberations fostered rigorous interdisciplinary inquiry, and practical outcomes established new institutional benchmarks.",
          finalizedText:
            "The event convened distinguished scholars, faculty researchers, and student innovators for a comprehensive exploration of emerging technologies. Keynote deliberations fostered rigorous interdisciplinary inquiry, and practical outcomes established new institutional benchmarks.",
          tone: "Executive",
          regenerateCount: 1,
          isFinalized: true,
        },
        guests: [
          {
            id: "g_1",
            name: "Dr. Elena Rostova",
            role: "Keynote",
            organization: "Global AI & Computing Research Institute",
            designation: "Senior Research Director",
            bio: "Distinguished scholar in scalable deep learning systems and autonomous decision architectures with over 15 years of industry leadership.",
          },
        ],
        images: [],
        accreditation: {
          programName: "B.Tech Computer Science & Engineering",
          courseOutcomeMapping: "CO1 (Fundamental Principles), CO3 (System Architecture)",
          programOutcomes: "PO1 (Engineering Knowledge), PO3 (Design & Problem Solving), PO12 (Lifelong Learning)",
          bloomsLevel: "L5 - Evaluate",
          feedbackAverageRating: 4.85,
          feedbackSummary: "94% of respondents reported substantial knowledge acquisition in cutting-edge computing paradigms.",
        },
      },
    };
  });

  // Raw JSON string for code editor mode
  const [jsonText, setJsonText] = useState(() => JSON.stringify(liveReport.content, null, 2));

  // Sync JSON text when liveReport changes
  const updateLiveReport = (updated: Report) => {
    setLiveReport(updated);
    setJsonText(JSON.stringify(updated.content, null, 2));
  };

  // Sync from code editor to liveReport
  const handleJsonCodeChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setLiveReport((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          ...parsed,
        },
        updatedAt: new Date().toISOString(),
      }));
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg("Syntax Warning: Invalid JSON syntax in code editor");
    }
  };

  const handleSelectPreset = (preset: (typeof VIBE_PRESETS)[0]) => {
    setDetailsInput(preset.prompt);
    setSelectedEventType(preset.eventType);
    if (preset.orgType) {
      setOrgType(preset.orgType);
    }
  };

  // Smart Suggestion Toggle Handler
  const handleApplySmartSuggestion = (suggestion: (typeof ORG_TYPE_CONFIGS)["university"]["smartSuggestions"][0]) => {
    if (appliedSuggestions.includes(suggestion.id)) {
      setAppliedSuggestions((prev) => prev.filter((id) => id !== suggestion.id));
      setDetailsInput((prev) => prev.replace(`\n[Special Module: ${suggestion.promptInjection}]`, ""));
    } else {
      setAppliedSuggestions((prev) => [...prev, suggestion.id]);
      setDetailsInput((prev) => {
        const addition = `\n[Special Module: ${suggestion.promptInjection}]`;
        if (prev.includes(addition)) return prev;
        return (prev.trim() + addition).trim();
      });
      setAgentLogs((prev) => [
        ...prev,
        `💡 Configured Smart Suggestion: ${suggestion.title}`,
      ]);
    }
  };

  // Autonomous Full Agent Generation Function
  const handleRunReganAgent = async () => {
    if (!detailsInput.trim()) {
      setErrorMsg("Please provide event details, briefing notes, or select a vibe preset.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStep(1);
    setAgentLogs([
      `⚡ [REGAN] Initializing Autonomous Proceedings Pipeline for ${ORG_TYPE_CONFIGS[orgType].label}...`,
      "🔍 [1/4] Ingesting raw briefing notes & smart organizational modules...",
    ]);

    const stepTimer1 = setTimeout(() => {
      setGenerationStep(2);
      setAgentLogs((prev) => [
        ...prev,
        "📐 [2/4] Formulating domain taxonomy, attendance matrices & keynotes...",
      ]);
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep(3);
      setAgentLogs((prev) => [
        ...prev,
        "📝 [3/4] Synthesizing executive outcomes & accreditation compliance...",
      ]);
    }, 1800);

    try {
      const response = await fetch("/api/regan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: detailsInput,
          eventType: selectedEventType,
          tone: selectedTone,
          instruction: `${customInstruction} Organization Type: ${ORG_TYPE_CONFIGS[orgType].label}`,
          currentReport: liveReport,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate report via server agent");
      }

      const agentData = result.data;
      const newTitle = agentData.title || agentData.eventDetails?.name || `${selectedEventType} Proceedings Report`;
      
      const newReport: Report = {
        id: liveReport.id || "regan_" + Math.random().toString(36).substring(2, 9),
        userId: currentUser.id,
        title: newTitle,
        status: "completed",
        createdAt: liveReport.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: agentData.tags || ["Academic", "Proceedings", selectedEventType],
        content: {
          eventDetails: {
            name: agentData.eventDetails?.name || newTitle,
            date: agentData.eventDetails?.date || new Date().toISOString().split("T")[0],
            location: agentData.eventDetails?.location || "Main Campus Auditorium",
            organizerName: agentData.eventDetails?.organizerName || currentUser.name || "Academic Committee",
            organization: agentData.eventDetails?.organization || currentUser.organization || "Department of Academic & Research Excellence",
            eventType: selectedEventType,
            department: agentData.eventDetails?.department || "Department of Computer Science & Engineering",
            website: agentData.eventDetails?.website || "",
          },
          attendance: {
            totalAttendees: Number(agentData.attendance?.totalAttendees) || 120,
            studentCount: Number(agentData.attendance?.studentCount) || 95,
            facultyCount: Number(agentData.attendance?.facultyCount) || 18,
            externalCount: Number(agentData.attendance?.externalCount) || 7,
            satisfactionRating: Number(agentData.attendance?.satisfactionRating) || 4.8,
            notes: agentData.attendance?.notes || "High engagement and active participation throughout the sessions.",
          },
          summary: {
            rawNotes: detailsInput,
            polishedText: agentData.summary?.polishedText || agentData.summary?.finalizedText || agentData.executiveSummary || "Proceedings successfully convened.",
            finalizedText: agentData.summary?.finalizedText || agentData.summary?.polishedText || agentData.executiveSummary || "Proceedings successfully convened.",
            tone: selectedTone,
            regenerateCount: (liveReport.content.summary.regenerateCount || 0) + 1,
            isFinalized: true,
          },
          guests: Array.isArray(agentData.guests) && agentData.guests.length > 0
            ? agentData.guests.map((g: any, i: number) => ({
                id: `guest_${i + 1}`,
                name: g.name || `Distinguished Speaker ${i + 1}`,
                role: g.role || "Keynote",
                organization: g.organization || "Leading Research Institution",
                designation: g.designation || "Senior Specialist",
                bio: g.bio || "Pioneering researcher with extensive contributions to the field.",
              }))
            : liveReport.content.guests,
          images: liveReport.content.images || [],
          accreditation: agentData.accreditation || agentData.specializedModule?.accreditation || (selectedEventType === "Conference" || selectedEventType === "Seminar" ? {
            programName: "Department of Academic & Research Excellence",
            courseOutcomeMapping: "CO1, CO2, CO4",
            programOutcomes: "PO1, PO3, PO5, PO12",
            bloomsLevel: "L5 - Evaluate",
            feedbackAverageRating: 4.8,
            feedbackSummary: "Participants expressed high satisfaction with keynote relevance and research depth.",
          } : undefined),
          hackathon: agentData.hackathon || agentData.specializedModule?.hackathon || (selectedEventType === "Hackathon" ? {
            problemStatements: ["Autonomous AI Agents in Healthcare", "Smart Energy Optimization", "Decentralized Trust"],
            submissionCount: 28,
            shortlistedCount: 8,
            techTracks: ["Generative AI", "Edge Computing", "Web3 Systems"],
            awards: [
              { id: "a1", title: "First Place Grand Champion", recipientName: "Team NeuralEdge", prize: "$2,500 AWS Credits" },
              { id: "a2", title: "Innovation Runner-Up", recipientName: "Team GreenGrid", prize: "$1,200 Hardware Kit" },
            ],
          } : undefined),
          workshop: agentData.workshop || agentData.specializedModule?.workshop || (selectedEventType === "Workshop" ? {
            skillLevel: "Intermediate",
            softwareToolsUsed: ["Docker", "Kubernetes", "TypeScript", "Python"],
            handsOnExercises: ["Containerizing Microservices", "Automating Deployment Pipelines"],
            preAssessmentAverage: 45,
            postAssessmentAverage: 88,
          } : undefined),
          meeting: agentData.meeting || agentData.specializedModule?.meeting || (selectedEventType === "Meeting" ? {
            meetingType: "Department Board",
            presidedBy: currentUser.name || "Academic Chair",
            agendaItems: ["Curriculum Review 2026", "Laboratory Infrastructure Upgrade"],
            resolutionsPassed: ["Approved elective syllabus addendum", "Sanctioned GPU lab procurement"],
          } : undefined),
          exhibition: agentData.exhibition || agentData.specializedModule?.exhibition || (selectedEventType === "Exhibition" ? {
            stallsOrBoothsCount: 45,
            estimatedFootfall: 750,
            highlightExhibits: ["Robotic Exoskeleton Prototype", "Solar Micro-Inverter Grid"],
          } : undefined),
        },
      };

      updateLiveReport(newReport);
      setGenerationStep(4);
      setAgentLogs((prev) => [
        ...prev,
        "✨ [4/4] Side-by-side vector proceedings document rendered successfully!",
        ...(agentData.agentLogs ? agentData.agentLogs.map((l: string) => `🤖 ${l}`) : []),
      ]);
      // Seamlessly transition to visual editor tab to allow immediate refinement
      setActiveTab("editor");
    } catch (err: any) {
      console.warn("Server agent failed, falling back to intelligent client synthesis:", err);
      synthesizeLocalFallback();
    } finally {
      setIsGenerating(false);
    }
  };

  // Targeted 'Sync & Refresh' on a single section
  const handleSyncAndRefreshSection = async (sectionKey: "summary" | "attendance" | "guests" | "domainOutcomes" | "eventDetails") => {
    setRefreshingSection(sectionKey);
    const customTweak = sectionCustomTweaks[sectionKey] || "";

    setAgentLogs((prev) => [
      ...prev,
      `🔄 [Sync & Refresh] Refreshing section '${sectionKey}' without discarding document...`,
    ]);

    try {
      const response = await fetch("/api/regan/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          currentReport: liveReport,
          instruction: customTweak || `Enhance section for ${ORG_TYPE_CONFIGS[orgType].label} standards.`,
          orgType: ORG_TYPE_CONFIGS[orgType].label,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const refreshedData = result.data[sectionKey] || result.data;
        let updatedContent = { ...liveReport.content };

        if (sectionKey === "summary") {
          const polished = typeof refreshedData === "string" ? refreshedData : refreshedData.finalizedText || refreshedData.polishedText || refreshedData.summary;
          updatedContent.summary = {
            ...updatedContent.summary,
            polishedText: polished,
            finalizedText: polished,
            regenerateCount: updatedContent.summary.regenerateCount + 1,
          };
        } else if (sectionKey === "attendance") {
          updatedContent.attendance = {
            ...updatedContent.attendance,
            ...refreshedData,
          };
        } else if (sectionKey === "guests") {
          if (Array.isArray(refreshedData)) {
            updatedContent.guests = refreshedData;
          } else if (refreshedData.guests && Array.isArray(refreshedData.guests)) {
            updatedContent.guests = refreshedData.guests;
          }
        } else if (sectionKey === "eventDetails") {
          updatedContent.eventDetails = {
            ...updatedContent.eventDetails,
            ...refreshedData,
          };
        } else if (sectionKey === "domainOutcomes") {
          if (liveReport.content.eventDetails.eventType === "Hackathon") {
            updatedContent.hackathon = refreshedData.hackathon || refreshedData;
          } else {
            updatedContent.accreditation = refreshedData.accreditation || refreshedData;
          }
        }

        const updatedReport: Report = {
          ...liveReport,
          content: updatedContent,
          updatedAt: new Date().toISOString(),
        };

        updateLiveReport(updatedReport);
        setAgentLogs((prev) => [
          ...prev,
          `✅ [Sync & Refresh] Section '${sectionKey}' synchronized and refreshed successfully!`,
        ]);
      } else {
        throw new Error("Invalid response from refresh endpoint");
      }
    } catch (err) {
      console.warn("Targeted section refresh fallback:", err);
      localRefreshFallback(sectionKey, customTweak);
    } finally {
      setRefreshingSection(null);
    }
  };

  const localRefreshFallback = (sectionKey: string, customTweak: string) => {
    let updatedContent = { ...liveReport.content };

    if (sectionKey === "summary") {
      const refreshed = `${updatedContent.summary.finalizedText} Further deliberations spotlighted key achievements and actionable recommendations aligned with ${ORG_TYPE_CONFIGS[orgType].label} priorities.`;
      updatedContent.summary = {
        ...updatedContent.summary,
        finalizedText: refreshed,
        polishedText: refreshed,
        regenerateCount: updatedContent.summary.regenerateCount + 1,
      };
    } else if (sectionKey === "attendance") {
      updatedContent.attendance = {
        ...updatedContent.attendance,
        satisfactionRating: 4.9,
        notes: "Verified headcount audit complete with 96% session completion rate.",
      };
    } else if (sectionKey === "guests") {
      updatedContent.guests = [
        ...updatedContent.guests,
        {
          id: `guest_spotlight_${Date.now()}`,
          name: orgType === "university" ? "Prof. Alistair Sterling, Ph.D." : "Elena Vance, VP of Innovation",
          role: "Keynote",
          organization: orgType === "university" ? "Department Academic Council" : "Global Enterprise Solutions",
          designation: orgType === "university" ? "Chair of Distinguished Research" : "Senior Executive Director",
          bio: "Recognized authority delivering pivotal keynote insights and strategic guidance.",
        },
      ];
    }

    const updatedReport = {
      ...liveReport,
      content: updatedContent,
      updatedAt: new Date().toISOString(),
    };
    updateLiveReport(updatedReport);
    setAgentLogs((prev) => [
      ...prev,
      `✅ [Sync & Refresh] Section '${sectionKey}' refreshed with local resilient synthesis.`,
    ]);
  };

  const synthesizeLocalFallback = () => {
    const title = `${selectedEventType} Proceedings: ${detailsInput.slice(0, 45)}...`;
    const fallbackReport: Report = {
      ...liveReport,
      title: title,
      updatedAt: new Date().toISOString(),
      content: {
        ...liveReport.content,
        eventDetails: {
          ...liveReport.content.eventDetails,
          name: title,
          eventType: selectedEventType,
        },
        summary: {
          rawNotes: detailsInput,
          polishedText: `The ${selectedEventType.toLowerCase()} was successfully conducted with distinguished attendance. Key findings: ${detailsInput.slice(0, 300)}... Deliberations fostered meaningful interdisciplinary inquiry and established actionable institutional outcomes.`,
          finalizedText: `The ${selectedEventType.toLowerCase()} was successfully conducted with distinguished attendance. Key findings: ${detailsInput.slice(0, 300)}... Deliberations fostered meaningful interdisciplinary inquiry and established actionable institutional outcomes.`,
          tone: selectedTone,
          regenerateCount: (liveReport.content.summary.regenerateCount || 0) + 1,
          isFinalized: true,
        },
      },
    };
    updateLiveReport(fallbackReport);
    setAgentLogs((prev) => [
      ...prev,
      "⚡ [REGAN] Local resilient synthesis complete. Real-time preview updated!",
    ]);
    setActiveTab("editor");
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportPDF = () => {
    downloadReportPDF(liveReport, currentUser, null, {
      watermark: "official",
      watermarkMode: "text",
      showSeal: true,
    });
  };

  const handleApplyToSuite = () => {
    onApplyReportToApp(liveReport);
    onClose();
  };

  const currentOrgConfig = ORG_TYPE_CONFIGS[orgType];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-100 font-sans overflow-hidden animate-in fade-in duration-150">
      {/* 1. TOP SPACIOUS APP BAR */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Brand Identity & Active Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                REGAN <span className="text-indigo-400 font-mono text-xs font-bold">Studio</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Vibe Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Autonomous Proceedings Synthesizer & Live Side-by-Side Workspace
            </p>
          </div>
        </div>

        {/* Center: Main Primary Workflow Navigation Tabs */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab("prompt")}
            className={`px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "prompt"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate & Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "editor"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Section Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sync_refresh")}
            className={`px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "sync_refresh"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Sync & Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "json"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON Schema</span>
          </button>
        </div>

        {/* Right: Actions & Split Layout Toggles */}
        <div className="flex items-center gap-2">
          {/* Split Mode Selector */}
          <div className="hidden xl:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode("split")}
              className={`p-1.5 rounded transition-all ${
                layoutMode === "split" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Split 50/50 View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("editor-only")}
              className={`p-1.5 rounded transition-all ${
                layoutMode === "editor-only" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Focus on Editor"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("preview-only")}
              className={`p-1.5 rounded transition-all ${
                layoutMode === "preview-only" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Focus on Document Canvas"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Export Vector PDF"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">PDF</span>
          </button>

          <button
            type="button"
            onClick={handleApplyToSuite}
            className="px-3.5 py-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Apply to active report in UniReport"
          >
            <span>Apply to Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1 cursor-pointer"
            title="Close REGAN Studio"
          >
            ✕
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT VIEW (SPACIOUS DUAL WORKSPACE) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT WORKSPACE PANE */}
        <div
          className={`flex flex-col border-r border-slate-800 bg-slate-900/40 overflow-hidden ${
            layoutMode === "preview-only" ? "hidden" : layoutMode === "editor-only" ? "w-full" : "w-full lg:w-1/2"
          }`}
        >
          {/* TAB CONTENT: 1. GENERATE & PROMPT (SPACIOUS, UNCLUTTERED) */}
          {activeTab === "prompt" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Organization Type Segmented Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Select Organization Framework
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(ORG_TYPE_CONFIGS) as OrganizationType[]).map((key) => {
                    const cfg = ORG_TYPE_CONFIGS[key];
                    const Icon = cfg.icon;
                    const isSelected = orgType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setOrgType(key);
                          setSelectedEventType(cfg.defaultEventType);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xs ring-1 ring-indigo-500/30 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                        <span className="text-xs truncate">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Smart Suggestions for Chosen Organization */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                      Smart Modules for {currentOrgConfig.label}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">1-Click Toggle</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentOrgConfig.smartSuggestions.map((sug) => {
                    const isApplied = appliedSuggestions.includes(sug.id);
                    return (
                      <div
                        key={sug.id}
                        onClick={() => handleApplySmartSuggestion(sug)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isApplied
                            ? "bg-indigo-600/15 border-indigo-500 text-white shadow-2xs ring-1 ring-indigo-500/30"
                            : "bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isApplied ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-200">{sug.title}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{sug.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Type & Tone Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Event Domain Category</label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                    className="w-full bg-slate-900 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Social">Social</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Executive Proceedings Tone</label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as any)}
                    className="w-full bg-slate-900 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Formal">Formal</option>
                    <option value="Concise">Concise</option>
                    <option value="Highlights">Highlights</option>
                  </select>
                </div>
              </div>

              {/* Prompt Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    Raw Event Details & Briefing Notes
                  </label>
                  <span className="text-[11px] text-slate-500">Natural language, bullets, or agenda</span>
                </div>

                <textarea
                  value={detailsInput}
                  onChange={(e) => setDetailsInput(e.target.value)}
                  placeholder={`Paste raw notes, schedule agenda, attendee headcount, speaker bio blurbs, prizes, or click smart suggestions above to auto-compose...`}
                  rows={6}
                  className="w-full bg-slate-950 text-slate-100 text-xs p-4 rounded-2xl border border-slate-800 focus:border-indigo-500 focus:outline-hidden resize-none font-sans leading-relaxed placeholder:text-slate-500 shadow-inner"
                />
              </div>

              {/* Quick Preset Starters */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or Start from a Publication Preset:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {VIBE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/60 text-slate-300 hover:text-white shrink-0 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Synthesize CTA Button */}
              <div>
                <button
                  type="button"
                  onClick={handleRunReganAgent}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Multi-Page Proceedings...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Full Report with REGAN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Execution Stream / Agent Logs */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 font-sans pb-1 border-b border-slate-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Autonomous Agent Pipeline
                  </span>
                  <span>Step {generationStep || 1}/4</span>
                </div>
                <p className="text-slate-300 truncate">{agentLogs[agentLogs.length - 1]}</p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. SPACIOUS SECTION EDITOR */}
          {activeTab === "editor" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white">Live Section Form Editor</h3>
                  <p className="text-[11px] text-slate-400">Edit fields directly — live vector preview updates in real-time.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("sync_refresh")}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Sync & Refresh Section</span>
                </button>
              </div>

              {/* Section 1: Event Identity */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Event Identity & Title</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSyncAndRefreshSection("eventDetails")}
                    disabled={refreshingSection === "eventDetails"}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${refreshingSection === "eventDetails" ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Report Proceedings Title</label>
                    <input
                      type="text"
                      value={liveReport.title}
                      onChange={(e) =>
                        updateLiveReport({
                          ...liveReport,
                          title: e.target.value,
                          content: {
                            ...liveReport.content,
                            eventDetails: { ...liveReport.content.eventDetails, name: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-semibold focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Organization</label>
                      <input
                        type="text"
                        value={liveReport.content.eventDetails.organization || ""}
                        onChange={(e) =>
                          updateLiveReport({
                            ...liveReport,
                            content: {
                              ...liveReport.content,
                              eventDetails: { ...liveReport.content.eventDetails, organization: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Location / Venue</label>
                      <input
                        type="text"
                        value={liveReport.content.eventDetails.location || ""}
                        onChange={(e) =>
                          updateLiveReport({
                            ...liveReport,
                            content: {
                              ...liveReport.content,
                              eventDetails: { ...liveReport.content.eventDetails, location: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Executive Summary */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Executive Summary & Proceedings</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSyncAndRefreshSection("summary")}
                    disabled={refreshingSection === "summary"}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${refreshingSection === "summary" ? "animate-spin" : ""}`} />
                    <span>Sync & Refresh</span>
                  </button>
                </div>

                <textarea
                  value={liveReport.content.summary.finalizedText}
                  onChange={(e) =>
                    updateLiveReport({
                      ...liveReport,
                      content: {
                        ...liveReport.content,
                        summary: {
                          ...liveReport.content.summary,
                          finalizedText: e.target.value,
                          polishedText: e.target.value,
                        },
                      },
                    })
                  }
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-hidden focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Section 3: Attendance & Headcount Metrics */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Attendance & Attainment Metrics</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSyncAndRefreshSection("attendance")}
                    disabled={refreshingSection === "attendance"}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${refreshingSection === "attendance" ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Attendees</span>
                    <input
                      type="number"
                      value={liveReport.content.attendance.totalAttendees}
                      onChange={(e) =>
                        updateLiveReport({
                          ...liveReport,
                          content: {
                            ...liveReport.content,
                            attendance: {
                              ...liveReport.content.attendance,
                              totalAttendees: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full bg-transparent text-center font-bold text-indigo-400 text-base focus:outline-hidden mt-1"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Students</span>
                    <input
                      type="number"
                      value={liveReport.content.attendance.studentCount || 0}
                      onChange={(e) =>
                        updateLiveReport({
                          ...liveReport,
                          content: {
                            ...liveReport.content,
                            attendance: {
                              ...liveReport.content.attendance,
                              studentCount: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full bg-transparent text-center font-bold text-slate-200 text-base focus:outline-hidden mt-1"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Faculty / Experts</span>
                    <input
                      type="number"
                      value={liveReport.content.attendance.facultyCount || 0}
                      onChange={(e) =>
                        updateLiveReport({
                          ...liveReport,
                          content: {
                            ...liveReport.content,
                            attendance: {
                              ...liveReport.content.attendance,
                              facultyCount: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full bg-transparent text-center font-bold text-slate-200 text-base focus:outline-hidden mt-1"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Satisfaction</span>
                    <input
                      type="number"
                      step="0.1"
                      max="5"
                      value={liveReport.content.attendance.satisfactionRating || 4.8}
                      onChange={(e) =>
                        updateLiveReport({
                          ...liveReport,
                          content: {
                            ...liveReport.content,
                            attendance: {
                              ...liveReport.content.attendance,
                              satisfactionRating: parseFloat(e.target.value) || 4.8,
                            },
                          },
                        })
                      }
                      className="w-full bg-transparent text-center font-bold text-amber-400 text-base focus:outline-hidden mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Keynote Guests & Faculty Spotlight */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Distinguished Keynotes & Faculty ({liveReport.content.guests.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSyncAndRefreshSection("guests")}
                    disabled={refreshingSection === "guests"}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${refreshingSection === "guests" ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {liveReport.content.guests.map((g, idx) => (
                    <div key={g.id || idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 text-xs">{g.name}</span>
                        <span className="text-[10px] font-bold bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/30">
                          {g.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{g.designation} · {g.organization}</p>
                      <p className="text-[11px] text-slate-300 italic leading-relaxed">"{g.bio}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. DEDICATED SYNC & REFRESH TOOLKIT */}
          {activeTab === "sync_refresh" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-purple-400" />
                  <h3 className="font-black text-white text-xs">
                    Selective Section Sync & Refresh
                  </h3>
                </div>
                <p className="text-[11px] text-purple-200/80">
                  Regenerate specific document sections with customized instructions without overwriting the rest of the report.
                </p>
              </div>

              {/* Refresh Card 1: Executive Summary */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    1. Executive Summary & Proceedings
                  </span>
                  <button
                    type="button"
                    disabled={refreshingSection === "summary"}
                    onClick={() => handleSyncAndRefreshSection("summary")}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${refreshingSection === "summary" ? "animate-spin" : ""}`} />
                    <span>{refreshingSection === "summary" ? "Refreshing..." : "Sync & Refresh"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Specific tweak (e.g. 'Emphasize faculty keynote honors and international delegates')..."
                  value={sectionCustomTweaks.summary || ""}
                  onChange={(e) =>
                    setSectionCustomTweaks({ ...sectionCustomTweaks, summary: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  "{liveReport.content.summary.finalizedText}"
                </p>
              </div>

              {/* Refresh Card 2: Attendance & Headcount */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    2. Attendance & Participation Demographics
                  </span>
                  <button
                    type="button"
                    disabled={refreshingSection === "attendance"}
                    onClick={() => handleSyncAndRefreshSection("attendance")}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${refreshingSection === "attendance" ? "animate-spin" : ""}`} />
                    <span>{refreshingSection === "attendance" ? "Refreshing..." : "Sync & Refresh"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Specific tweak (e.g. 'Recalculate ratios for 85% undergraduate attendees')..."
                  value={sectionCustomTweaks.attendance || ""}
                  onChange={(e) =>
                    setSectionCustomTweaks({ ...sectionCustomTweaks, attendance: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Refresh Card 3: Keynotes & Speaker Bios */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    3. Distinguished Keynotes & Speaker Bios
                  </span>
                  <button
                    type="button"
                    disabled={refreshingSection === "guests"}
                    onClick={() => handleSyncAndRefreshSection("guests")}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${refreshingSection === "guests" ? "animate-spin" : ""}`} />
                    <span>{refreshingSection === "guests" ? "Refreshing..." : "Sync & Refresh"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Specific tweak (e.g. 'Add 2 distinguished professors from Department of CSE')..."
                  value={sectionCustomTweaks.guests || ""}
                  onChange={(e) =>
                    setSectionCustomTweaks({ ...sectionCustomTweaks, guests: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Refresh Card 4: Domain Outcomes & Accreditation */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    4. Domain Outcomes & Academic Honors
                  </span>
                  <button
                    type="button"
                    disabled={refreshingSection === "domainOutcomes"}
                    onClick={() => handleSyncAndRefreshSection("domainOutcomes")}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${refreshingSection === "domainOutcomes" ? "animate-spin" : ""}`} />
                    <span>{refreshingSection === "domainOutcomes" ? "Refreshing..." : "Sync & Refresh"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Specific tweak (e.g. 'Add 3 academic honors distinctions and Dean list awards')..."
                  value={sectionCustomTweaks.domainOutcomes || ""}
                  onChange={(e) =>
                    setSectionCustomTweaks({ ...sectionCustomTweaks, domainOutcomes: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. CLEAN JSON CODE EDITOR */}
          {activeTab === "json" && (
            <div className="flex-1 flex flex-col p-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Live Interactive Schema Editor</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
                </button>
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => handleJsonCodeChange(e.target.value)}
                className="w-full flex-1 bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-800 focus:border-indigo-500 focus:outline-hidden leading-relaxed resize-none shadow-inner"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* RIGHT WORKSPACE PANE: REAL-TIME SIDE-BY-SIDE LIVE PROCEEDINGS DOCUMENT PREVIEW */}
        <div
          className={`flex-1 bg-slate-950 flex flex-col overflow-hidden ${
            layoutMode === "editor-only" ? "hidden" : "flex"
          }`}
        >
          {/* FLOATING TOP CANVAS CONTROLS */}
          <div className="h-12 border-b border-slate-800/80 bg-slate-900/60 px-6 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-200">Live Vector Proceedings Canvas</span>
              <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full font-mono border border-indigo-500/20">
                {currentOrgConfig.shortLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700/80 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-slate-300">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 15))}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {refreshingSection && (
                <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Refreshing {refreshingSection}...
                </span>
              )}
            </div>
          </div>

          {/* DOCUMENT CANVAS SCROLLING DESK */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-slate-950">
            {/* SIMULATED A4 PAPER DOCUMENT WITH ZOOM SCALING */}
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
              }}
              className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 min-h-[780px] relative transition-transform duration-150 font-sans my-2 shrink-0"
            >
              {/* Institutional Header Accent */}
              <div className="h-3.5 bg-indigo-900 w-full" />

              {/* Watermark Overlay in Live Canvas */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-10 overflow-hidden">
                <span className="text-5xl font-black text-slate-900/10 uppercase tracking-widest -rotate-45 text-center px-4">
                  OFFICIAL PROCEEDINGS
                </span>
              </div>

              {/* Document Inner Content */}
              <div className="p-8 sm:p-12 space-y-6">
                {/* Header Title Block */}
                <div className="border-b-2 border-slate-900/10 pb-5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900 block">
                      {liveReport.content.eventDetails.organization || "INSTITUTIONAL EVENT PROCEEDINGS"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {liveReport.content.eventDetails.department || "Academic & Research Directorate"}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1.5 uppercase tracking-tight">
                      {liveReport.title || "Official Proceedings Report"}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                        {liveReport.content.eventDetails.date || "2026-09-30"}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-700" />
                        {liveReport.content.eventDetails.location || "Auditorium"}
                      </span>
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-full border-2 border-indigo-900 flex flex-col items-center justify-center text-[7px] font-bold text-indigo-950 p-1 text-center shrink-0">
                    <span>OFFICIAL</span>
                    <span className="text-[10px] font-black leading-none">★</span>
                    <span>SEAL</span>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-1">
                    1. Executive Summary & Proceedings
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {liveReport.content.summary.finalizedText || liveReport.content.summary.polishedText}
                  </p>
                </div>

                {/* Section 2: Attendance & Participation Metrics */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-1">
                    2. Participation & Impact Metrics
                  </h3>
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Total Attendees</span>
                      <span className="text-base font-black text-indigo-900">
                        {liveReport.content.attendance.totalAttendees}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Students</span>
                      <span className="text-base font-black text-slate-800">
                        {liveReport.content.attendance.studentCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Faculty / Experts</span>
                      <span className="text-base font-black text-slate-800">
                        {liveReport.content.attendance.facultyCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Satisfaction</span>
                      <span className="text-base font-black text-amber-600">
                        ★ {liveReport.content.attendance.satisfactionRating || 4.8}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Keynote & Distinguished Speakers */}
                {liveReport.content.guests.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-1">
                      3. Keynote & Guest Delegations
                    </h3>
                    <div className="space-y-2">
                      {liveReport.content.guests.map((g, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{g.name}</span>
                            <span className="text-[9px] font-bold uppercase bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                              {g.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-800 font-semibold block mt-0.5">
                            {g.designation} — {g.organization}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">{g.bio}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Specialized Domain Results (Hackathon/Accreditation) */}
                {liveReport.content.hackathon && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-1">
                      4. Hackathon Awards & Innovations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {liveReport.content.hackathon.awards?.map((aw, idx) => (
                        <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                          <span className="text-[10px] font-bold uppercase text-amber-800 block">{aw.title}</span>
                          <span className="text-xs font-black text-slate-900 block">{aw.recipientName}</span>
                          <span className="text-[11px] font-mono text-amber-700">{aw.prize}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {liveReport.content.accreditation && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-1">
                      4. Academic Accreditation & CO-PO Alignment
                    </h3>
                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs space-y-1.5">
                      <p>
                        <strong>Program Outcomes (POs):</strong> {liveReport.content.accreditation.programOutcomes}
                      </p>
                      <p>
                        <strong>Cognitive Bloom Level:</strong> {liveReport.content.accreditation.bloomsLevel || "L5 - Evaluate"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Signature Strip */}
                <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-center text-[10px] text-slate-500">
                  <div>
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span>Prepared by: {liveReport.content.eventDetails.organizerName}</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span>Dean / HOD Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
