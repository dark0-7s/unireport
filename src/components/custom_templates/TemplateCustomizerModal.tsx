import React, { useState, useRef } from "react";
import {
  X,
  Check,
  Palette,
  Sliders,
  Type,
  Shield,
  Layout,
  Maximize2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileText,
  Building,
  Calendar,
  MapPin,
  HelpCircle,
  Copy,
  ChevronRight,
} from "lucide-react";
import {
  CustomTemplate,
  CustomTemplateLayout,
  CustomTemplateMargins,
  CustomTemplateTypography,
  CustomTemplateWatermark,
  SectionId,
} from "../../types";
import { saveCustomTemplate } from "../../lib/customTemplatesStorage";

interface TemplateCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: CustomTemplate | null;
  onSaveSuccess: (template: CustomTemplate) => void;
  onApplyToCurrentReport?: (template: CustomTemplate) => void;
}

// Preset vector SVG emblems
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

const COLOR_PRESETS = [
  { label: "Indigo Academic", primary: "#312e81", accent: "#4f46e5" },
  { label: "Classic Navy", primary: "#0f172a", accent: "#2563eb" },
  { label: "Forest Emerald", primary: "#064e3b", accent: "#059669" },
  { label: "Crimson Burgundy", primary: "#881337", accent: "#e11d48" },
  { label: "Royal Purple", primary: "#581c87", accent: "#9333ea" },
  { label: "Amber Slate", primary: "#78350f", accent: "#d97706" },
];

