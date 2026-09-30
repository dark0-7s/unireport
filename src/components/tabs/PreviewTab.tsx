import React, { useState, useRef } from "react";
import {
  Download,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Calendar,
  MapPin,
  Building,
  Users,
  Star,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Type,
  Sliders,
  X,
  Check,
  Shield,
  Award,
} from "lucide-react";
import { Report, User, CustomTemplate } from "../../types";
import { downloadReportPDF } from "../../lib/pdfGenerator";

// Preset vector emblems as SVG Data URIs for watermark overlays
const PRESET_CREST_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="90" fill="none" stroke="#4338ca" stroke-width="6" stroke-dasharray="8 4"/>
  <circle cx="100" cy="100" r="76" fill="none" stroke="#4338ca" stroke-width="3"/>
  <path d="M100 40 L140 65 L140 120 C140 148 100 168 100 168 C100 168 60 148 60 120 L60 65 Z" fill="#4338ca" fill-opacity="0.15" stroke="#4338ca" stroke-width="4"/>
  <path d="M85 85 L100 70 L115 85 L115 115 L100 105 L85 115 Z" fill="#4338ca"/>
  <circle cx="100" cy="55" r="5" fill="#4338ca"/>
  <text x="100" y="185" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#4338ca" text-anchor="middle" letter-spacing="2">ACADEMIC EMBLEM</text>
</svg>
`)}`;

const PRESET_ACCREDITATION_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="88" fill="none" stroke="#047857" stroke-width="5"/>
  <polygon points="100,25 122,70 172,77 136,112 144,162 100,138 56,162 64,112 28,77 78,70" fill="#047857" fill-opacity="0.15" stroke="#047857" stroke-width="4"/>
  <circle cx="100" cy="100" r="28" fill="#047857"/>
  <text x="100" y="104" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFIED</text>
  <text x="100" y="185" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle" letter-spacing="1">ACCREDITATION AUDIT</text>
</svg>
`)}`;

interface PreviewTabProps {
  report: Report;
  user: User;
  onStatusChange: (status: "draft" | "completed") => void;
  onPrevious: () => void;
  customTemplate?: CustomTemplate | null;
  onRequireAuthForDownload?: () => void;
  onOpenCustomTemplateDesigner?: () => void;
  onOpenTemplatesManager?: () => void;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  report,
  user,
  onStatusChange,
  onPrevious,
  customTemplate,
  onRequireAuthForDownload,
  onOpenCustomTemplateDesigner,
  onOpenTemplatesManager,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Watermark Settings State (initialized from customTemplate if provided)
  const [watermarkMode, setWatermarkMode] = useState<"text" | "logo" | "none">(
    customTemplate?.watermarkConfig?.mode || "text"
  );
  const [textPreset, setTextPreset] = useState<"official" | "confidential" | "draft" | "custom">(
    customTemplate?.watermarkConfig?.preset || "official"
  );
  const [customText, setCustomText] = useState(
    customTemplate?.watermarkConfig?.customText || "FACULTY REVIEW ONLY"
  );
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(
    customTemplate?.watermarkConfig?.opacity ?? 0.09
  );
  const [watermarkRotation, setWatermarkRotation] = useState<number>(
    customTemplate?.watermarkConfig?.rotation ?? 45
  );

  // Logo Watermark State
  const [logoSourceType, setLogoSourceType] = useState<"preset" | "upload" | "url">(
    customTemplate?.watermarkConfig?.logoUrl ? "preset" : "preset"
  );
  const [selectedPresetLogo, setSelectedPresetLogo] = useState<"crest" | "accreditation">("crest");
  const [uploadedLogoDataUrl, setUploadedLogoDataUrl] = useState<string | null>(null);
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState<string>("");

