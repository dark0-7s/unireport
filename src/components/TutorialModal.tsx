import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileText,
  Users,
  Printer,
  UserCheck,
  Download,
  BookOpen,
  Tag,
  Copy,
  RotateCcw,
  Play,
} from "lucide-react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewReport: () => void;
  onOpenSampleReport?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onStartNewReport,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [simulatedTone, setSimulatedTone] = useState<"Formal" | "Executive" | "Concise">("Formal");
  const [copiedRoster, setCopiedRoster] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>("External");

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCopiedRoster(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, tutorialSteps.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const tutorialSteps = [
    {
      id: "details",
      title: "1. Event Details & Classification",
      badge: "Step 1 of 5",
      icon: FileText,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description:
        "Every official report begins with institutional metadata. Fill in the event title, hosting department, venue, date, and governance tags.",
      tips: [
        "Select your Event Type (Conference, Hackathon, Meeting, Workshop, Exhibition) to unlock exclusive governance modules like ABET/NAAC CO-PO mappings, prize tables, or meeting action items.",
        "Add classification tags like Urgent, Internal, or External for easy categorization across your dashboard.",
        "Headers in the exported PDF automatically feature your university faculty, department seal, and verification status.",
      ],
      interactiveType: "details_demo",
    },
    {
      id: "attendance",
      title: "2. Bulk Attendance Import & Analytics",
      badge: "Step 2 of 5",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description:
        "Forget typing hundreds of names manually. Simply copy rows from Google Sheets or Excel and paste them into the Bulk Attendance box.",
      tips: [
        "UniReport automatically parses tab-separated or comma-separated rows into verified participant lists.",
        "Calculates instant demographic ratios: Students, Faculty, and External Industry Delegates.",
        "Track participant satisfaction scores to benchmark event impact.",
      ],
      interactiveType: "attendance_demo",
    },
    {
      id: "summary",
      title: "3. AI Summary Synthesis with Gemini",
      badge: "Step 3 of 5",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description:
        "Turn raw bullet points, chat notes, or keynote minutes into publication-ready institutional prose in seconds using Google Gemini.",
      tips: [
        "Choose your target tone: Formal Academic, Executive Brief, Concise Minutes, or Key Highlights.",
        "Click 'Synthesize Narrative' to let AI write cohesive, professional paragraphs.",
        "Directly edit, fine-tune, or lock finalized text for institutional publication.",
      ],
      interactiveType: "summary_demo",
    },
    {
      id: "guests",
      title: "4. Keynotes, Guests & Photo Gallery",
      badge: "Step 4 of 5",
      icon: UserCheck,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description:
        "Honor distinguished speakers, keynote presenters, and corporate partners with structured biographies and photo documentation.",
      tips: [
        "Add guest designations, academic affiliations, and biographical notes.",
        "Use the built-in AI Bio Generator to turn rough credentials into elegant speaker profiles.",
        "Upload high-resolution event photography into the visual gallery with automated PDF layout.",
      ],
      interactiveType: "guests_demo",
    },
    {
      id: "export",
      title: "5. Templates, Drop-in LaTeX & PDF Export",
      badge: "Step 5 of 5",
      icon: Printer,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description:
        "Choose from 5 publication-grade templates, drop in custom LaTeX code, and generate verified vector PDF files ready for printing and archiving.",
      tips: [
        "Switch seamlessly between Academic Proceedings, Corporate Executive, and Minimalist templates.",
        "Need IEEE or ACM formats? Drop in your custom LaTeX template with the LaTeX Transformer.",
        "Click 'Export Official PDF' for clean vector typography, official seal headers, and signature lines.",
      ],
      interactiveType: "export_demo",
    },
  ];

  const currentData = tutorialSteps[currentStep];
  const StepIcon = currentData.icon;

  const handleFinishTutorial = () => {
    localStorage.setItem("unireport_tutorial_viewed", "true");
    onClose();
  };

  const handleStartReportFromTutorial = () => {
    localStorage.setItem("unireport_tutorial_viewed", "true");
    onClose();
    onStartNewReport();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="tutorial-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                Interactive UniReport Guide
              </h2>
              <p className="text-[11px] text-slate-500">
                Master rapid event documentation, AI synthesis & PDF exports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              Use ← → keys
            </span>
            <button
              type="button"
              id="tutorial-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close Tutorial (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Navigation Bar */}
        <div className="bg-slate-100/70 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {tutorialSteps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentStep === idx
                    ? "bg-white text-indigo-700 shadow-2xs border border-indigo-200"
                    : idx < currentStep
                    ? "text-emerald-700 hover:bg-white/60"
                    : "text-slate-500 hover:bg-white/40"
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-mono font-bold">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[90px] sm:max-w-none">
                  {step.title.split(". ")[1] || step.title}
                </span>
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-slate-500 font-semibold shrink-0">
            {currentStep + 1} / {tutorialSteps.length}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Step Header */}
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${currentData.color}`}
            >
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {currentData.badge}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{currentData.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {currentData.description}
              </p>
            </div>
          </div>

          {/* Interactive Simulation Container */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
              <Play className="w-3 h-3 text-indigo-600" />
              <span>Interactive Workflow Simulation</span>
            </div>

            {/* DEMO 1: EVENT DETAILS */}
            {currentData.interactiveType === "details_demo" && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Event Title</span>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800">
                      Annual Engineering & AI Symposium 2026
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">
                      Faculty / Department
                    </span>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800">
                      Faculty of Engineering & Computer Science
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1.5">
                    Click to toggle governance tag:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["External", "Academic", "Urgent", "Confidential"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          selectedTag === tag
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DEMO 2: ATTENDANCE */}
            {currentData.interactiveType === "attendance_demo" && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700">
                    Bulk Spreadsheet Copy & Paste:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCopiedRoster(true);
                      setTimeout(() => setCopiedRoster(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors self-start"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedRoster ? "Parsed 485 Records!" : "Simulate Excel Paste"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">TOTAL HEADCOUNT</span>
                    <span className="text-base font-black text-slate-900">
                      {copiedRoster ? "485" : "320"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold block">STUDENTS</span>
                    <span className="text-base font-black text-emerald-700">
                      {copiedRoster ? "310" : "210"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                    <span className="text-[10px] text-indigo-700 font-bold block">GUESTS / FACULTY</span>
                    <span className="text-base font-black text-indigo-700">
                      {copiedRoster ? "175" : "110"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DEMO 3: AI SYNTHESIS */}
            {currentData.interactiveType === "summary_demo" && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Select Synthesis Tone:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(["Formal", "Executive", "Concise"] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setSimulatedTone(tone)}
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
                          simulatedTone === tone
                            ? "bg-white text-purple-700 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl text-slate-700 leading-relaxed font-sans">
                  {simulatedTone === "Formal" && (
                    <p>
                      <strong>[Formal Academic Tone]:</strong> The Annual Engineering & AI Symposium
                      convened 485 verified delegates across 18 regional institutions. Anchored by
                      distinguished keynote lectures in Generative Intelligence and Distributed
                      Systems, the symposium evaluated 24 competitive poster presentations and
                      culminated in corporate-sponsored scholarship awards.
                    </p>
                  )}
                  {simulatedTone === "Executive" && (
                    <p>
                      <strong>[Executive Brief Tone]:</strong> High-impact institutional symposium
                      attended by 485 delegates. Secured $15,000 in industry scholarships, featured 3
                      parallel research tracks, and achieved a 4.8/5.0 participant satisfaction
                      rating.
                    </p>
                  )}
                  {simulatedTone === "Concise" && (
                    <p>
                      <strong>[Concise Minutes Tone]:</strong> 485 attendees present. Keynotes
                      delivered by invited faculty. 24 student posters presented; 6 corporate
                      awards disbursed. Next symposium scheduled for Fall 2027.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* DEMO 4: SPEAKERS & GUESTS */}
            {currentData.interactiveType === "guests_demo" && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      JL
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Dr. Jordan Lee</h4>
                      <p className="text-[11px] text-slate-500">
                        Senior Research Scientist · Quantum Machine Learning
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Keynote Speaker
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50/50 border border-amber-200/80 rounded-lg text-amber-900 text-[11px]">
                  💡 <strong>One-Click AI Bios:</strong> Enter basic credentials and click "AI
                  Polish Bio" to generate cohesive introductions for proceedings.
                </div>
              </div>
            )}

            {/* DEMO 5: EXPORT & TEMPLATES */}
            {currentData.interactiveType === "export_demo" && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Built-in Layouts:</span>
                  <span className="text-[11px] text-slate-500">
                    5 Presets + LaTeX Transformer
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Classic Academic",
                    "Modern Corporate",
                    "Workshop & Lab",
                    "Minimalist",
                    "Drop-in LaTeX",
                  ].map((tpl) => (
                    <div
                      key={tpl}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center font-semibold text-slate-800"
                    >
                      {tpl}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Vector typography, seal headers & sign-offs
                  </span>
                  <div className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Official PDF</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Takeaway Tips */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Key Tips & Best Practices
            </h4>
            <div className="space-y-2">
              {currentData.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <button
                type="button"
                id="tutorial-prev-btn"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              id="tutorial-restart-btn"
              onClick={() => setCurrentStep(0)}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
              title="Restart Tutorial"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep < tutorialSteps.length - 1 ? (
              <button
                type="button"
                id="tutorial-next-btn"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <span>Next: {tutorialSteps[currentStep + 1].title.split(". ")[1]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="tutorial-complete-btn"
                  onClick={handleFinishTutorial}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
                >
                  Close Tour
                </button>
                <button
                  type="button"
                  id="tutorial-start-report-btn"
                  onClick={handleStartReportFromTutorial}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <span>Start Drafting Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
