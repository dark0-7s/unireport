import React, { useState } from "react";
import { X, FileCode, Sparkles, Check, ArrowRight } from "lucide-react";
import { CustomTemplate } from "../../types";
import { saveCustomTemplate } from "../../lib/customTemplatesStorage";

interface LatexTransformerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplateSuccess: (template: CustomTemplate) => void;
  onCreateReportFromTemplate?: (template: CustomTemplate) => void;
  onApplyTemplateToCurrentReport?: (template: CustomTemplate) => void;
  hasActiveReport?: boolean;
}

export const LatexTransformerModal: React.FC<LatexTransformerModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplateSuccess,
  onCreateReportFromTemplate,
  onApplyTemplateToCurrentReport,
  hasActiveReport,
}) => {
  const [latexCode, setLatexCode] = useState(`\\documentclass[conference]{IEEEtran}
\\title{Proceedings of the Institutional Tech Symposium}
\\author{\\IEEEauthorblockN{Event Documentation Committee}}
\\begin{document}
\\maketitle
\\begin{abstract}
Official summary of institutional event proceedings.
\\end{abstract}
\\end{document}`);

  const [templateName, setTemplateName] = useState("Custom IEEE / ACM Format");

  if (!isOpen) return null;

  const handleTransform = () => {
    const newTemplate: CustomTemplate = {
      id: "tpl_latex_" + Math.random().toString(36).substring(2, 9),
      name: templateName.trim() || "Imported LaTeX Template",
      description: "Transformed from standard LaTeX conference document markup.",
      category: "Academic",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
      type: "latex_transformed",
      latexCode: latexCode,
    };

    saveCustomTemplate(newTemplate);
    onSaveTemplateSuccess(newTemplate);

    if (onCreateReportFromTemplate) {
      onCreateReportFromTemplate(newTemplate);
    } else if (onApplyTemplateToCurrentReport && hasActiveReport) {
      onApplyTemplateToCurrentReport(newTemplate);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Drop-in LaTeX Template Transformer</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Paste LaTeX Source Code
            </label>
            <textarea
              rows={10}
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 bg-slate-900 text-slate-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleTransform}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transform & Use Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};