  const [showSeal, setShowSeal] = useState(
    customTemplate?.watermarkConfig?.showSeal ?? true
  );
  const [removeUniReportBranding, setRemoveUniReportBranding] = useState(
    customTemplate?.watermarkConfig?.removeUniReportBranding ?? false
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = user.provider === "google" || user.provider === "email";

  // Typography & Layout resolution from customTemplate
  const primaryThemeColor = customTemplate?.typography?.primaryColor || "#312e81";
  const accentThemeColor = customTemplate?.typography?.accentColor || "#4f46e5";
  const fontFamilySetting = customTemplate?.typography?.fontFamily || "helvetica";
  const previewFontClass =
    fontFamilySetting === "times"
      ? "font-serif"
      : fontFamilySetting === "courier"
      ? "font-mono"
      : "font-sans";

  const paddingLeftPx = customTemplate?.margins?.left ? Math.max(16, customTemplate.margins.left * 1.5) : 32;
  const paddingRightPx = customTemplate?.margins?.right ? Math.max(16, customTemplate.margins.right * 1.5) : 32;

  // Compute active logo image URL
  const activeLogoUrl =
    logoSourceType === "upload" && uploadedLogoDataUrl
      ? uploadedLogoDataUrl
      : logoSourceType === "url" && customLogoUrlInput.trim()
      ? customLogoUrlInput.trim()
      : selectedPresetLogo === "accreditation"
      ? PRESET_ACCREDITATION_SVG
      : PRESET_CREST_SVG;

  // Compute active watermark text string
  const activeWatermarkText =
    textPreset === "custom"
      ? customText.trim().toUpperCase() || "CONFIDENTIAL"
      : textPreset === "official"
      ? "OFFICIAL PROCEEDINGS"
      : textPreset === "confidential"
      ? "CONFIDENTIAL"
      : "DRAFT REPORT";

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select a logo image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedLogoDataUrl(event.target?.result as string);
        setLogoSourceType("upload");
        setWatermarkMode("logo");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    if (!isAuthenticated) {
      if (onRequireAuthForDownload) {
        onRequireAuthForDownload();
      }
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      downloadReportPDF(report, user, customTemplate, {
        watermark: watermarkMode === "none" ? "none" : textPreset,
        watermarkMode,
        customWatermarkText: activeWatermarkText,
        watermarkLogoUrl: activeLogoUrl,
        watermarkOpacity,
        watermarkRotation,
        showSeal,
        includeUniReportBranding: !removeUniReportBranding,
      });
      setIsExporting(false);
    }, 450);
  };

  const details = report.content.eventDetails;
  const attendance = report.content.attendance;
  const summary = report.content.summary;
  const guests = report.content.guests;

  const total = attendance.totalAttendees || 0;
  const students = attendance.studentCount || 0;
  const faculty = attendance.facultyCount || 0;
  const external = attendance.externalCount || 0;
  const studentPct = total > 0 ? Math.round((students / total) * 100) : 0;
  const facultyPct = total > 0 ? Math.round((faculty / total) * 100) : 0;
  const externalPct = total > 0 ? Math.round((external / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">PDF Publication Preview & Export</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review multi-page layout, institutional seal, watermark, and demographic charts before generating your official PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onStatusChange(report.status === "completed" ? "draft" : "completed")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              report.status === "completed"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            Status: {report.status === "completed" ? "✓ Verified & Completed" : "Draft Status"}
          </button>

          <button
            type="button"
            id="export-pdf-action-btn"
            onClick={handleExport}
            disabled={isExporting}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 hover:scale-[1.02] ${
              isAuthenticated
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isAuthenticated ? (
              <Download className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isExporting
                ? "Generating Vector PDF..."
                : isAuthenticated
                ? "Export Official PDF"
                : "Sign In to Download PDF"}
            </span>
          </button>
        </div>
      </div>

      {/* Active Custom Template Banner & Pre-Design Studio Trigger */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0 border border-white/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                Active Template: {customTemplate?.name || "Standard Institutional Proceedings"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                {customTemplate ? `${customTemplate.category} Custom` : "Default Preset"}
              </span>
            </div>
            <p className="text-[11px] text-indigo-200/80 mt-0.5">
              Layout: <span className="font-semibold text-white">{customTemplate?.layout?.headerStyle || "Classic"}</span> · Margins: <span className="font-semibold text-white">{customTemplate?.margins?.left || 20}mm × {customTemplate?.margins?.right || 20}mm</span> · Font: <span className="font-semibold text-white capitalize">{customTemplate?.typography?.fontFamily || "Helvetica"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCustomTemplateDesigner && (
            <button
              type="button"
              onClick={onOpenCustomTemplateDesigner}
              className="px-3.5 py-1.5 text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>{customTemplate ? "Edit Template Design" : "Pre-design Custom Template"}</span>
            </button>
          )}

          {onOpenTemplatesManager && (
            <button
              type="button"
              onClick={onOpenTemplatesManager}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors"
            >
              Change Template
            </button>
          )}
        </div>
      </div>

      {/* Account Verification Notice if Logged Out */}
      {!isAuthenticated && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Account Verification Required for PDF Downloads</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Sign in with Google or create a free email account to verify organizer identity and export print-ready official proceedings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequireAuthForDownload}
            className="px-4 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg shrink-0 self-start sm:self-auto transition-colors"
          >
            Sign In / Sign Up Now
          </button>
        </div>
      )}

      {/* WATERMARK & INSTITUTIONAL SECURITY BRANDING SETTINGS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">PDF Watermark & Security Branding</h3>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                Applied to All Pages
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Overlay text or your institution's custom emblem across every page of the generated vector PDF.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setWatermarkMode("text")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                watermarkMode === "text"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text Watermark</span>
            </button>
            <button
              type="button"
              onClick={() => setWatermarkMode("logo")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                watermarkMode === "logo"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Logo / Emblem</span>
            </button>
            <button
              type="button"
              onClick={() => setWatermarkMode("none")}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                watermarkMode === "none"
                  ? "bg-white text-slate-800 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>None</span>
            </button>
          </div>
        </div>

        {/* TEXT WATERMARK CONTROLS */}
        {watermarkMode === "text" && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 mr-1">Presets:</span>
                {(
                  [
                    { id: "official", label: "Official Proceedings" },
                    { id: "confidential", label: "Confidential" },
                    { id: "draft", label: "Draft Report" },
                    { id: "custom", label: "Custom Text" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTextPreset(opt.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      textPreset === opt.id
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Opacity & Rotation */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="font-semibold">Opacity:</span>
                  <select
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={0.06}>Subtle (6%)</option>
                    <option value={0.09}>Standard (9%)</option>
                    <option value={0.16}>Prominent (16%)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="font-semibold">Angle:</span>
                  <select
                    value={watermarkRotation}
                    onChange={(e) => setWatermarkRotation(parseInt(e.target.value, 10))}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={45}>Diagonal (45°)</option>
                    <option value={0}>Horizontal (0°)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Text Input */}
            {textPreset === "custom" && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <Type className="w-4 h-4 text-indigo-600 shrink-0" />
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter custom watermark text (e.g. ACCREDITATION REVIEW ONLY)..."
                  className="w-full text-xs bg-transparent border-0 focus:outline-hidden font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}
          </div>
        )}

        {/* LOGO / EMBLEM WATERMARK CONTROLS */}
        {watermarkMode === "logo" && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Preset 1: University Crest */}
              <div
                onClick={() => {
                  setLogoSourceType("preset");
                  setSelectedPresetLogo("crest");
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  logoSourceType === "preset" && selectedPresetLogo === "crest"
                    ? "bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center p-1.5 shrink-0">
                  <img src={PRESET_CREST_SVG} alt="University Crest" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">University Crest</h4>
                  <p className="text-[11px] text-slate-500">Official academic shield</p>
                </div>
              </div>

              {/* Preset 2: Accreditation Seal */}
              <div
                onClick={() => {
                  setLogoSourceType("preset");
                  setSelectedPresetLogo("accreditation");
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  logoSourceType === "preset" && selectedPresetLogo === "accreditation"
                    ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center p-1.5 shrink-0">
                  <img src={PRESET_ACCREDITATION_SVG} alt="Accreditation Seal" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Accreditation Seal</h4>
                  <p className="text-[11px] text-slate-500">Audit & verification star</p>
                </div>
              </div>

              {/* Option 3: Custom Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  logoSourceType === "upload" && uploadedLogoDataUrl
                    ? "bg-purple-50/60 border-purple-500 ring-2 ring-purple-500/20"
                    : "bg-white border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  {uploadedLogoDataUrl ? (
                    <img src={uploadedLogoDataUrl} alt="Uploaded logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {uploadedLogoDataUrl ? "Custom Logo Uploaded" : "Upload Custom Logo"}
                  </h4>
                  <p className="text-[11px] text-slate-500">PNG, JPG, or SVG (max 2MB)</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                />
              </div>
            </div>

            {/* Custom Logo URL / Clear Row */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold text-slate-600 shrink-0">Or Image URL:</span>
                <input
                  type="url"
                  value={customLogoUrlInput}
                  onChange={(e) => {
                    setCustomLogoUrlInput(e.target.value);
                    if (e.target.value) {
                      setLogoSourceType("url");
                    }
                  }}
                  placeholder="https://example.edu/department-logo.png"
                  className="w-full max-w-sm text-xs border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Logo Opacity:</span>
                <select
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={0.06}>Subtle (6%)</option>
                  <option value={0.10}>Standard (10%)</option>
                  <option value={0.18}>Prominent (18%)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* BRANDING, SEAL & ARCHIVAL OPTIONS */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={showSeal}
                onChange={(e) => setShowSeal(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span>Include Official Institutional Seal & Crest on Page 1 Header</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={removeUniReportBranding}
                onChange={(e) => setRemoveUniReportBranding(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
              />
              <span className={removeUniReportBranding ? "text-rose-700 font-bold" : "text-slate-700"}>
                Remove UniReport Watermark & Footer Branding
              </span>
            </label>
          </div>

          <span className="text-[11px] text-slate-400">
            Preview updates live below · Embedded cleanly across all exported PDF pages
          </span>
        </div>
      </div>

      {/* SIMULATED DOCUMENT PAPER (PAGE 1) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden text-left relative">
        {/* Dynamic Watermark Overlay in Live Preview */}
        {watermarkMode === "text" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-10 overflow-hidden">
            <span
              style={{
                opacity: watermarkOpacity,
                transform: `rotate(-${watermarkRotation}deg)`,
              }}
              className="text-5xl sm:text-7xl font-black text-slate-900 uppercase tracking-widest text-center px-4 transition-all duration-200"
            >
              {activeWatermarkText}
            </span>
          </div>
        )}

        {watermarkMode === "logo" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-10 overflow-hidden">
            <img
              src={activeLogoUrl}
              alt="Document Watermark"
              style={{ opacity: watermarkOpacity }}
              className="w-56 h-56 sm:w-72 sm:h-72 object-contain pointer-events-none transition-all duration-200"
            />
          </div>
        )}

        {/* Top Accent Stripe */}
        <div className="h-2.5 w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600" />

        <div className="p-8 sm:p-12 space-y-6">
          {/* Institutional Heading & Seal */}
          <div className="border-b border-slate-200 pb-5 flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 block">
                {details.organization || user.organization || "INSTITUTIONAL EVENT PROCEEDINGS"}
              </span>
              {details.department && (
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  {details.department}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {report.title || "Official Event Report"}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {details.date || "Date Unspecified"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {details.location || "Main Campus"}
                </span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {details.eventType}
                </span>
              </div>
            </div>

            {/* Official Seal Emblem */}
            {showSeal && (
              <div className="w-16 h-16 rounded-full border-2 border-indigo-900 flex flex-col items-center justify-center text-center p-1 bg-indigo-50/40 text-indigo-950 shrink-0 shadow-2xs">
                <span className="text-[7px] font-bold tracking-tighter uppercase">OFFICIAL SEAL</span>
                <div className="w-2 h-2 rounded-full bg-indigo-700 my-0.5" />
                <span className="text-[6px] font-mono font-bold tracking-widest">VERITAS</span>
              </div>
            )}
          </div>

          {/* Attendance Audit Box & Demographic Vector Chart */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Attendance Audit & Demographic Breakdown
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Satisfaction: {(attendance.satisfactionRating || 5.0).toFixed(1)} / 5.0 ★
              </span>
            </div>

            {/* Progress Bar Preview */}
            <div className="h-4 w-full bg-slate-200 rounded-md overflow-hidden flex">
              {total > 0 ? (
                <>
                  <div style={{ width: `${studentPct}%` }} className="bg-indigo-600 h-full" />
                  <div style={{ width: `${facultyPct}%` }} className="bg-emerald-600 h-full" />
                  <div style={{ width: `${externalPct}%` }} className="bg-amber-500 h-full" />
                </>
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL HEADCOUNT</span>
                <span className="font-bold text-slate-900 text-sm">{total}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STUDENTS ({studentPct}%)</span>
                <span className="font-bold text-indigo-700 text-sm">{students}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">FACULTY ({facultyPct}%)</span>
                <span className="font-bold text-emerald-700 text-sm">{faculty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">EXTERNAL ({externalPct}%)</span>
                <span className="font-bold text-amber-700 text-sm">{external}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Executive Proceedings Narrative
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 font-sans">
              {summary.finalizedText ||
                summary.polishedText ||
                summary.rawNotes ||
                "No proceedings summary entered yet. Use the AI Summary tab to synthesize text."}
            </p>
          </div>

          {/* Speakers */}
          {guests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Distinguished Keynotes & Guests
              </h3>
              <div className="space-y-2">
                {guests.slice(0, 3).map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{g.name}</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {g.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {g.designation} {g.organization ? `· ${g.organization}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Respective Event-Type Specialized Section */}
          {(details.eventType === "Conference" || details.eventType === "Seminar") && report.content.accreditation && (
            <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900 uppercase tracking-wider text-[11px]">
                  Academic Accreditation & CO/PO Outcome Compliance
                </span>
                {report.content.accreditation.hodSignOffApproved && (
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    ✓ Chair Endorsed
                  </span>
                )}
              </div>
              {report.content.accreditation.courseOutcomeMapping && (
                <p className="text-slate-700">
                  <strong>Outcome Mapping:</strong> {report.content.accreditation.courseOutcomeMapping}
                </p>
              )}
              {report.content.accreditation.bloomsLevel && (
                <p className="text-slate-600">
                  <strong>Bloom's Taxonomy:</strong> {report.content.accreditation.bloomsLevel}
                </p>
              )}
              {report.content.accreditation.feedbackSummary && (
                <p className="text-slate-500 italic text-[11px]">
                  "{report.content.accreditation.feedbackSummary}"
                </p>
              )}
            </div>
          )}

          {details.eventType === "Hackathon" && (
            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2.5 text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block">
                Hackathon Winners & Competition Awards
              </span>
              {((report.content.hackathon?.awards || report.content.awards || []).length > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(report.content.hackathon?.awards || report.content.awards || []).map((awd) => (
                    <div key={awd.id} className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs">
                      <div className="font-bold text-slate-900">{awd.title}</div>
                      <div className="text-indigo-600 font-semibold">{awd.recipientName}</div>
                      {awd.prize && <div className="text-emerald-700 font-mono text-[11px] mt-0.5">{awd.prize}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No awards listed yet.</p>
              )}
            </div>
          )}

          {details.eventType === "Meeting" && report.content.meeting && (
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                  Official Committee Minutes & Action Items Matrix
                </span>
                <span className="text-slate-500 text-[10px]">
                  {report.content.meeting.meetingType || "Department Board"}
                </span>
              </div>
              {(report.content.meeting.resolutionsPassed || []).length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Ratified Resolutions:</span>
                  {report.content.meeting.resolutionsPassed?.map((res, i) => (
                    <div key={i} className="text-slate-800 text-[11px] pl-2 border-l-2 border-emerald-400">
                      {res}
                    </div>
                  ))}
                </div>
              )}
              {(report.content.meeting.actionItems || []).length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Action Items:</span>
                  {report.content.meeting.actionItems?.map((act) => (
                    <div key={act.id} className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-emerald-100">
                      <span className="font-medium text-slate-800">{act.action}</span>
                      <span className="text-slate-500">{act.assignedTo} · {act.deadline}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {details.eventType === "Workshop" && report.content.workshop && (
            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
                  Hands-on Workshop Labs & Pedagogical Skill Attainment
                </span>
                <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  {report.content.workshop.skillLevel || "Intermediate"} Level
                </span>
              </div>
              {(report.content.workshop.softwareToolsUsed || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {report.content.workshop.softwareToolsUsed?.map((tool, i) => (
                    <span key={i} className="bg-white border border-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px]">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
              {(report.content.workshop.handsOnExercises || []).length > 0 && (
                <div className="space-y-1">
                  {report.content.workshop.handsOnExercises?.map((ex, i) => (
                    <div key={i} className="text-slate-700 text-[11px]">
                      • {ex}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(details.eventType === "Exhibition" || details.eventType === "Social") && report.content.exhibition && (
            <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-200/80 space-y-2 text-xs">
              <span className="font-bold text-rose-900 uppercase tracking-wider text-[11px] block">
                Exhibition Stalls & Footfall Metrics
              </span>
              <div className="flex items-center gap-4 text-slate-700">
                <span><strong>Stalls/Booths:</strong> {report.content.exhibition.stallsOrBoothsCount || 0}</span>
                <span><strong>Estimated Visitors:</strong> {report.content.exhibition.estimatedFootfall || 0}</span>
              </div>
              {report.content.exhibition.bestExhibitAward && (
                <p className="text-slate-800">
                  <strong>Best Exhibit:</strong> {report.content.exhibition.bestExhibitAward}
                </p>
              )}
            </div>
          )}

          {/* Signatures Block */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <span>Report Prepared By: </span>
              <strong className="text-slate-800">{details.organizerName || user.name}</strong>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Official Email: {details.organizerEmail || user.email || "Verified"}
              </p>
            </div>

            <div className="border-t border-slate-300 pt-2 min-w-[200px] text-right">
              <span className="block font-semibold text-slate-700">Official Committee Sign-Off</span>
              <span className="text-[10px] text-slate-400">Authorized Signature & Seal</span>
            </div>
          </div>

          {/* Multi-page dynamic numbering footer preview */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              {removeUniReportBranding ? "Official Proceedings" : "UniReport Vector Proceedings"}
            </span>
            <span>Page 1 of {guests.length > 2 || (summary.polishedText && summary.polishedText.length > 700) ? "2" : "1"}</span>
          </div>
        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Photo Gallery</span>
        </button>

        <button
          type="button"
          onClick={handleExport}
          className={`px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] ${
            isAuthenticated
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isAuthenticated ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
          <span>{isAuthenticated ? "Export Official PDF Report" : "Sign In to Download PDF"}</span>
        </button>
      </div>
    </div>
  );
};
