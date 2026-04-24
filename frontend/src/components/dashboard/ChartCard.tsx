"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartConfig } from "@/types/api";

const COLORS = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

interface ChartCardProps {
  chart: ChartConfig;
}

export default function ChartCard({ chart }: ChartCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 truncate">{chart.title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        {chart.chart_type === "line" ? (
          <LineChart data={chart.data as Record<string, unknown>[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey={chart.x_key} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={chart.y_key}
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        ) : chart.chart_type === "bar" ? (
          <BarChart data={chart.data as Record<string, unknown>[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey={chart.x_key} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={chart.y_key} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : chart.chart_type === "pie" ? (
          <PieChart>
            <Pie
              data={chart.data as Record<string, unknown>[]}
              dataKey={chart.y_key ?? "value"}
              nameKey={chart.name_key ?? "name"}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {(chart.data as Record<string, unknown>[]).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        ) : (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="x" name={chart.x_key} tick={{ fontSize: 11 }} />
            <YAxis dataKey="y" name={chart.y_key} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={chart.data as Record<string, unknown>[]}
              fill={COLORS[0]}
            />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
