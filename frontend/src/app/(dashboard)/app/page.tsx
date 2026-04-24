"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import DropZone from "@/components/upload/DropZone";
import { useUpload } from "@/hooks/useUpload";
import { isAuthenticated, api } from "@/lib/api";
import type { Upload } from "@/types/api";
import { formatDate, formatBytes } from "@/lib/utils";

export default function AppPage() {
  const router = useRouter();
  const { uploadFile, uploading, error: uploadError } = useUpload();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: uploads, isFetching, refetch } = useQuery({
    queryKey: ["uploads"],
    queryFn: () => api.get<Upload[]>("/api/v1/uploads/"),
    enabled: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      refetch();
    }
  }, [router, refetch]);

  async function handleFile(file: File) {
    await uploadFile(file);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remover esta análise?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/uploads/${id}`);
      refetch();
    } finally {
      setDeletingId(null);
    }
  }

  const statusLabel: Record<string, string> = {
    pending: "Aguardando...",
    processing: "Processando...",
    completed: "Concluído",
    failed: "Erro",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analisar Planilha</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Envie um arquivo .xlsx ou .csv e receba gráficos e insights automáticos.
        </p>
      </div>

      {!isFetching && uploads?.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <p className="font-semibold">Bem-vindo ao SheetMind!</p>
          <p className="mt-1 text-blue-700">
            Envie uma planilha abaixo e receba gráficos, insights e um relatório de qualidade dos dados — tudo automático.
          </p>
        </div>
      )}

      <DropZone onFile={handleFile} loading={uploading} />

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {uploadError}
        </p>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Análises anteriores</h2>

        {/* Skeleton while loading */}
        {isFetching && !uploads && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-14" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isFetching && uploads?.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-gray-200 rounded-xl py-10 text-center bg-white">
            <span className="text-3xl mb-2">📂</span>
            <p className="text-gray-500 text-sm">Nenhuma análise ainda. Envie sua primeira planilha acima.</p>
          </div>
        )}

        {/* List */}
        {uploads && uploads.length > 0 && (
          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.original_filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(upload.created_at)}
                    {upload.file_size_bytes && ` · ${formatBytes(upload.file_size_bytes)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[upload.status]}`}
                  >
                    {statusLabel[upload.status]}
                  </span>
                  {upload.status === "completed" && (
                    <Link
                      href={`/analysis/${upload.id}`}
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Ver análise
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(upload.id)}
                    disabled={deletingId === upload.id}
                    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                    title="Remover análise"
                  >
                    {deletingId === upload.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
