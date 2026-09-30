import React, { useState } from "react";
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  Briefcase,
  Presentation,
  LayoutTemplate,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Check,
  ArrowUpDown,
} from "lucide-react";
import { Report, ReportTemplate, User, CustomTemplate } from "../types";
import { REPORT_TEMPLATES } from "../data/templates";
import { getCustomTemplates } from "../lib/customTemplatesStorage";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { ReportTagBadge } from "./ReportTagBadge";

interface DashboardProps {
  reports: Report[];
  currentUser: User;
  onOpenReport: (reportId: string) => void;
  onNewReport: () => void;
  onSelectTemplate: (template: ReportTemplate) => void;
  onDuplicateReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
  onReorderReports?: (reorderedReports: Report[]) => void;
  onSelectCustomTemplate?: (customTemplate: CustomTemplate) => void;
  onOpenTemplateManager?: () => void;
  onOpenCreateTemplate?: () => void;
  onOpenLatexDropin?: () => void;
  onEditCustomTemplate?: (template: CustomTemplate) => void;
  onUpdateReportTags?: (reportId: string, tags: string[]) => void;
  onOpenAuth?: () => void;
  onOpenLanding?: () => void;
  onOpenTutorial?: () => void;
  onOpenRegan?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reports,
  currentUser,
  onOpenReport,
  onNewReport,
  onSelectTemplate,
  onDuplicateReport,
  onDeleteReport,
  onReorderReports,
  onSelectCustomTemplate,
  onOpenTemplateManager,
  onOpenCreateTemplate,
  onOpenLatexDropin,
  onEditCustomTemplate,
  onUpdateReportTags,
  onOpenAuth,
  onOpenLanding,
  onOpenTutorial,
  onOpenRegan,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState<string>("All");
  const [previewingTemplate, setPreviewingTemplate] = useState<ReportTemplate | null>(null);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  // Drag and Drop State
  const [draggedReportId, setDraggedReportId] = useState<string | null>(null);
  const [dragOverReportId, setDragOverReportId] = useState<string | null>(null);
  const [reorderFeedback, setReorderFeedback] = useState<string | null>(null);

  const totalAttendeesAll = reports.reduce(
    (acc, curr) => acc + (curr.content.attendance.totalAttendees || 0),
    0
  );
  const completedCount = reports.filter((r) => r.status === "completed").length;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.content.eventDetails.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.content.eventDetails.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedEventTypeFilter === "All" ||
      report.content.eventDetails.eventType === selectedEventTypeFilter;