export const TemplateCustomizerModal: React.FC<TemplateCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialTemplate,
  onSaveSuccess,
  onApplyToCurrentReport,
}) => {
  // Tabs: layout | margins | typography | watermark
  const [activeTab, setActiveTab] = useState<"layout" | "margins" | "typography" | "watermark">("layout");
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false);

  // Template Metadata
  const [name, setName] = useState(initialTemplate?.name || "University Department Standard");
  const [description, setDescription] = useState(
    initialTemplate?.description || "Pre-designed institutional proceedings layout with custom margins, typography, and watermark."
  );
  const [category, setCategory] = useState<CustomTemplate["category"]>(
    initialTemplate?.category || "Academic"
  );

  // 1. Layout Pre-design State
  const [headerStyle, setHeaderStyle] = useState<CustomTemplateLayout["headerStyle"]>(
    initialTemplate?.layout?.headerStyle || "classic"
  );
  const [pageOrientation, setPageOrientation] = useState<CustomTemplateLayout["pageOrientation"]>(
    initialTemplate?.layout?.pageOrientation || "portrait"
  );
  const [sectionSpacing, setSectionSpacing] = useState<CustomTemplateLayout["sectionSpacing"]>(
    initialTemplate?.layout?.sectionSpacing || "normal"
  );

  // 2. Margins Pre-design State (mm)
  const [marginPreset, setMarginPreset] = useState<CustomTemplateMargins["preset"]>(
    initialTemplate?.margins?.preset || "standard"
  );
  const [marginLeft, setMarginLeft] = useState<number>(initialTemplate?.margins?.left ?? 20);
  const [marginRight, setMarginRight] = useState<number>(initialTemplate?.margins?.right ?? 20);
  const [marginTop, setMarginTop] = useState<number>(initialTemplate?.margins?.top ?? 20);
  const [marginBottom, setMarginBottom] = useState<number>(initialTemplate?.margins?.bottom ?? 52);

  // 3. Typography & Colors Pre-design State
  const [fontFamily, setFontFamily] = useState<CustomTemplateTypography["fontFamily"]>(
    initialTemplate?.typography?.fontFamily || "helvetica"
  );
  const [fontScale, setFontScale] = useState<CustomTemplateTypography["fontScale"]>(
    initialTemplate?.typography?.fontScale || "standard"
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    initialTemplate?.typography?.primaryColor || "#312e81"
  );
  const [accentColor, setAccentColor] = useState<string>(
    initialTemplate?.typography?.accentColor || "#4f46e5"
  );
  const [headingCase, setHeadingCase] = useState<CustomTemplateTypography["headingCase"]>(
    initialTemplate?.typography?.headingCase || "uppercase"
  );

  // 4. Watermark & Security Pre-design State
  const [watermarkMode, setWatermarkMode] = useState<CustomTemplateWatermark["mode"]>(
    initialTemplate?.watermarkConfig?.mode || "text"
  );
  const [watermarkPreset, setWatermarkPreset] = useState<CustomTemplateWatermark["preset"]>(
    initialTemplate?.watermarkConfig?.preset || "official"
  );
  const [customWatermarkText, setCustomWatermarkText] = useState<string>(
    initialTemplate?.watermarkConfig?.customText || "FACULTY AUDIT COPY"
  );
  const [watermarkLogoUrl, setWatermarkLogoUrl] = useState<string>(
    initialTemplate?.watermarkConfig?.logoUrl || PRESET_CREST_SVG
  );
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(
    initialTemplate?.watermarkConfig?.opacity ?? 0.09
  );
  const [watermarkRotation, setWatermarkRotation] = useState<number>(
    initialTemplate?.watermarkConfig?.rotation ?? 45
  );
  const [showSeal, setShowSeal] = useState<boolean>(
    initialTemplate?.watermarkConfig?.showSeal ?? true
  );
  const [removeUniReportBranding, setRemoveUniReportBranding] = useState<boolean>(
    initialTemplate?.watermarkConfig?.removeUniReportBranding ?? false
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset Margin Handlers
  const handleSelectMarginPreset = (preset: "standard" | "compact" | "wide") => {
    setMarginPreset(preset);
    if (preset === "standard") {
      setMarginLeft(20);
      setMarginRight(20);
      setMarginTop(20);
      setMarginBottom(52);
    } else if (preset === "compact") {
      setMarginLeft(12);
      setMarginRight(12);
      setMarginTop(14);
      setMarginBottom(38);
    } else if (preset === "wide") {
      setMarginLeft(28);
      setMarginRight(28);
      setMarginTop(26);
      setMarginBottom(60);
    }
  };

  const handleCustomMarginChange = (key: "left" | "right" | "top" | "bottom", val: number) => {
    setMarginPreset("custom");
    if (key === "left") setMarginLeft(val);
    if (key === "right") setMarginRight(val);
    if (key === "top") setMarginTop(val);
    if (key === "bottom") setMarginBottom(val);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select a logo under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setWatermarkLogoUrl(event.target?.result as string);
        setWatermarkMode("logo");
      };
      reader.readAsDataURL(file);
    }
  };

  const buildTemplateObject = (): CustomTemplate => {
    return {
      id: initialTemplate?.id || "tpl_cust_" + Math.random().toString(36).substring(2, 9),
      name: name.trim() || "Untitled Custom Template",
      description: description.trim(),
      category: category,
      version: (initialTemplate?.version || 0) + 1,
      createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
      type: "builder",
      layout: {
        headerStyle,
        pageOrientation,
        sectionSpacing,
      },
      margins: {
        preset: marginPreset,
        left: marginLeft,
        right: marginRight,
        top: marginTop,
        bottom: marginBottom,
      },
      typography: {
        fontFamily,
        fontScale,
        primaryColor,
        accentColor,
        headingCase,
      },
      watermarkConfig: {
        mode: watermarkMode,
        preset: watermarkPreset,
        customText: customWatermarkText,
        logoUrl: watermarkLogoUrl,
        opacity: watermarkOpacity,
        rotation: watermarkRotation,
        showSeal,
        removeUniReportBranding,
      },
    };
  };

  const handleSave = () => {
    const template = buildTemplateObject();
    saveCustomTemplate(template);
    onSaveSuccess(template);
    onClose();
  };

  const handleSaveAndApply = () => {
    const template = buildTemplateObject();
    saveCustomTemplate(template);
    onSaveSuccess(template);
    if (onApplyToCurrentReport) {
      onApplyToCurrentReport(template);
    }
    onClose();
  };

  // Compute active preview watermark text
  const previewWatermarkText =
    watermarkPreset === "custom"
      ? customWatermarkText.trim().toUpperCase() || "CONFIDENTIAL"
      : watermarkPreset === "official"
      ? "OFFICIAL PROCEEDINGS"
      : watermarkPreset === "confidential"
      ? "CONFIDENTIAL"
      : "DRAFT REPORT";

  // Font class mapping for live visual preview
  const previewFontFamilyClass =
    fontFamily === "times"
      ? "font-serif"
      : fontFamily === "courier"
      ? "font-mono"
      : "font-sans";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col h-[90vh]">
        {/* MODAL TOP HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {initialTemplate ? "Edit Custom Report Template" : "Pre-design Custom Report Template"}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  Visual Layout Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-configure layouts, margin geometry, typography fonts, and watermark branding for recurring proceedings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewOnMobile(!showPreviewOnMobile)}
              className="sm:hidden px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreviewOnMobile ? "Settings" : "Preview"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SPLIT STUDIO) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* LEFT: CONTROLS & CONFIGURATION TABS */}
          <div
            className={`w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-slate-50/30 overflow-y-auto ${
              showPreviewOnMobile ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Template Info Card */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Computer Science Annual Proceedings"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CustomTemplate["category"])}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on usage, accreditation alignment, or department specifications..."
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-600"
                />
              </div>
            </div>

            {/* PRE-DESIGN NAV TABS */}
            <div className="flex items-center border-b border-slate-200 bg-white px-4 pt-2 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("layout")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
                  activeTab === "layout"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Layout & Structure</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("margins")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
                  activeTab === "margins"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Margins ({marginLeft}mm × {marginRight}mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("typography")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
                  activeTab === "typography"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Font & Typography</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("watermark")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
                  activeTab === "watermark"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Watermark & Security</span>
              </button>
            </div>

            {/* TAB CONTENT AREA */}
            <div className="p-5 space-y-5 flex-1 overflow-y-auto text-xs">
              {/* TAB 1: LAYOUT & STRUCTURE */}
              {activeTab === "layout" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Header Presentation Style
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          id: "classic",
                          name: "Classic Institutional",
                          desc: "Top accent stripe with official seal & formal typography",
                        },
                        {
                          id: "academic",
                          name: "Academic Ribbon",
                          desc: "Bold double-stripe ribbon with departmental badge",
                        },
                        {
                          id: "minimal",
                          name: "Modern Minimalist",
                          desc: "Clean sans-serif header with subtle hairline separation",
                        },
                        {
                          id: "bold",
                          name: "Bold Corporate Block",
                          desc: "High-contrast block styling for executive summaries",
                        },
                      ].map((style) => (
                        <div
                          key={style.id}
                          onClick={() => setHeaderStyle(style.id as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            headerStyle === style.id
                              ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{style.name}</span>
                            {headerStyle === style.id && <Check className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{style.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Page Orientation
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPageOrientation("portrait")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          pageOrientation === "portrait"
                            ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-bold text-slate-900 block">Portrait (A4 Vertical)</span>
                        <span className="text-[11px] text-slate-500">210mm × 297mm · Recommended for Proceedings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPageOrientation("landscape")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          pageOrientation === "landscape"
                            ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-bold text-slate-900 block">Landscape (A4 Horizontal)</span>
                        <span className="text-[11px] text-slate-500">297mm × 210mm · Executive Data Presentation</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Section Content Density
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "compact", label: "Compact", desc: "Dense layout for archiving" },
                        { id: "normal", label: "Standard", desc: "Balanced academic flow" },
                        { id: "relaxed", label: "Relaxed", desc: "Spacious presentation" },
                      ].map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => setSectionSpacing(sp.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            sectionSpacing === sp.id
                              ? "bg-indigo-50 border-indigo-500 font-bold text-indigo-900"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="block text-xs">{sp.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{sp.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MARGINS & GEOMETRY */}
              {activeTab === "margins" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Margin Presets
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "standard", label: "Standard", desc: "20mm Left/Right (Ideal)" },
                        { id: "compact", label: "Compact", desc: "12mm (Max printable area)" },
                        { id: "wide", label: "Wide / Book", desc: "28mm (Archival binding)" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectMarginPreset(p.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            marginPreset === p.id
                              ? "bg-indigo-50 border-indigo-500 font-bold text-indigo-900"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="block text-xs">{p.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-800 text-xs">
                      Custom Millimeter Adjustments
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-semibold">Left Margin:</span>
                          <span className="font-bold text-indigo-700">{marginLeft} mm</span>
                        </div>
                        <input
                          type="range"
                          min={8}
                          max={35}
                          value={marginLeft}
                          onChange={(e) => handleCustomMarginChange("left", parseInt(e.target.value, 10))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-semibold">Right Margin:</span>
                          <span className="font-bold text-indigo-700">{marginRight} mm</span>
                        </div>
                        <input
                          type="range"
                          min={8}
                          max={35}
                          value={marginRight}
                          onChange={(e) => handleCustomMarginChange("right", parseInt(e.target.value, 10))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-semibold">Top Margin:</span>
                          <span className="font-bold text-indigo-700">{marginTop} mm</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={40}
                          value={marginTop}
                          onChange={(e) => handleCustomMarginChange("top", parseInt(e.target.value, 10))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-semibold">Bottom Footer Margin:</span>
                          <span className="font-bold text-indigo-700">{marginBottom} mm</span>
                        </div>
                        <input
                          type="range"
                          min={30}
                          max={70}
                          value={marginBottom}
                          onChange={(e) => handleCustomMarginChange("bottom", parseInt(e.target.value, 10))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TYPOGRAPHY & COLORS */}
              {activeTab === "typography" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Font Family
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        {
                          id: "helvetica",
                          label: "Modern Sans",
                          desc: "Helvetica / Arial (Standard Clean)",
                          fontFamilyStyle: "Arial, sans-serif",
                        },
                        {
                          id: "times",
                          label: "Classic Serif",
                          desc: "Times New Roman (Academic Journal)",
                          fontFamilyStyle: "Georgia, serif",
                        },
                        {
                          id: "courier",
                          label: "Technical Monospace",
                          desc: "Courier (Engineering / Code Log)",
                          fontFamilyStyle: "Courier New, monospace",
                        },
                      ].map((f) => (
                        <div
                          key={f.id}
                          onClick={() => setFontFamily(f.id as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            fontFamily === f.id
                              ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span
                            style={{ fontFamily: f.fontFamilyStyle }}
                            className="font-bold text-slate-900 text-sm block"
                          >
                            {f.label}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Primary Institutional Color Palette
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COLOR_PRESETS.map((col) => (
                        <div
                          key={col.label}
                          onClick={() => {
                            setPrimaryColor(col.primary);
                            setAccentColor(col.accent);
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                            primaryColor === col.primary
                              ? "bg-white border-slate-900 ring-2 ring-slate-900/10"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span
                            style={{ backgroundColor: col.primary }}
                            className="w-5 h-5 rounded-full shrink-0 shadow-2xs border border-white"
                          />
                          <span className="text-xs font-semibold text-slate-800 truncate">{col.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-3 p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-xs font-semibold text-slate-600">Custom Primary Hex:</span>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-24 text-xs font-mono px-2 py-1 border border-slate-200 rounded-md uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Heading Title Casing
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "uppercase", label: "UPPERCASE BOLD" },
                        { id: "capitalize", label: "Capitalize Standard" },
                        { id: "normal", label: "Sentence case" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setHeadingCase(c.id as any)}
                          className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                            headingCase === c.id
                              ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WATERMARK & SECURITY */}
              {activeTab === "watermark" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Default Watermark Mode
                    </h4>
                    <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
                      {[
                        { id: "text", label: "Text Watermark", icon: Type },
                        { id: "logo", label: "Logo / Emblem", icon: ImageIcon },
                        { id: "none", label: "No Watermark", icon: X },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setWatermarkMode(mode.id as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                              watermarkMode === mode.id
                                ? "bg-indigo-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {watermarkMode === "text" && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
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
                            onClick={() => setWatermarkPreset(opt.id)}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                              watermarkPreset === opt.id
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {watermarkPreset === "custom" && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Custom Watermark Text
                          </label>
                          <input
                            type="text"
                            value={customWatermarkText}
                            onChange={(e) => setCustomWatermarkText(e.target.value)}
                            placeholder="e.g. BOARD OF GOVERNORS REVIEW"
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-bold uppercase tracking-wider"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Opacity: {Math.round(watermarkOpacity * 100)}%
                          </label>
                          <select
                            value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                            className="w-full text-xs px-2 py-1 border border-slate-300 rounded-md"
                          >
                            <option value={0.06}>Subtle (6%)</option>
                            <option value={0.09}>Standard (9%)</option>
                            <option value={0.16}>Prominent (16%)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Angle:
                          </label>
                          <select
                            value={watermarkRotation}
                            onChange={(e) => setWatermarkRotation(parseInt(e.target.value, 10))}
                            className="w-full text-xs px-2 py-1 border border-slate-300 rounded-md"
                          >
                            <option value={45}>Diagonal (45°)</option>
                            <option value={0}>Horizontal (0°)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {watermarkMode === "logo" && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={() => setWatermarkLogoUrl(PRESET_CREST_SVG)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${
                            watermarkLogoUrl === PRESET_CREST_SVG
                              ? "bg-indigo-50 border-indigo-500"
                              : "border-slate-200"
                          }`}
                        >
                          <img src={PRESET_CREST_SVG} alt="Crest" className="w-7 h-7 object-contain" />
                          <span className="text-xs font-bold text-slate-800">Academic Crest</span>
                        </div>

                        <div
                          onClick={() => setWatermarkLogoUrl(PRESET_ACCREDITATION_SVG)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${
                            watermarkLogoUrl === PRESET_ACCREDITATION_SVG
                              ? "bg-emerald-50 border-emerald-500"
                              : "border-slate-200"
                          }`}
                        >
                          <img src={PRESET_ACCREDITATION_SVG} alt="Accreditation" className="w-7 h-7 object-contain" />
                          <span className="text-xs font-bold text-slate-800">Accreditation Star</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2 px-3 border border-dashed border-indigo-300 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Custom Logo / Emblem Image</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/png,image/jpeg,image/svg+xml"
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={showSeal}
                        onChange={(e) => setShowSeal(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                      />
                      <span>Include Official Institutional Seal & Crest on Page 1 Header</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={removeUniReportBranding}
                        onChange={(e) => setRemoveUniReportBranding(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
                      />
                      <span className={removeUniReportBranding ? "text-rose-700 font-bold" : "text-slate-700"}>
                        Remove UniReport Watermark & Footer Branding (White-label)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: REAL-TIME SIMULATED PRE-DESIGN CANVAS */}
          <div
            className={`w-full lg:w-1/2 bg-slate-200/60 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-start ${
              showPreviewOnMobile ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Live Pre-designed Report Preview</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {pageOrientation === "portrait" ? "A4 Portrait (210×297mm)" : "A4 Landscape (297×210mm)"}
              </span>
            </div>

            {/* SIMULATED A4 PAPER CANVAS */}
            <div
              className={`bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden relative w-full max-w-md transition-all duration-300 ${previewFontFamilyClass}`}
              style={{
                minHeight: "520px",
              }}
            >
              {/* Top Accent Stripe / Header Style */}
              <div
                style={{ backgroundColor: primaryColor }}
                className="h-2.5 w-full transition-colors"
              />

              {/* Watermark Overlay in Live Canvas */}
              {watermarkMode === "text" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-10 overflow-hidden">
                  <span
                    style={{
                      opacity: watermarkOpacity,
                      transform: `rotate(-${watermarkRotation}deg)`,
                    }}
                    className="text-4xl sm:text-5xl font-black text-slate-900 uppercase tracking-widest text-center px-4"
                  >
                    {previewWatermarkText}
                  </span>
                </div>
              )}

              {watermarkMode === "logo" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-10 overflow-hidden">
                  <img
                    src={watermarkLogoUrl}
                    alt="Emblem"
                    style={{ opacity: watermarkOpacity }}
                    className="w-44 h-44 object-contain pointer-events-none"
                  />
                </div>
              )}

              {/* Document Paper Body with Live Margins */}
              <div
                className="space-y-4"
                style={{
                  paddingLeft: `${Math.max(12, marginLeft * 0.9)}px`,
                  paddingRight: `${Math.max(12, marginRight * 0.9)}px`,
                  paddingTop: `${Math.max(12, marginTop * 0.8)}px`,
                  paddingBottom: `${Math.max(16, marginBottom * 0.5)}px`,
                }}
              >
                {/* Header Block */}
                <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <span
                      style={{ color: primaryColor }}
                      className="text-[10px] font-black uppercase tracking-wider block"
                    >
                      INSTITUTIONAL EVENT PROCEEDINGS
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Department of Academic & Research Excellence
                    </span>
                    <h1
                      style={{ color: primaryColor }}
                      className={`text-base sm:text-lg font-black mt-1 ${
                        headingCase === "uppercase" ? "uppercase" : ""
                      }`}
                    >
                      {name || "Official Event Report"}
                    </h1>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Annual Session
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Main Auditorium
                      </span>
                    </div>
                  </div>

                  {showSeal && (
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-900 flex flex-col items-center justify-center text-[6px] font-bold text-indigo-950 p-1 text-center shrink-0">
                      <span>OFFICIAL</span>
                      <span className="text-[8px] font-black">★</span>
                      <span>SEAL</span>
                    </div>
                  )}
                </div>

                {/* Demographic & Headcount Summary */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span style={{ color: primaryColor }} className="font-bold">
                      ATTENDANCE & AUDIT BREAKDOWN
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-200">
                      4.9 / 5.0 ★
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Total Attendees</span>
                      <span className="font-bold text-slate-800 text-xs">245</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Students</span>
                      <span className="font-bold text-slate-800 text-xs">190 (78%)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Faculty / Guests</span>
                      <span className="font-bold text-slate-800 text-xs">55 (22%)</span>
                    </div>
                  </div>

                  {/* Demographic Progress Bar with Accent */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div style={{ backgroundColor: primaryColor }} className="w-3/4 h-full" />
                    <div style={{ backgroundColor: accentColor }} className="w-1/4 h-full" />
                  </div>
                </div>

                {/* Executive Summary Sample */}
                <div className="space-y-1">
                  <h3
                    style={{ color: primaryColor }}
                    className="text-[11px] font-bold uppercase tracking-wider"
                  >
                    Executive Summary & Proceedings
                  </h3>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    The session convened departmental faculty, visiting industry experts, and student scholars to review outcome-based milestones and academic developments.
                  </p>
                </div>

                {/* Footer preview */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>
                    {removeUniReportBranding ? "Official Proceedings" : "UniReport Document System"}
                  </span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL BOTTOM ACTION BAR */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {onApplyToCurrentReport && (
              <button
                type="button"
                onClick={handleSaveAndApply}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Apply to Current Report</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
