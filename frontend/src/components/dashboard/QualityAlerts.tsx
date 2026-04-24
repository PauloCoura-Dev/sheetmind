import { cn } from "@/lib/utils";
import type { QualityReport } from "@/types/api";

interface QualityAlertsProps {
  report: QualityReport;
}

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
};

const scoreLabel = (score: number) => {
  if (score >= 80) return "Boa qualidade";
  if (score >= 50) return "Qualidade razoável";
  return "Dados com problemas";
};

const severityIcon: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  critical: "🚨",
};

export default function QualityAlerts({ report }: QualityAlertsProps) {
  const hasIssues = report.issues.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className={cn("text-3xl font-bold", scoreColor(report.score))}>{report.score}</p>
          <p className="text-xs text-gray-400 mt-0.5">/ 100</p>
        </div>
        <div>
          <p className={cn("font-semibold", scoreColor(report.score))}>
            {scoreLabel(report.score)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {report.total_rows.toLocaleString("pt-BR")} linhas analisadas ·{" "}
            {hasIssues ? `${report.issues.length} problema(s) encontrado(s)` : "nenhum problema"}
          </p>
        </div>
      </div>

      {hasIssues && (
        <ul className="space-y-3 border-t border-gray-100 pt-4">
          {report.issues.map((issue, i) => (
            <li key={i} className="flex gap-2 items-start text-sm">
              <span className="shrink-0 mt-0.5">{severityIcon[issue.severity]}</span>
              <div>
                <p className="text-gray-600">{issue.description}</p>
                {issue.suggestion && (
                  <p className="text-xs text-gray-400 mt-0.5">💡 {issue.suggestion}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!hasIssues && (
        <p className="text-sm text-green-600 border-t border-gray-100 pt-4">
          ✅ Nenhum problema encontrado nos dados.
        </p>
      )}
    </div>
  );
}
