import type {
  ApiError,
  CancelJobResponse,
  Country,
  CreateJobRequest,
  CreateJobResponse,
  DownloadTokenResponse,
  HistoryResponse,
  JobStatusResponse,
} from "@/types/api";
import { getSessionId } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiClientError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((e) => e.msg).join(", ");
    }
  } catch {
    // ignore parse errors
  }
  return response.statusText || "Request failed";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "X-Session-Id": getSessionId(),
    ...extraHeaders,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const message = await parseError(response);
    const retryAfter = response.headers.get("Retry-After");
    throw new ApiClientError(
      message,
      response.status,
      retryAfter ? parseInt(retryAfter, 10) : undefined,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  getCountries: () => request<Country[]>("/countries"),

  createJob: (body: CreateJobRequest, clientRequestId?: string) =>
    request<CreateJobResponse>("/jobs/generate", {
      method: "POST",
      body: JSON.stringify(body),
      headers: clientRequestId
        ? { "X-Client-Request-Id": clientRequestId }
        : undefined,
    }),

  getJobStatus: (jobId: string) =>
    request<JobStatusResponse>(`/jobs/${jobId}/status`),

  cancelJob: (jobId: string) =>
    request<CancelJobResponse>(`/jobs/${jobId}`, { method: "DELETE" }),

  getHistory: (limit = 20, offset = 0) =>
    request<HistoryResponse>(`/history?limit=${limit}&offset=${offset}`),

  getDownloadToken: (jobId: string) =>
    request<DownloadTokenResponse>(`/jobs/${jobId}/download-token`, {
      method: "POST",
    }),

  async downloadFile(jobId: string, format: "csv" | "xlsx"): Promise<void> {
    const { token } = await this.getDownloadToken(jobId);
    const response = await fetch(
      `${API_URL}/jobs/${jobId}/download?format=${format}`,
      {
        headers: {
          "X-Session-Id": getSessionId(),
          "X-Download-Token": token,
        },
      },
    );

    if (!response.ok) {
      const message = await parseError(response);
      throw new ApiClientError(message, response.status);
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] ?? `numbers_${jobId}.${format}`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },
};
