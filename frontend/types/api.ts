export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export type GenerationMode = "sequential" | "random";
export type ExportFormat = "csv" | "xlsx";

export interface ExportOptions {
  column_name: string;
  include_country_code: boolean;
  include_serial: boolean;
}

export interface Country {
  iso_alpha2: string;
  name: string;
  dial_code: string;
  display_order?: number;
  enabled?: boolean;
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

export interface JobProgress {
  generated_count: number;
  percent: number;
  eta_seconds?: number;
  current_chunk?: number;
  total_chunks?: number;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: JobProgress;
  export_format: ExportFormat;
  download_ready: boolean;
  country_code?: string;
  quantity?: number;
  generation_mode?: GenerationMode;
  created_at?: string;
  completed_at?: string;
  expires_at?: string;
  error?: string | null;
}

export interface HistoryItem {
  job_id: string;
  country_code: string;
  quantity: number;
  status: JobStatus;
  created_at: string;
  download_available: boolean;
  expires_at: string;
  export_format?: ExportFormat;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

export interface CancelJobResponse {
  job_id: string;
  status: JobStatus;
}

export interface DownloadTokenResponse {
  token: string;
  expires_in_seconds: number;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
