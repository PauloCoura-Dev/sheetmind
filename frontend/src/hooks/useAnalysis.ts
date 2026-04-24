"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Upload, Analysis } from "@/types/api";

const POLL_INTERVAL = 2000; // 2 seconds

export function useAnalysis(uploadId: string) {
  const uploadQuery = useQuery({
    queryKey: ["upload", uploadId],
    queryFn: () => api.get<Upload>(`/api/v1/uploads/${uploadId}`),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? POLL_INTERVAL : false;
    },
    staleTime: 0,
  });

  const isComplete = uploadQuery.data?.status === "completed";

  const analysisQuery = useQuery({
    queryKey: ["analysis", uploadId],
    queryFn: () => api.get<Analysis>(`/api/v1/analyses/${uploadId}`),
    enabled: isComplete,
    staleTime: Infinity,
  });

  return {
    upload: uploadQuery.data,
    analysis: analysisQuery.data,
    isLoading: uploadQuery.isLoading || (isComplete && analysisQuery.isLoading),
    isProcessing: ["pending", "processing"].includes(uploadQuery.data?.status ?? ""),
    isFailed: uploadQuery.data?.status === "failed",
    isComplete,
    error: uploadQuery.error ?? analysisQuery.error,
  };
}
