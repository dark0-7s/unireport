import React from "react";
import {
  Calendar,
  MapPin,
  Building,
  User as UserIcon,
  Tag as TagIcon,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";
import { EventDetails, EventType, ReportTemplate, CustomTemplate } from "../../types";
import { ReportTagSelector } from "../ReportTagSelector";

interface EventDetailsTabProps {
  details: EventDetails;
  onChange: (details: Partial<EventDetails>) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onNext: () => void;
  onApplyTemplate?: (template: ReportTemplate) => void;
  onApplyCustomTemplate?: (template: CustomTemplate) => void;
}

export const EventDetailsTab: React.FC<EventDetailsTabProps> = ({
  details,
  onChange,
  tags,
  onTagsChange,
  onNext,
}) => {
  const eventTypes: EventType[] = [
    "Conference",
    "Workshop",
    "Seminar",
    "Hackathon",
    "Social",
    "Exhibition",
    "Meeting",
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Event Details & Classification</h2>
        <p className="text-xs text-slate-500 mt-1">
          Capture core institutional metadata used for official PDF cover headers and audit records.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Event Title */}
        <div>
          <label htmlFor="event-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Event Name / Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="event-name"
            type="text"
            required
            value={details.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Annual Technology & Innovation Summit 2026"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Event Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="event-date"
                type="date"
                required
                value={details.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Venue / Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="event-location"
                type="text"
                required
                value={details.location}
                onChange={(e) => onChange({ location: e.target.value })}
                placeholder="e.g. Grand Auditorium B & Campus Arena"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Event Type & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-type" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Event Type
            </label>
            <select
              id="event-type"
              value={details.eventType}
              onChange={(e) => onChange({ eventType: e.target.value as EventType })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-600 font-medium mt-1.5 flex items-center gap-1">
              <span>⚡ Activates exclusive module:</span>
              <strong className="font-bold">
                {details.eventType === "Conference" || details.eventType === "Seminar"
                  ? "Accreditation & CO/PO Outcomes"
                  : details.eventType === "Hackathon"
                  ? "Hackathon Innovation & Awards"
                  : details.eventType === "Meeting"
                  ? "Minutes & Action Items"
                  : details.eventType === "Workshop"
                  ? "Practical Labs & Skill Metrics"
                  : "Exhibits & Showcase"}
              </strong>
            </p>
          </div>

          <div>
            <label htmlFor="event-dept" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Academic Department / Unit
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="event-dept"
                type="text"
                value={details.department || ""}
                onChange={(e) => onChange({ department: e.target.value })}
                placeholder="e.g. Department of Computer Science & Engineering"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Organizer Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label htmlFor="organizer-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Lead Organizer Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="organizer-name"
                type="text"
                value={details.organizerName}
                onChange={(e) => onChange({ organizerName: e.target.value })}
                placeholder="e.g. Dr. Jordan Lee"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="organizer-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Organizer Email
            </label>
            <input
              id="organizer-email"
              type="email"
              value={details.organizerEmail || ""}
              onChange={(e) => onChange({ organizerEmail: e.target.value })}
              placeholder="e.g. organizer@university.edu"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Governance Tags */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Governance & Classification Tags
          </label>
          <ReportTagSelector
            selectedTags={tags}
            onChange={onTagsChange}
            eventDetails={details}
            reportTitle={details.name}
            autoFetchOnMount={true}
          />
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2 hover:scale-[1.02]"
        >
          <span>Continue to Attendance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
