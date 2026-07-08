export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export type GenerationMode = "sequential" | "random";

export type ExportFormat = "csv" | "xlsx";

export interface ExportColumn {
  header: string;
  static_value: string;
}

export interface ExportOptions {
  column_name: string;
  columns?: ExportColumn[];
  include_country_code: boolean;
  include_serial: boolean;
}

export interface Country {
  code: string;
  name: string;
  dial_code: string;
  iso_alpha2: string;
  mobile_rules: {
    length: number;
    valid_prefixes: string[];
  };
  default_export: ExportOptions;
  display_order: number;
}

export interface JobProgress {
  generated_count: number;
  percent: number;
  eta_seconds?: number;
  current_chunk?: number;
  total_chunks?: number;
}

export interface CreateJobRequest {
  country_code: string;
  quantity: number;
  generation_mode: GenerationMode;
  export_format: ExportFormat;
  export_options: ExportOptions;
}

export interface CreateJobResponse {
  job_id: string;
  status: JobStatus;
  estimated_duration_seconds: number;
  poll_url: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: JobProgress | null;
  country_code?: string;
  quantity?: number;
  generation_mode?: GenerationMode;
  export_format?: ExportFormat;
  export_options?: ExportOptions;
  download_ready: boolean;
  error?: string | null;
  created_at?: string;
  completed_at?: string;
  expires_at?: string;
}

export interface HistoryItem {
  job_id: string;
  country_code: string;
  quantity: number;
  status: JobStatus;
  export_format: ExportFormat;
  created_at: string;
  download_available: boolean;
  expires_at: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

export interface DownloadTokenResponse {
  token: string;
  expires_at: string;
}

export interface CancelJobResponse {
  job_id: string;
  status: JobStatus;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
