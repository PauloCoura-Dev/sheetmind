import { cn } from "@/lib/utils";
import type { Insight } from "@/types/api";

const typeIcon: Record<string, string> = {
  growth: "📈",
  peak: "🏆",
  anomaly: "⚠️",
  quality: "🔍",
  summary: "📋",
};

const severityStyle: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  critical: "bg-red-50 border-red-200 text-red-800",
};

const badgeStyle: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  critical: "bg-red-100 text-red-700",
};

const badgeLabel: Record<string, string> = {
  info: "Info",
  warning: "Atenção",
  critical: "Crítico",
};

interface InsightItemProps {
  insight: Insight;
}

export default function InsightItem({ insight }: InsightItemProps) {
  return (
    <div
      className={cn(
        "border rounded-xl px-4 py-3 flex gap-3 items-start",
        severityStyle[insight.severity]
      )}
    >
      <span className="text-xl mt-0.5 shrink-0">{typeIcon[insight.type] ?? "💡"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">{insight.text}</p>
        <span
          className={cn(
            "inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full",
            badgeStyle[insight.severity]
          )}
        >
          {badgeLabel[insight.severity]}
        </span>
      </div>
    </div>
  );
}
