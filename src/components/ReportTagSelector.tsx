import React, { useState, useEffect } from "react";
import { Plus, Tag, Sparkles, RefreshCw, Check, CheckCheck, Lightbulb } from "lucide-react";
import { PRESET_TAGS, EventDetails } from "../types";

interface ReportTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  eventDetails?: EventDetails | null;
  reportTitle?: string;
  autoFetchOnMount?: boolean;
}

export const ReportTagSelector: React.FC<ReportTagSelectorProps> = ({
  selectedTags,
  onChange,
  eventDetails,
  reportTitle,
  autoFetchOnMount = false,
}) => {
  const [customTagInput, setCustomTagInput] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);

  // Auto-fetch suggestions when component mounts or eventDetails title/type changes
  const fetchSuggestedTags = async () => {
    setIsSuggesting(true);
    try {
      const response = await fetch("/api/gemini/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportTitle || eventDetails?.name || "Untitled Event",
          eventType: eventDetails?.eventType || "Conference",
          organization: eventDetails?.organization || "",
          department: eventDetails?.department || "",
          location: eventDetails?.location || "",
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.tags)) {
        setSuggestedTags(data.tags);
        if (data.rationale) setRationale(data.rationale);
      }
    } catch (e) {
      console.warn("Auto-tagging fetch failed:", e);
      // Local heuristic fallback suggestions
      const fallback = ["Academic", eventDetails?.eventType || "Conference", "Featured"];
      setSuggestedTags(fallback);
    } finally {
      setIsSuggesting(false);
    }
  };

  useEffect(() => {
    if (autoFetchOnMount || (eventDetails?.name && eventDetails.name.length > 5)) {
      fetchSuggestedTags();
    }
  }, [eventDetails?.name, eventDetails?.eventType, reportTitle]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
      setCustomTagInput("");
    }
  };

  const handleAcceptAllSuggestions = () => {
    const combined = Array.from(new Set([...selectedTags, ...suggestedTags]));
    onChange(combined);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. GEMINI AUTO-SUGGESTIONS STRIP */}
      <div className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini Auto-Categorization & Suggestions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSuggestedTags}
              disabled={isSuggesting}
              className="text-[10px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 cursor-pointer disabled:opacity-50"
              title="Re-analyze event details with Gemini"
            >
              <RefreshCw className={`w-3 h-3 ${isSuggesting ? "animate-spin" : ""}`} />
              <span>{isSuggesting ? "Analyzing..." : "Re-Analyze"}</span>
            </button>

            {suggestedTags.length > 0 && (
              <button
                type="button"
                onClick={handleAcceptAllSuggestions}
                className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Accept All</span>
              </button>
            )}
          </div>
        </div>

        {rationale && (
          <p className="text-[11px] text-slate-400 italic leading-snug">
            "{rationale}"
          </p>
        )}

        {/* Suggested Tags Pill Row */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {suggestedTags.length === 0 && !isSuggesting && (
            <button
              type="button"
              onClick={fetchSuggestedTags}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Click to analyze event details and generate smart category tags...</span>
            </button>
          )}

          {suggestedTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-2xs"
                    : "bg-slate-950 text-indigo-200 border-indigo-500/40 hover:border-indigo-400 hover:text-white"
                }`}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. STANDARD PRESET TAGS */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Preset Institutional Categories:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CUSTOM TAG FORM */}
      <form onSubmit={handleAddCustom} className="flex items-center gap-2 max-w-sm">
        <input
          type="text"
          value={customTagInput}
          onChange={(e) => setCustomTagInput(e.target.value)}
          placeholder="Add custom category tag..."
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl flex-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
