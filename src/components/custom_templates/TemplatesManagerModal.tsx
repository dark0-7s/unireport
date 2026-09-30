import React from "react";
import { X, Plus, FileCode, Layers, ArrowRight, Trash2, Edit3, Sliders, Type, Shield, Layout } from "lucide-react";
import { CustomTemplate } from "../../types";
import { getCustomTemplates, deleteCustomTemplate } from "../../lib/customTemplatesStorage";
import { REPORT_TEMPLATES } from "../../data/templates";

interface TemplatesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplateForNewReport: (customTemplate: CustomTemplate) => void;
  onOpenLatexDropin: () => void;
  onOpenCreateCustom: () => void;
  onEditCustomTemplate: (template: CustomTemplate) => void;
}

export const TemplatesManagerModal: React.FC<TemplatesManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplateForNewReport,
  onOpenLatexDropin,
  onOpenCreateCustom,
  onEditCustomTemplate,
}) => {
  if (!isOpen) return null;
  const customTemplates = getCustomTemplates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Custom Report Templates</h3>
              <p className="text-xs text-slate-500">Pre-design layouts, margins, typography, and watermarks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenCreateCustom}
              className="py-3 px-4 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-800 font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Pre-design New Custom Template</span>
            </button>

            <button
              type="button"
              onClick={onOpenLatexDropin}
              className="py-3 px-4 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>Import / Drop-in LaTeX Code</span>
            </button>
          </div>

          {/* Custom User Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Your Pre-designed Custom Templates ({customTemplates.length})
              </h4>
            </div>

            {customTemplates.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <Sliders className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No custom templates designed yet</p>
                <p className="text-slate-500 max-w-sm mx-auto text-xs">
                  Create tailored layouts with custom margin geometry, serif/sans fonts, institutional colors, and pre-configured watermarks.
                </p>
                <button
                  type="button"
                  onClick={onOpenCreateCustom}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-2xs hover:bg-indigo-700 transition-colors"
                >
                  Start Designing Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {customTemplates.map((ct) => (
                  <div
                    key={ct.id}
                    className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{ backgroundColor: ct.typography?.primaryColor || "#312e81" }}
                          className="w-3 h-3 rounded-full shrink-0 border border-slate-300"
                        />
                        <h5 className="font-bold text-slate-900 text-sm">{ct.name}</h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {ct.category || "Academic"}
                        </span>
                      </div>

                      {ct.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ct.description}</p>
                      )}

                      {/* Design specs badges */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Sliders className="w-3 h-3 text-slate-400" />
                          Margins: {ct.margins?.left || 20}mm × {ct.margins?.right || 20}mm
                        </span>

                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Type className="w-3 h-3 text-slate-400" />
                          Font: {ct.typography?.fontFamily || "Helvetica"}
                        </span>

                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Shield className="w-3 h-3 text-slate-400" />
                          Watermark: {ct.watermarkConfig?.mode === "none" ? "None" : ct.watermarkConfig?.preset || "Official"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onEditCustomTemplate(ct)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Design</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTemplateForNewReport(ct)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <span>Use Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCustomTemplate(ct.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Built-in System Presets */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
              Standard Publication Presets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REPORT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">{tpl.name}</span>
                    <span className="text-[10px] text-slate-400">{tpl.category} System Preset</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-500 border border-slate-200">
                    Preset
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
