"use client";

import { use } from "react";
import Link from "next/link";
import { useAnalysis } from "@/hooks/useAnalysis";
import ChartGrid from "@/components/dashboard/ChartGrid";
import InsightsList from "@/components/dashboard/InsightsList";
import QualityAlerts from "@/components/dashboard/QualityAlerts";

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { upload, analysis, isProcessing, isFailed, isComplete, isLoading } = useAnalysis(id);

  if (isLoading && !isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium text-lg">Falha no processamento</p>
        <p className="text-gray-500 text-sm mt-2">{upload?.error_message ?? "Erro desconhecido"}</p>
        <Link href="/" className="mt-6 inline-block text-brand-600 hover:underline text-sm">
          Tentar com outra planilha
        </Link>
      </div>
    );
  }

  if (isProcessing || !analysis) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto" />
        <div>
          <p className="text-gray-700 font-medium">Analisando sua planilha...</p>
          <p className="text-gray-400 text-sm mt-1">
            Estamos gerando gráficos e insights. Isso leva alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 print-title">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {upload?.original_filename ?? "Análise"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {analysis.row_count?.toLocaleString("pt-BR")} linhas ·{" "}
            {analysis.column_count} colunas
          </p>
        </div>
        <div className="flex items-center gap-4 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Exportar PDF
          </button>
          <Link
            href="/app"
            className="text-sm text-brand-600 hover:underline font-medium whitespace-nowrap"
          >
            Nova análise
          </Link>
        </div>
      </div>

      {analysis.insights && analysis.insights.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Insights</h2>
          <InsightsList insights={analysis.insights} />
        </section>
      )}

      {analysis.chart_configs && analysis.chart_configs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Gráficos</h2>
          <ChartGrid charts={analysis.chart_configs} />
        </section>
      )}

      {analysis.quality_report && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Qualidade dos dados</h2>
          <QualityAlerts report={analysis.quality_report} />
        </section>
      )}
    </div>
  );
}
