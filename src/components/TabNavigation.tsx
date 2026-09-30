import React from "react";
import {
  FileText,
  Users,
  Sparkles,
  UserCheck,
  Image,
  Eye,
  GraduationCap,
  Trophy,
  ClipboardCheck,
  Laptop,
  Store,
  PartyPopper,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Report, EventType } from "../types";

export type TabId =
  | "details"
  | "attendance"
  | "guests"
  | "summary"
  | "specialized"
  | "images"
  | "preview";

interface TabNavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  report: Report;
}

function getSpecializedTabConfig(eventType: EventType, content: Report["content"]) {
  switch (eventType) {
    case "Conference":
    case "Seminar":
      return {
        id: "specialized" as TabId,
        name: "Accreditation & CO/PO",
        shortName: "Accreditation",
        icon: GraduationCap,
        badge: content.accreditation?.hodSignOffApproved
          ? "Approved"
          : content.accreditation?.courseOutcomeMapping
          ? "Mapped"
          : "OBE",
      };
    case "Hackathon":
      const awardCount = content.hackathon?.awards?.length ?? content.awards?.length ?? 0;
      return {
        id: "specialized" as TabId,
        name: "Hackathon & Awards",
        shortName: "Awards",
        icon: Trophy,
        badge: awardCount > 0 ? `${awardCount} Awards` : "Prizes",
      };
    case "Meeting":
      const actionCount = content.meeting?.actionItems?.length ?? 0;
      return {
        id: "specialized" as TabId,
        name: "Minutes & Actions",
        shortName: "Minutes",
        icon: ClipboardCheck,
        badge: actionCount > 0 ? `${actionCount} Actions` : "Minutes",
      };
    case "Workshop":
      const labCount = content.workshop?.handsOnExercises?.length ?? 0;
      return {
        id: "specialized" as TabId,
        name: "Lab & Skill Metrics",
        shortName: "Lab Metrics",
        icon: Laptop,
        badge: labCount > 0 ? `${labCount} Labs` : "Hands-on",
      };
    case "Exhibition":
      const stallCount = content.exhibition?.stallsOrBoothsCount ?? 0;
      return {
        id: "specialized" as TabId,
        name: "Exhibits & Showcase",
        shortName: "Exhibits",
        icon: Store,
        badge: stallCount > 0 ? `${stallCount} Stalls` : "Booths",
      };
    case "Social":
    default:
      const actCount = content.exhibition?.highlightExhibits?.length ?? 0;
      return {
        id: "specialized" as TabId,
        name: "Activities & Highlights",
        shortName: "Activities",
        icon: PartyPopper,
        badge: actCount > 0 ? `${actCount} Acts` : "Cultural",
      };
  }
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  report,
}) => {
  const specializedTab = getSpecializedTabConfig(
    report.content.eventDetails.eventType,
    report.content
  );

  // Calculate Report Readiness Score
  let completedSections = 0;
  const totalSections = 6;
  if (report.content.eventDetails.name && report.content.eventDetails.location) completedSections++;
  if (report.content.attendance.totalAttendees > 0) completedSections++;
  if (report.content.guests.length > 0) completedSections++;
  if (report.content.summary.finalizedText || report.content.summary.polishedText) completedSections++;
  if (report.content.accreditation || report.content.hackathon || report.content.workshop || report.content.meeting) completedSections++;
  if ((report.content.images && report.content.images.length > 0) || report.content.summary.isFinalized) completedSections++;

  const readinessPercent = Math.round((completedSections / totalSections) * 100);

  const STAGES = [
    {
      stageNum: "1",
      stageLabel: "Identity & Participants",
      tabs: [
        { id: "details" as TabId, name: "Event Details", icon: FileText },
        { id: "attendance" as TabId, name: "Attendance & Metrics", icon: Users },
        { id: "guests" as TabId, name: "Speakers & Keynotes", icon: UserCheck },
      ],
    },
    {
      stageNum: "2",
      stageLabel: "Proceedings & Outcomes",
      tabs: [
        { id: "summary" as TabId, name: "Executive Summary", icon: Sparkles },
        { id: "specialized" as TabId, name: specializedTab.name, icon: specializedTab.icon },
      ],
    },
    {
      stageNum: "3",
      stageLabel: "Media & Final PDF",
      tabs: [
        { id: "images" as TabId, name: "Photo Gallery", icon: Image },
        { id: "preview" as TabId, name: "Vector PDF Preview", icon: Eye, isHighlight: true },
      ],
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Readiness & Milestone Header */}
        <div className="py-2.5 flex items-center justify-between border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 uppercase tracking-wider text-[10px]">
              Proceedings Workspace
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium hidden sm:inline">
              3-Stage Progressive Workflow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
              <span className="font-bold text-slate-700 text-[11px] font-mono">
                {readinessPercent}% Complete
              </span>
            </div>

            {readinessPercent >= 80 && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                Publication Ready
              </span>
            )}
          </div>
        </div>

        {/* 3-Stage Tab Navigation Bar */}
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto py-2 scrollbar-thin">
          {STAGES.map((stg) => {
            const isStageActive = stg.tabs.some((t) => t.id === activeTab);
            return (
              <div key={stg.stageNum} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Stage Title Indicator */}
                <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-1">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${isStageActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {stg.stageNum}
                  </span>
                  <span className={isStageActive ? "text-slate-800" : "text-slate-400"}>
                    {stg.stageLabel}:
                  </span>
                </div>

                {/* Stage Tab Buttons */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                  {stg.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : tab.isHighlight
                            ? "text-indigo-700 hover:bg-indigo-50 font-black"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