    return matchesSearch && matchesType;
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedReportId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverReportId !== id) {
      setDragOverReportId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedReportId;
    setDraggedReportId(null);
    setDragOverReportId(null);

    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = reports.findIndex((r) => r.id === sourceId);
    const targetIndex = reports.findIndex((r) => r.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...reports];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    if (onReorderReports) {
      onReorderReports(reordered);
      setReorderFeedback("Report order updated & persisted to Firestore profile");
      setTimeout(() => setReorderFeedback(null), 3000);
    }
  };

  const handleDragEnd = () => {
    setDraggedReportId(null);
    setDragOverReportId(null);
  };

  const handleMoveNudge = (id: string, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = reports.findIndex((r) => r.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= reports.length) return;

    const reordered = [...reports];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    if (onReorderReports) {
      onReorderReports(reordered);
      setReorderFeedback("Report order updated & persisted to Firestore profile");
      setTimeout(() => setReorderFeedback(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Institutional Event Reporting
              </span>
              {currentUser.provider === "google" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Google Verified Account
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.provider === "google" && currentUser.name && currentUser.name !== "Alice Johnson" && currentUser.name !== "Event Organizer"
                ? `Welcome back, ${currentUser.name}!`
                : "Event Documentation Dashboard"}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Create, synthesize, and export verified, publication-ready event documentation and official PDF proceedings in minutes.
            </p>
            {onOpenLanding && (
              <button
                type="button"
                id="dashboard-explore-overview-link"
                onClick={onOpenLanding}
                className="mt-2 text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors hover:underline"
              >
                <span>Learn how UniReport works · View App Overview →</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {currentUser.provider !== "google" && onOpenAuth && (
              <button
                id="dashboard-google-signin-cta"
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] shrink-0"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Sign In with Google</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                id="dashboard-tutorial-banner-btn"
                type="button"
                onClick={onOpenTutorial}
                className="px-4 py-2.5 text-xs font-bold text-indigo-100 hover:text-white bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-500/40 rounded-xl flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] shrink-0"
                title="Launch Step-by-Step Interactive Tutorial"
              >
                <HelpCircle className="w-4 h-4 text-indigo-300" />
                <span>Quick Tutorial</span>
              </button>
            )}

            {onOpenRegan && (
              <button
                id="dashboard-launch-regan-btn"
                type="button"
                onClick={onOpenRegan}
                className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] ring-1 ring-white/30 shrink-0 cursor-pointer"
                title="Launch REGAN Automated Agent with Side-by-Side Editor"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span>Launch REGAN Agent</span>
              </button>
            )}

            <button
              id="dashboard-new-blank-report-btn"
              onClick={onNewReport}
              className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Blank Report
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Reports</span>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{reports.length}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Verified / Completed</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{completedCount}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Documented Headcount</span>
            <p className="text-xl sm:text-2xl font-black text-indigo-300 mt-0.5">{totalAttendeesAll}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Avg Creation Time</span>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">&lt;4 min</p>
          </div>
        </div>
      </div>

      {/* REGAN AUTOMATED AGENT VIBE FEATURE HERO BANNER */}
      {onOpenRegan && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-5 sm:p-6 border border-indigo-800/40 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white tracking-tight">
                  Meet REGAN: Automated Report Synthesizer & Vibe Coding Editor
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-mono">
                  Autonomous Agent
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Dump raw unstructured notes, agenda schedules, speaker lists, or event briefings. REGAN automatically generates the multi-page proceedings report with a real-time side-by-side interactive editor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenRegan}
              className="w-full md:w-auto px-4 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <span>Launch REGAN Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, venue, or department..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["All", "Conference", "Workshop", "Seminar", "Hackathon"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedEventTypeFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedEventTypeFilter === filter
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* REPORTS LIST */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Your Event Reports</h2>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                Drag & Drop Reorder Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag cards by the grip handle to customize report sequence · Order is automatically persisted to your Firestore profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {reorderFeedback && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                {reorderFeedback}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredReports.length} of {reports.length}
            </span>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No reports found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Get started by creating a new blank report or picking a template.
            </p>
            <button
              onClick={onNewReport}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Report</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, report.id)}
                onDragOver={(e) => handleDragOver(e, report.id)}
                onDrop={(e) => handleDrop(e, report.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onOpenReport(report.id)}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group relative select-none ${
                  draggedReportId === report.id
                    ? "opacity-35 scale-[0.98] border-indigo-400 border-dashed"
                    : dragOverReportId === report.id
                    ? "ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/20 scale-[1.01]"
                    : "border-slate-200 hover:shadow-md hover:border-indigo-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {/* Drag Handle */}
                      <div
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag and drop to reorder"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Quick Move Up/Down Controls */}
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleMoveNudge(report.id, "up", e)}
                          className="p-0.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Move up in order"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveNudge(report.id, "down", e)}
                          className="p-0.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Move down in order"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          report.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(report.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {report.title || "Untitled Report"}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{report.content.eventDetails.date || "Date not specified"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{report.content.attendance.totalAttendees || 0} Attendees</span>
                    </div>
                  </div>

                  {report.tags && report.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {report.tags.map((t) => (
                        <ReportTagBadge key={t} tag={t} size="sm" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateReport(report);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicate Report"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportToDelete(report);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QUICK & CUSTOM TEMPLATES SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Report Templates & Pre-Designed Layouts</h2>
            <p className="text-xs text-slate-500">
              Launch from system publication standards or build custom institutional layouts with custom margins, fonts, and watermarks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateTemplate && (
              <button
                type="button"
                onClick={onOpenCreateTemplate}
                className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pre-design Custom Template</span>
              </button>
            )}

            {onOpenTemplateManager && (
              <button
                type="button"
                onClick={onOpenTemplateManager}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
                <span>All Templates</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Templates Row if available */}
        {getCustomTemplates().length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Pre-Designed Templates ({getCustomTemplates().length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCustomTemplates().slice(0, 3).map((ct) => (
                <div
                  key={ct.id}
                  className="bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          style={{ backgroundColor: ct.typography?.primaryColor || "#312e81" }}
                          className="w-2.5 h-2.5 rounded-full"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          {ct.category || "Academic"} Custom
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ct.margins?.left || 20}mm · {ct.typography?.fontFamily || "Helvetica"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">{ct.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {ct.description || "Custom pre-designed layout with custom margin geometry, font, and watermark."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {onEditCustomTemplate && (
                      <button
                        type="button"
                        onClick={() => onEditCustomTemplate(ct)}
                        className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                      >
                        Edit Design
                      </button>
                    )}
                    {onSelectCustomTemplate && (
                      <button
                        type="button"
                        onClick={() => onSelectCustomTemplate(ct)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>Use Template</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Publication Standards */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            System Publication Standards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.slice(0, 3).map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {tpl.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{tpl.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPreviewingTemplate(tpl)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(tpl)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
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

      {/* DELETE MODAL */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Report?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to permanently delete "{reportToDelete.title}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteReport(reportToDelete.id);
                  setReportToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE PREVIEW MODAL */}
      <TemplatePreviewModal
        isOpen={Boolean(previewingTemplate)}
        onClose={() => setPreviewingTemplate(null)}
        template={previewingTemplate}
        onUseTemplate={onSelectTemplate}
      />
    </div>
  );
};
