/*
 * Typed fetch wrapper for the same-origin /api backend.
 *
 * - Attaches the JWT from localStorage (fitness-saarthi-token) as
 *   `Authorization: Bearer <token>` on every request.
 * - JSON-encodes request bodies and decodes JSON responses.
 * - Throws ApiError { status, message } when the response is not ok.
 * - On 401 the stored session is cleared and the browser is sent to /login.
 */

export const TOKEN_KEY = "fitness-saarthi-token";
export const NAME_KEY = "fitness-saarthi-user-name";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}

function errorMessage(payload: unknown, status: number): string {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }
  return `Request failed (${status})`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  const contentType = res.headers.get("content-type") ?? "";
  let payload: unknown = null;
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  } else {
    payload = await res.text();
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearSession();
      window.location.href = "/login";
    }
    throw new ApiError(res.status, errorMessage(payload, res.status));
  }

  return payload as T;
}

/** Shape of every successful API envelope: { success, data, ... } */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
