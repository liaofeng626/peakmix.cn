import { clearToken, getToken } from "./auth";

export function getApiBase(): string {
  return "/api/v1";
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (!init?.skipAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 && !init?.skipAuth) {
    clearToken();
  }

  return res;
}

export async function downloadAuthed(path: string, filename: string) {
  const res = await apiFetch(path);

  if (!res.ok) {
    let msg = "下载失败";
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}