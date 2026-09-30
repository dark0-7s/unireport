import React, { useState } from "react";
import {
  FileText,
  FileCode,
  Plus,
  CheckCircle2,
  Sparkles,
  User as UserIcon,
  Layers,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Wand2,
  ChevronDown,
  Edit2,
  Check,
} from "lucide-react";
import { Report, User } from "../types";

interface HeaderProps {
  currentReport: Report | null;
  activeView: "landing" | "editor" | "dashboard";
  setActiveView: (view: "landing" | "editor" | "dashboard") => void;
  onNewReport: () => void;
  onSelectReport: (reportId: string) => void;
  allReports: Report[];
  isSaving: boolean;
  currentUser: User;
  onOpenAuth: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateTags?: (tags: string[]) => void;
  onOpenChat?: () => void;
  isChatOpen?: boolean;
  onOpenTemplates?: () => void;
  onOpenLatexDropin?: () => void;
  onOpenTutorial?: () => void;
  cloudSyncStatus?: "synced" | "syncing" | "error";
  lastSyncedAt?: Date;
  onForceCloudSync?: () => Promise<void> | void;
  customTemplatesCount?: number;
  onOpenRegan?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentReport,
  activeView,
  setActiveView,
  onNewReport,
  onSelectReport,
  allReports,
  isSaving,
  currentUser,
  onOpenAuth,
  onUpdateTitle,
  onOpenChat,
  isChatOpen,
  onOpenTemplates,
  onOpenLatexDropin,
  onOpenTutorial,
  onOpenRegan,
  cloudSyncStatus = "synced",
  lastSyncedAt,
  onForceCloudSync,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  const isAuthenticated = currentUser.provider === "google" || currentUser.provider === "email";

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && currentReport) {
      onUpdateTitle(tempTitle.trim());
    }
  };

  const handleManualSync = async () => {
    if (onForceCloudSync) {
      setIsSyncing(true);
      try {
        await onForceCloudSync();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand & Clean Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div
            id="brand-logo"
            onClick={() => setActiveView("landing")}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            title="UniReport Home"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-lg tracking-tight">
                  UniReport
                </span>
                <span className="text-[10px] font-bold text-indigo-700 font-mono">
                  v3.8
                </span>
              </div>
            </div>
          </div>

          {/* Primary View Switcher Tabs */}
          <nav className="flex items-center gap-1 pl-3 border-l border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView("landing")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === "landing"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Home
            </button>

            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveView("dashboard")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeView === "dashboard"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Repository ({allReports.length})
                </button>

                {currentReport && (
                  <button
                    type="button"
                    onClick={() => setActiveView("editor")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeView === "editor"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Editor
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Active Report Title Inline Rename */}
          {isAuthenticated && activeView === "editor" && currentReport && (
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSubmit();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="text-xs font-bold text-slate-900 px-2.5 py-1 border border-indigo-500 rounded-lg focus:outline-hidden bg-white shadow-xs w-64"
                  />
                  <button
                    type="button"
                    onClick={handleTitleSubmit}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempTitle(currentReport.title || "");
                    setIsEditingTitle(true);
                  }}
                  className="text-xs font-bold text-slate-800 hover:text-indigo-600 max-w-[240px] truncate flex items-center gap-1.5 group cursor-pointer"
                  title="Click to rename report"
                >
                  <span className="truncate">{currentReport.title || "Untitled Proceedings"}</span>
                  <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Launchers & Actions */}
        <div className="flex items-center gap-2">
          {/* Quiet Unboxed Autosave Status */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
              <span>{isSaving ? "Saving..." : "Autosaved"}</span>
            </div>
          )}

          {/* Secondary Tools Dropdown (Templates, LaTeX, Tutorial) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Templates & Tools</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isToolsDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs space-y-1 animate-in fade-in duration-150"
                onClick={() => setIsToolsDropdownOpen(false)}
              >
                {onOpenTemplates && (
                  <button
                    type="button"
                    onClick={isAuthenticated ? onOpenTemplates : onOpenAuth}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Template Library</span>
                  </button>
                )}

                {onOpenLatexDropin && (
                  <button
                    type="button"
                    onClick={isAuthenticated ? onOpenLatexDropin : onOpenAuth}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    <span>LaTeX Drop-In Importer</span>
                  </button>
                )}

                {onOpenTutorial && (
                  <button
                    type="button"
                    onClick={onOpenTutorial}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Interactive Tutorial</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Gemini AI Assistant Drawer Button */}
          {onOpenChat && (
            <button
              type="button"
              onClick={isAuthenticated ? onOpenChat : onOpenAuth}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                isChatOpen
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
              }`}
              title="Open Gemini Institutional Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
          )}

          {/* REGAN Automated Agent Hero Button */}
          {onOpenRegan && (
            <button
              type="button"
              onClick={isAuthenticated ? onOpenRegan : onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-black rounded-xl flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/20 cursor-pointer transition-transform hover:scale-102"
              title="Launch REGAN Automated Synthesis Studio"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              <span>REGAN Studio</span>
            </button>
          )}

          {/* + New Report CTA (Opens 3-Path Wizard) */}
          <button
            type="button"
            onClick={isAuthenticated ? onNewReport : onOpenAuth}
            className="px-3.5 py-1.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="Create new report"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Report</span>
          </button>

          {/* Profile / Auth Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer group"
              title={`Account: ${currentUser.name}`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-400 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 max-w-[80px] truncate hidden md:inline group-hover:text-indigo-600">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
