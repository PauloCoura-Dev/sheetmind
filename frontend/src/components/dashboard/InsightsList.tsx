import InsightItem from "./InsightItem";
import type { Insight } from "@/types/api";

interface InsightsListProps {
  insights: Insight[];
}

export default function InsightsList({ insights }: InsightsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {insights.map((insight, i) => (
        <InsightItem key={i} insight={insight} />
      ))}
    </div>
  );
}
