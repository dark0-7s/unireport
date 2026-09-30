import React, { useState } from "react";
import { Sparkles, Check, Lock, Unlock, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { SummaryData, EventDetails } from "../../types";

interface SummaryTabProps {
  summary: SummaryData;
  eventDetails: EventDetails;
  onChange: (summary: Partial<SummaryData>) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  summary,
  eventDetails,
  onChange,
  onPrevious,
  onNext,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      let narrative = "";
      const eventName = eventDetails.name || "The institutional event";
      const dept = eventDetails.department ? `organized by the ${eventDetails.department}` : "";

      if (summary.tone === "Formal") {
        narrative = `${eventName}, ${dept}, successfully convened stakeholders, faculty delegates, and registered attendees for comprehensive proceedings. Through structured technical sessions, keynote lectures, and collaborative discussions, the event fulfilled key departmental benchmarks and established an authoritative precedent for subsequent academic symposiums.`;
      } else if (summary.tone === "Executive") {
        narrative = `Executive Proceedings Brief: ${eventName} demonstrated exceptional institutional engagement, achieving all targeted milestones. Key outcomes include inter-departmental alignment, documented attendance growth, and decisive sponsorship commitments for upcoming programs.`;
      } else if (summary.tone === "Highlights") {
        narrative = `Key Highlights: • Convened full-capacity attendees at ${eventDetails.location || "campus venue"} • Delivered flagship keynote address and technical breakouts • Received exceptional attendee satisfaction • Scheduled follow-up committee review for next fiscal cycle.`;
      } else {
        narrative = `Official Session Minutes: ${eventName} concluded proceedings with unanimous administrative approval. All scheduled sessions were executed according to published agenda and documented for archival records.`;
      }

      onChange({
        polishedText: narrative,
        regenerateCount: (summary.regenerateCount || 0) + 1,
        lastPolishedAt: new Date().toISOString(),
      });
      setIsSynthesizing(false);
    }, 900);
  };

  const handleFinalize = () => {
    onChange({
      isFinalized: !summary.isFinalized,
      finalizedText: !summary.isFinalized ? summary.polishedText || summary.rawNotes : "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl font-bold text-slate-900">AI Summary Synthesis</h2>
        <p className="text-xs text-slate-500 mt-1">
          Transform raw bullet points and minutes into publication-ready executive prose.
        </p>
      </div>

      {/* Raw Notes Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Raw Session Notes & Bullets
          </label>
          <span className="text-[11px] text-slate-400">Rough notes, transcripts, or milestones</span>
        </div>

        <textarea
          rows={5}
          value={summary.rawNotes}
          onChange={(e) => onChange({ rawNotes: e.target.value })}
          placeholder="Paste or type quick bullet points:
• 3 parallel breakout tracks completed
• Distinguished keynote speech on responsible technologies
• High engagement and positive participant feedback"
          className="w-full p-3.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
        />

        {/* Tone Selection & Synthesize Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Target Tone:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(["Formal", "Executive", "Concise", "Highlights"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => onChange({ tone })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    summary.tone === tone
                      ? "bg-white text-purple-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSynthesizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isSynthesizing ? "Synthesizing..." : "Synthesize AI Narrative"}</span>
          </button>
        </div>
      </div>

      {/* Synthesized / Final Narrative Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {summary.isFinalized ? "Locked Publication Narrative" : "Polished Proceedings Summary"}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleFinalize}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
              summary.isFinalized
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {summary.isFinalized ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{summary.isFinalized ? "Finalized (Locked)" : "Lock for Publication"}</span>
          </button>
        </div>

        <textarea
          rows={6}
          disabled={summary.isFinalized}
          value={summary.isFinalized ? summary.finalizedText : summary.polishedText}
          onChange={(e) =>
            onChange(
              summary.isFinalized
                ? { finalizedText: e.target.value }
                : { polishedText: e.target.value }
            )
          }
          placeholder="Click 'Synthesize AI Narrative' above or type directly here..."
          className={`w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-300 leading-relaxed font-sans ${
            summary.isFinalized ? "bg-slate-50 text-slate-600 cursor-not-allowed" : "bg-white"
          }`}
        />
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attendance</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <span>Continue to Speakers & Guests</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
