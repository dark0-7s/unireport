import React from "react";
import { Tag } from "lucide-react";

interface ReportTagBadgeProps {
  tag: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export const ReportTagBadge: React.FC<ReportTagBadgeProps> = ({
  tag,
  onRemove,
  size = "md",
}) => {
  const getTagStyle = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case "urgent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "academic":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "internal":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "external":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "confidential":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${
        isSmall ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${getTagStyle(tag)}`}
    >
      <Tag className={isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} />
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-75"
        >
          ×
        </button>
      )}
    </span>
  );
};
