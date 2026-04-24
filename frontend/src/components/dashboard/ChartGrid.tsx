import ChartCard from "./ChartCard";
import type { ChartConfig } from "@/types/api";

interface ChartGridProps {
  charts: ChartConfig[];
}

export default function ChartGrid({ charts }: ChartGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {charts.map((chart, i) => (
        <ChartCard key={i} chart={chart} />
      ))}
    </div>
  );
}
