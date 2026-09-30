import React, { useState } from "react";
import {
  X,
  Sparkles,
  Bot,
  Layers,
  FileText,
  ArrowRight,
  GraduationCap,
  Trophy,
  Laptop,
  ClipboardCheck,
  CheckCircle2,
  Calendar,
  Building,
  Wand2,
  Plus,
} from "lucide-react";
import { EventType, User } from "../types";

interface CreateReportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBlank: (eventType: EventType, title?: string) => void;
  onStartWithRegan: () => void;
  onStartWithTemplate: (templateId: string) => void;
  currentUser: User;
}

const STARTER_TEMPLATES = [
  {
    id: "conf-naac",
    title: "Accredited Conference (NAAC / ABET)",
    eventType: "Conference" as EventType,
    icon: GraduationCap,
    accent: "from-blue-600 to-indigo-600",
    description: "Includes CO-PO mapping, keynote dossiers, peer review paper metrics, and HOD sign-off.",
    tags: ["Academic", "OBE Mapped", "NAAC Criteria 3"],
  },
  {
    id: "hack-tech",
    title: "National Hackathon & Sprint",
    eventType: "Hackathon" as EventType,
    icon: Trophy,
    accent: "from-amber-500 to-orange-600",
    description: "Configured with problem statements, prize leaderboard, sponsor tiers, and demo rubric.",
    tags: ["Hackathon", "Prizes", "Sponsors"],
  },
  {
    id: "work-devops",
    title: "Hands-on Technical Workshop",
    eventType: "Workshop" as EventType,
    icon: Laptop,
    accent: "from-purple-600 to-indigo-600",
    description: "Includes lab milestone milestones, pre/post skill gain percentages, and toolchains.",
    tags: ["Hands-on", "Pre/Post Gain", "Lab Repo"],
  },
  {
    id: "meet-board",
    title: "Department Board of Studies Meeting",
    eventType: "Meeting" as EventType,
    icon: ClipboardCheck,
    accent: "from-emerald-600 to-teal-600",
    description: "Pre-structured with presiding officer, ratified resolutions, and action items matrix.",
    tags: ["Official Minutes", "Resolutions", "Action Matrix"],
  },
];

export const CreateReportWizard: React.FC<CreateReportWizardProps> = ({
  isOpen,
  onClose,
  onStartBlank,
  onStartWithRegan,
  onStartWithTemplate,
  currentUser,
}) => {
  const [selectedEventType, setSelectedEventType] = useState<EventType>("Conference");
  const [reportTitle, setReportTitle] = useState("");

  if (!isOpen) return null;

  const handleBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartBlank(selectedEventType, reportTitle.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Create New Institutional Report
              </h2>
              <p className="text-xs text-slate-400">
                Choose your preferred creation pathway for publication-ready proceedings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 3 Paths */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PATH 1: HERO AI SYNTHESIZER (REGAN) */}
          <div
            onClick={() => {
              onClose();
              onStartWithRegan();
            }}
            className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-xl hover:shadow-indigo-500/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                    ⚡ Fast-Track AI Synthesis
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Recommended</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Synthesize with REGAN AI Studio</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Paste raw briefing notes, schedule agenda, or select an institutional preset. REGAN autonomously structures attendance, keynotes, CO-PO outcomes, and full executive text in seconds.
                </p>
              </div>

              <div className="shrink-0 flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-colors">
                  <Wand2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* PATH 2: POPULAR ACCREDITED TEMPLATES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Or Start from an Institutional Standard Template:
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Pre-populated OBE fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      onClose();
                      onStartWithTemplate(tpl.id);
                    }}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 transition-all cursor-pointer group space-y-2 shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-950">
                          {tpl.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      {tpl.description}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      {tpl.tags.map((t, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PATH 3: BLANK GUIDED REPORT */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Or Start Blank with Guided Steps</span>
            </h4>

            <form onSubmit={handleBlankSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Event Category</label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Optional Working Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual International Symposium on AI..."
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Launch Guided Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
