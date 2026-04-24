"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Upload } from "@/types/api";

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function uploadFile(file: File): Promise<Upload> {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const upload = await api.upload<Upload>("/api/v1/uploads/", formData);
      router.push(`/analysis/${upload.id}`);
      return upload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar arquivo";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return { uploadFile, uploading, error };
}
