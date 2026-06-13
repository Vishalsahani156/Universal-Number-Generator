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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

class ApiClientError extends Error {
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
      return data.detail.map((d) => d.msg).join(", ");
    }
  } catch {
    // ignore parse errors
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await parseError(response);
    const retryAfter = response.headers.get("Retry-After");
    throw new ApiClientError(
      message,
      response.status,
      retryAfter ? parseInt(retryAfter, 10) : undefined
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
    request<DownloadTokenResponse>(`/jobs/${jobId}/download-token`),

  getDownloadUrl: (jobId: string, format: string, token: string) =>
    `${API_URL}/jobs/${jobId}/download?format=${format}`,
};

export async function downloadJobFile(
  jobId: string,
  format: string
): Promise<void> {
  const { token } = await apiClient.getDownloadToken(jobId);
  const url = apiClient.getDownloadUrl(jobId, format, token);

  const response = await fetch(url, {
    headers: {
      "X-Session-Id": getSessionId(),
      "X-Download-Token": token,
    },
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiClientError(message, response.status);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  let filename = `numbers_${jobId}.${format}`;
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export { ApiClientError };
