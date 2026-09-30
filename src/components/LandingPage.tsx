import React, { useState } from "react";
import {
  Sparkles,
  Users,
  Printer,
  ShieldCheck,
  ArrowRight,
  Plus,
  CheckCircle2,
  Tag as TagIcon,
  Layers,
  ChevronRight,
  Calendar,
  Building,
  BarChart3,
  Download,
  BookOpen,
  GraduationCap,
  Trophy,
  ClipboardCheck,
  Laptop,
  Store,
  Check,
  ExternalLink,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { ReportTemplate, User, EventType } from "../types";
import { REPORT_TEMPLATES } from "../data/templates";

interface LandingPageProps {
  currentUser: User;
  onOpenDashboard: () => void;
  onNewReport: () => void;
  onSelectTemplate: (template: ReportTemplate) => void;
  onOpenAuth: () => void;
  onOpenTutorial?: () => void;
  onRequireAuth?: (reason: "save" | "download" | "dashboard") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onOpenDashboard,
  onNewReport,
  onSelectTemplate,
  onOpenAuth,
  onOpenTutorial,
  onRequireAuth,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePreviewType, setActivePreviewType] = useState<EventType>("Conference");

  const isAuthenticated = currentUser.provider === "google" || currentUser.provider === "email";

  const handleDashboardClick = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth("dashboard");
      else onOpenAuth();
    } else {
      onOpenDashboard();
    }
  };

  const handleNewReportClick = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth("save");
      else onOpenAuth();
    } else {
      onNewReport();
    }
  };

  const handleTemplateClick = (tpl: ReportTemplate) => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth("save");
      else onOpenAuth();
    } else {
      onSelectTemplate(tpl);
    }
  };

  // Sample data configurations for the interactive preview switcher
  const previewConfigurations: Record<
    EventType,
    {
      title: string;
      department: string;
      venue: string;
      date: string;
      headcount: number;
      satisfaction: string;
      specializedTitle: string;
      specializedHighlights: React.ReactNode;
      summarySnippet: string;
    }
  > = {
    Conference: {
      title: "International Symposium on Distributed Intelligence & Cloud Systems",
      department: "School of Computing & Data Science",
      venue: "University Grand Amphitheater & Virtual Hall",
      date: "September 2026",
      headcount: 485,
      satisfaction: "4.8 / 5.0",
      specializedTitle: "Academic Accreditation & Outcome (CO/PO) Compliance",
      specializedHighlights: (
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">ABET / NAAC Mapped:</span>
            <span className="font-mono text-indigo-700 font-bold">CO1, CO3, PO1, PO12</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Cognitive Taxonomy:</span>
            <span className="text-slate-600">L4 - Analytical Synthesis</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Formally Endorsed by Academic Chair & Dean</span>
          </div>
        </div>
      ),
      summarySnippet:
        "The symposium convened 485 delegates across 18 regional universities, anchored by keynotes from MIT CSAIL and peer evaluations of 24 competitive graduate research posters.",
    },
    Hackathon: {
      title: "Campus Hack 2026: Autonomous Edge & Climate Tech Sprint",
      department: "Student Innovation & MakerSpace Hub",
      venue: "Engineering Complex & Maker Studios",
      date: "October 2026",
      headcount: 280,
      satisfaction: "4.9 / 5.0",
      specializedTitle: "Competition Awards & Cash Grants Disbursement",
      specializedHighlights: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-amber-200">
            <div>
              <span className="font-bold text-slate-900 block">1st Place Grand Champion</span>
              <span className="text-indigo-700 font-semibold text-[11px]">Team NeuralForge</span>
            </div>
            <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
              $3,000 + Incubation
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">Best Hardware & IoT Track</span>
              <span className="text-indigo-700 font-semibold text-[11px]">Team EcoSensors</span>
            </div>
            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              $1,500 + Hardware
            </span>
          </div>
        </div>
      ),
      summarySnippet:
        "Over 36 continuous hours of collaborative engineering, 42 teams submitted working code prototypes, culminating in $8,500 distributed in competitive venture seed grants.",
    },
    Meeting: {
      title: "Board of Academic Studies: Annual Curriculum & Lab Audit",
      department: "Faculty Senate & Academic Affairs",
      venue: "Chambers Conference Suite A",
      date: "Quarterly Session",
      headcount: 24,
      satisfaction: "100% Quorum",
      specializedTitle: "Official Parliamentary Minutes & Action Items",
      specializedHighlights: (
        <div className="space-y-2 text-xs text-slate-700">
          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-950 block">Ratified Resolution 26-01:</span>
            <span className="text-[11px] text-emerald-900">
              Approved procurement of 25 upgraded GPU workstations for Lab 3 coursework.
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-900">Action: Finalize vendor RFP</span>
            <span className="text-slate-500 font-mono">Facilities Lead · Due Oct 14</span>
          </div>
        </div>
      ),
      summarySnippet:
        "The committee reviewed and ratified prior proceedings, authorized funding for high-performance computing hardware, and established revised evaluation rubrics for student capstones.",
    },
    Workshop: {
      title: "Hands-on Production Containerization & Cloud Telemetry Lab",
      department: "Department of Information Technology",
      venue: "Computer Systems Lab 4",
      date: "August 2026",
      headcount: 65,
      satisfaction: "4.9 / 5.0",
      specializedTitle: "Practical Milestones & Verified Competency Gain",
      specializedHighlights: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/80 border border-purple-200">
            <span className="font-bold text-purple-950">Pedagogical Skill Attainment Gain:</span>
            <span className="font-bold text-emerald-700 text-sm font-mono">+43% Surge</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div>• Milestone 1: Multi-stage Docker packaging & vulnerability auditing</div>
            <div>• Milestone 2: Automated cluster deployment with telemetry monitoring</div>
          </div>
        </div>
      ),
      summarySnippet:
        "Sixty-five participants completed a four-hour practical laboratory, successfully building and deploying resilient microservices with automated telemetry.",
    },
    Exhibition: {
      title: "Engineering Innovation Showcase & Formula Vehicle Expo",
      department: "Society of Automotive & Mechanical Engineers",
      venue: "University Central Plaza",
      date: "November 2026",
      headcount: 650,
      satisfaction: "High Footfall",
      specializedTitle: "Showcase Stalls & Footfall Analytics",
      specializedHighlights: (
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Project Stalls & Demonstrations:</span>
            <span className="font-bold font-mono text-indigo-700">24 Exhibits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Verified Campus Footfall:</span>
            <span className="font-bold font-mono text-slate-900">650+ Visitors</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Best Exhibit: Autonomous Formula Student Electric Prototype (SAE Chapter)
          </div>
        </div>
      ),
      summarySnippet:
        "Convened over 650 campus visitors and industry reviewers, spotlighting 24 interactive engineering prototypes with live vehicle track testing.",
    },
    Seminar: {
      title: "Distinguished Lecture: Ethics & Governance in Frontier AI",
      department: "Ethics, Policy & Technology Initiative",
      venue: "Chancellor Memorial Hall",
      date: "September 2026",
      headcount: 210,
      satisfaction: "4.7 / 5.0",
      specializedTitle: "Academic Accreditation & Outcome (CO/PO) Compliance",
      specializedHighlights: (
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Curriculum Outcome:</span>
            <span className="font-mono text-indigo-700 font-bold">CO2, PO8 (Professional Ethics)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Distinguished Speaker:</span>
            <span className="text-slate-600">Senior Advisory Fellow, AI Institute</span>
          </div>
        </div>
      ),
      summarySnippet:
        "The lecture addressed governance guardrails, ethical alignment methodologies, and public infrastructure requirements for foundational AI deployments.",
    },
    Social: {
      title: "Inter-Collegiate Cultural Festival & Talent Showcase",
      department: "Student Affairs & Cultural Council",
      venue: "Open Air Amphitheater",
      date: "Spring 2026",
      headcount: 820,
      satisfaction: "4.9 / 5.0",
      specializedTitle: "Public Performances & Community Engagement",
      specializedHighlights: (
        <div className="space-y-1 text-xs text-slate-700">
          <div>• 14 Competitive Collegiate Performances</div>
          <div>• 820 Verified Student & Alumni Participants</div>
          <div className="text-emerald-700 font-semibold">Exceeded safety & participation benchmarks</div>
        </div>
      ),
      summarySnippet:
        "Convened 820 attendees across music, drama, and fine arts competitions, celebrating collegiate cultural excellence.",
    },
  };

  const activeConfig = previewConfigurations[activePreviewType] || previewConfigurations.Conference;

  const faqs = [
    {
      q: "What is UniReport?",
      a: "UniReport is a specialized event documentation platform designed for universities, academic departments, student councils, and conference committees. It streamlines drafting, AI narrative synthesis, attendance auditing, and official PDF publication.",
    },
    {
      q: "How do event-type exclusive modules work?",
      a: "When you select an Event Type (such as Conference, Hackathon, Meeting, or Workshop), UniReport automatically activates dedicated modules tailored strictly to that format—including ABET/NAAC Course Outcome (CO/PO) mapping for conferences, prize tables for hackathons, action item matrices for meetings, and pre/post skill gain meters for workshops.",
    },
    {
      q: "Do I need to pay or install anything to use UniReport?",
      a: "No! UniReport runs completely in your modern browser. You can start immediately as a guest with local storage, or connect your Google account in one click for instant cloud synchronization powered by Firebase.",
    },
    {
      q: "How does Gemini AI assist in the documentation?",
      a: "Provide quick bullet points, speaker bios, or rough discussion notes. UniReport leverages Google Gemini to synthesize polished institutional prose tailored to your chosen tone (Formal Academic, Executive, Concise, or Key Highlights).",
    },
    {
      q: "Are the exported PDFs suitable for institutional accreditation audits?",
      a: "Yes. Every exported document is rendered in vector-crisp PDF format, complete with official university seals, customizable watermark security, demographic progress bars, and formal academic chair sign-off blocks.",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {/* Subtle geometric background gridlines */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Clean Unboxed Metadata Kicker (Anti-slop compliant) */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mb-5">
              <span>Institutional Event Documentation</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Outcome-Based Education (OBE)</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-indigo-600 font-bold">Vector PDF Publishing</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] mb-6 [text-wrap:balance]">
              Institutional Event Proceedings, Verified and Published in Minutes.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform raw speaker notes, rosters, and photos into verified academic proceedings
              with automated accreditation metrics, AI narrative synthesis, and one-click archival PDF export.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 flex-wrap">
              <button
                type="button"
                id="landing-hero-dashboard-btn"
                onClick={handleDashboardClick}
                className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{isAuthenticated ? "Launch Report Workspace" : "Sign In to Access Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="landing-hero-new-report-btn"
                onClick={handleNewReportClick}
                className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>{isAuthenticated ? "Create Blank Report" : "Get Started (Free)"}</span>
              </button>

              {onOpenTutorial && (
                <button
                  type="button"
                  id="landing-hero-tutorial-btn"
                  onClick={onOpenTutorial}
                  className="w-full sm:w-auto px-5 py-3.5 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Guided Walkthrough</span>
                </button>
              )}
            </div>

            {/* Proof Indicators */}
            <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                No credit card required
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                Firebase cloud autosave
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                ABET / NAAC audit-ready
              </span>
            </div>

            {/* Core 3-Pillar Scannability Cards (AI Summarization, Bulk Import, PDF Export) */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto text-left">
              {/* 1. AI Summarization */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      AI Summarization
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Synthesizes rough notes into executive academic prose with multi-tone tuning.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Bulk Roster Import */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Bulk Roster Import
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Paste rows directly from Excel or Sheets for instant demographic audit & ratios.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Vector PDF Export */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                    <FileDown className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Vector PDF Export
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Generates multi-page institutional PDFs with official seals and watermark security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. INTERACTIVE LIVE PROCEEDINGS CANVAS PREVIEW                            */}
          {/* ========================================================================= */}
          <div className="mt-12 max-w-4xl mx-auto">
            {/* Segmented Filter Control for Event Types */}
            <div className="flex items-center justify-between gap-2 mb-3 px-1 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
                Interactive Preview:
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl overflow-x-auto max-w-full">
                {(["Conference", "Hackathon", "Meeting", "Workshop", "Exhibition"] as EventType[]).map((type) => {
                  const isActive = activePreviewType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivePreviewType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {type === "Conference" && "🎓 Conference"}
                      {type === "Hackathon" && "🏆 Hackathon"}
                      {type === "Meeting" && "📋 Meeting"}
                      {type === "Workshop" && "💻 Workshop"}
                      {type === "Exhibition" && "🏛️ Exhibition"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Document Card */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden text-left transition-all duration-200">
              {/* Top Accent Stripe */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600" />

              {/* Document Header */}
              <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                    {activeConfig.department}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {activeConfig.title}
                  </h2>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {activeConfig.date}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {activeConfig.venue}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-bold">
                      Official Proceedings
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    EVENT TYPE
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {activePreviewType}
                  </div>
                </div>
              </div>

              {/* Demographics / Headcount Bar */}
              <div className="grid grid-cols-3 border-b border-slate-100 p-4 sm:p-5 bg-white text-center gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Headcount
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    {activeConfig.headcount}
                  </span>
                </div>
                <div className="border-x border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Satisfaction Metric
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-700 font-mono">
                    {activeConfig.satisfaction}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Document Seal
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 pt-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Archival Ready
                  </span>
                </div>
              </div>

              {/* Document Body: Specialized Respective Module & Summary */}
              <div className="p-6 sm:p-7 space-y-5">
                {/* Respective Specialized Module Box */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      ⚡ Respective Specialized Module ({activePreviewType})
                    </span>
                    <span className="text-[11px] text-slate-400">Exclusive Section</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {activeConfig.specializedTitle}
                  </h4>
                  {activeConfig.specializedHighlights}
                </div>

                {/* AI Executive Summary Snippet */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Executive Proceedings Narrative
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {activeConfig.summarySnippet}
                  </p>
                </div>

                {/* Sign-off Strip */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
                  <span>Signatures: Academic Chair · Department Organizing Committee</span>
                  <button
                    type="button"
                    onClick={handleDashboardClick}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start sm:self-center"
                  >
                    <span>Launch Editor with this Format</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUANTITATIVE PROOF & INSTITUTIONAL TRUST METRICS                       */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                18+
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                Academic Departments Supported
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono block">
                5 Exclusive
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                Event-Type Governance Modules
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono block">
                100% Vector
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                ABET / NAAC Audit-Ready PDFs
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                &lt; 3 Min
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                Average Synthesis Time
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ASYMMETRIC BENTO GRID: CORE CAPABILITIES                                */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
            End-to-End Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Engineered Specifically for Institutional Quality
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            No broken tables, mismatched styles, or lost notes. Complete event documentation built for compliance.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: AI Summarization & Tone Tuning (Large Span) */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                01. Core Feature · AI Summarization
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Gemini Proceedings AI with Multi-Tone Narrative Synthesis
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Paste rough keynote notes, discussion minutes, or raw bullet points. The built-in Gemini synthesizer
                transforms fragmented talking points into polished, publication-ready institutional prose across four
                curated tones (Formal Academic, Executive, Concise, or Key Highlights), automatically extracting action items and resolutions.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Capabilities:</span>
              <span className="text-slate-500 font-mono">Multi-Tone Synthesis · Action Item Extraction · Dynamic Unsaved Pulse</span>
            </div>
          </div>

          {/* Feature 2: Bulk Roster Import */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                02. Core Feature · Bulk Import
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Spreadsheet Roster Ingestion & Demographics
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Copy and paste attendee rows directly from Excel, CSV, or Google Sheets. Instantly parses total headcount,
                calculates student-to-faculty ratios, and renders vector demographic charts ready for audit review.
              </p>
            </div>

            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 pt-4 border-t border-slate-100">
              <Check className="w-3.5 h-3.5" />
              <span>Instant Excel & Sheets clipboard parsing</span>
            </div>
          </div>

          {/* Feature 3: Official Vector PDF Export */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center mb-4">
                <FileDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                03. Core Feature · PDF Export
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Archival Vector PDF Publishing Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                One-click publication into crisp multi-page vector PDFs. Features automated running headers,
                page numbering, institutional seal emblems, security watermarks, and Dean verification signature blocks.
              </p>
            </div>

            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 pt-4 border-t border-slate-100">
              <Check className="w-3.5 h-3.5" />
              <span>Vector A4 · Custom seals & watermark security</span>
            </div>
          </div>

          {/* Feature 4: Outcome-Based Education & Accreditation (Large Span) */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                04. Accreditation & Governance
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Outcome-Based Education (OBE) & CO-PO Compliance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Universities require formal proof of Course Outcome (CO) and Program Outcome (PO) mapping
                for ABET, NAAC, and NBA accreditation audits. UniReport embeds Bloom's Taxonomy cognitive levels,
                qualitative feedback summaries, and formal Dean sign-off blocks directly into the proceedings.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Criterion Alignment:</span>
              <span className="text-slate-500 font-mono">ABET Criterion 3 · NAAC Criteria 2 & 5</span>
            </div>
          </div>

          {/* Feature 5: Respective Event Modules (Full Span) */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                05. Specialized Architecture
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Event-Type Exclusive Governance Modules
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Specialized tools activate strictly within their respective report format: prize tables and Devpost links for Hackathons;
                official parliamentary minutes and action items matrices for Meetings; hands-on lab milestones and measured % skill gains for Workshops;
                and booth footfall metrics for Exhibitions.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800">Dynamic Scoping:</span>
              <span className="text-indigo-700 font-mono font-bold">Hackathon Prizes · Meeting Action Items · Workshop Skill Gain · Exhibition Stalls</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRE-BUILT TEMPLATES GALLERY                                            */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
                Pre-Configured Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Bootstrap with Verified Formats
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Start from pre-structured templates or import your custom department format.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDashboardClick}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{isAuthenticated ? "Open Template Catalog" : "Sign In to Access Catalog"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORT_TEMPLATES.slice(0, 6).map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-50/60 rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:bg-white transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-600">{tpl.category}</span>
                    <span className="text-slate-400 font-mono text-[11px]">Format</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{tpl.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                    {tpl.highlights?.[0] || "Ready to use"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTemplateClick(tpl)}
                    className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAQ ACCORDION                                                          */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
            Institutional Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-mono text-base shrink-0">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CALL TO ACTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 [text-wrap:balance]">
            Ready to Document Your Next Event with Academic Rigor?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Create verified, archival-grade proceedings in minutes. Cloud auto-saving, Google & Email authentication, and official PDF exports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              id="landing-cta-dashboard-btn"
              onClick={handleDashboardClick}
              className="w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <span>{isAuthenticated ? "Open UniReport Workspace" : "Sign In to Access Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="landing-cta-new-report-btn"
              onClick={handleNewReportClick}
              className="w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAuthenticated ? "Create Blank Report" : "Get Started"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. QUIET FOOTER                                                           */}
      {/* ========================================================================= */}
      <footer className="py-8 bg-white border-t border-slate-200 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              U
            </div>
            <span className="font-bold text-slate-800">UniReport</span>
            <span aria-hidden="true">·</span>
            <span>Institutional Event Documentation Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDashboardClick}
              className="hover:text-indigo-600 transition-colors font-medium cursor-pointer"
            >
              Workspace
            </button>
            <span aria-hidden="true">·</span>
            {onOpenTutorial && (
              <>
                <button
                  type="button"
                  onClick={onOpenTutorial}
                  className="hover:text-indigo-600 transition-colors font-medium cursor-pointer"
                >
                  Walkthrough
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={handleNewReportClick}
              className="hover:text-indigo-600 transition-colors font-medium cursor-pointer"
            >
              New Report
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenAuth}
              className="hover:text-indigo-600 transition-colors font-medium cursor-pointer"
            >
              {isAuthenticated ? "Account Profile" : "Sign In"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
