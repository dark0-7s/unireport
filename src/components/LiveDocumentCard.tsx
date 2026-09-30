import React from "react";
import {
  Calendar,
  MapPin,
  Building,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  RotateCw,
} from "lucide-react";
import { Report, User } from "../types";
import { downloadReportPDF } from "../lib/pdfGenerator";

interface LiveDocumentCardProps {
  report: Report;
  user: User;
  onOpenFullPreview: () => void;
}

export const LiveDocumentCard: React.FC<LiveDocumentCardProps> = ({
  report,
  user,
  onOpenFullPreview,
}) => {
  const { eventDetails, attendance, summary, guests, accreditation, hackathon } = report.content;

  const handleDownload = () => {
    downloadReportPDF(report, user, null, {
      watermark: "official",
      watermarkMode: "text",
      showSeal: true,
    });
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-xl font-sans sticky top-36">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white">Live A4 Document Preview</span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            Live Sync
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullPreview}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Full View
          </button>
        </div>
      </div>

      {/* Simulated Document Paper */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/80 flex justify-center">
        <div className="w-full bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-5 text-xs select-none">
          {/* Header */}
          <div className="border-b-2 border-slate-900/10 pb-4 flex items-start justify-between gap-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-900 block">
                {eventDetails.organization || user.organization || "INSTITUTIONAL PROCEEDINGS"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                {eventDetails.department || "Academic Department"}
              </span>
              <h2 className="text-base font-black text-slate-950 mt-1 uppercase tracking-tight leading-snug">
                {report.title || eventDetails.name || "Event Proceedings Report"}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-700" />
                  {eventDetails.date || "2026-09-30"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-700" />
                  {eventDetails.location || "Auditorium"}
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-full border-2 border-indigo-900 flex flex-col items-center justify-center text-[6px] font-bold text-indigo-950 p-1 text-center shrink-0">
              <span>OFFICIAL</span>
              <span className="text-[8px] font-black leading-none">★</span>
              <span>SEAL</span>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-0.5">
              1. Executive Proceedings Summary
            </h3>
            <p className="text-[11px] text-slate-700 leading-relaxed text-justify line-clamp-6">
              {summary.finalizedText || summary.polishedText || summary.rawNotes || "No summary formulated yet. Edit in Stage 2 to compose."}
            </p>
          </div>

          {/* Attendance Matrix */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-0.5">
              2. Headcount & Attendance
            </h3>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
              <div>
                <span className="text-[8px] text-slate-500 block font-semibold">Total</span>
                <span className="text-xs font-black text-indigo-900">{attendance.totalAttendees}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block font-semibold">Students</span>
                <span className="text-xs font-bold text-slate-800">{attendance.studentCount || 0}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block font-semibold">Faculty</span>
                <span className="text-xs font-bold text-slate-800">{attendance.facultyCount || 0}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block font-semibold">Rating</span>
                <span className="text-xs font-bold text-amber-600">★ {attendance.satisfactionRating || 4.8}</span>
              </div>
            </div>
          </div>

          {/* Keynote Guests */}
          {guests.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider border-b border-indigo-100 pb-0.5">
                3. Keynotes & Speakers ({guests.length})
              </h3>
              <div className="space-y-1.5">
                {guests.slice(0, 2).map((g, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900">{g.name}</span>
                      <span className="text-[8px] font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded">
                        {g.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{g.designation} · {g.organization}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Signature Strip */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[8px] text-slate-400">
            <span>Prepared by: {eventDetails.organizerName || user.name}</span>
            <span>Academic Sign-off Ratified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
