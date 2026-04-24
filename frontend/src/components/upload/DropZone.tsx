"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFile: (file: File) => void;
  loading?: boolean;
}

const ACCEPTED_TYPES = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
};

const MAX_SIZE = 20 * 1024 * 1024;

export default function DropZone({ onFile, loading }: DropZoneProps) {
  const [sizeError, setSizeError] = useState<string | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      setSizeError(null);
      if (files[0]) onFile(files[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const tooBig = rejections.some((r) =>
        r.errors.some((e) => e.code === "file-too-large")
      );
      setSizeError(tooBig ? "Arquivo muito grande. O limite é 20MB." : "Arquivo não suportado.");
    },
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: loading,
  });

  return (
    <div className="space-y-2">
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl px-6 py-8 md:p-12 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-brand-500 bg-brand-50"
          : "border-gray-300 hover:border-brand-400 bg-white",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="text-4xl">📊</div>
        {loading ? (
          <div className="space-y-1">
            <p className="text-gray-700 font-medium">Enviando arquivo...</p>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-48 mx-auto">
              <div className="h-full bg-brand-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-brand-600 font-medium">Solte o arquivo aqui</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">
              Arraste uma planilha ou clique para selecionar
            </p>
            <p className="text-gray-400 text-sm">Suporta .xlsx, .xls e .csv · Máximo 20MB</p>
          </>
        )}
      </div>
    </div>
    {sizeError && (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
        {sizeError}
      </p>
    )}
    </div>
  );
}
