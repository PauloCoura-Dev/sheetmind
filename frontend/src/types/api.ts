export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type UploadStatus = "pending" | "processing" | "completed" | "failed";

export interface Upload {
  id: string;
  user_id: string;
  original_filename: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  status: UploadStatus;
  error_message: string | null;
  created_at: string;
}

export interface ColumnMeta {
  name: string;
  inferred_type: "numeric" | "date" | "categorical" | "text" | "empty";
  null_count: number;
  unique_count: number;
  sample_values: string[];
}

export type ChartType = "line" | "bar" | "pie" | "scatter";

export interface ChartConfig {
  chart_type: ChartType;
  title: string;
  x_key?: string;
  y_key?: string;
  name_key?: string;
  data: Record<string, unknown>[];
}

export type InsightType = "growth" | "peak" | "anomaly" | "quality" | "summary";
export type Severity = "info" | "warning" | "critical";

export interface Insight {
  type: InsightType;
  text: string;
  severity: Severity;
}

export interface QualityIssue {
  column: string | null;
  issue_type: string;
  description: string;
  suggestion?: string | null;
  affected_rows: number;
  severity: Severity;
}

export interface QualityReport {
  score: number;
  total_rows: number;
  issues: QualityIssue[];
}

export interface Analysis {
  id: string;
  upload_id: string;
  row_count: number | null;
  column_count: number | null;
  column_meta: ColumnMeta[] | null;
  chart_configs: ChartConfig[] | null;
  insights: Insight[] | null;
  quality_report: QualityReport | null;
  created_at: string;
}
