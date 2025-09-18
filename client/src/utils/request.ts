import { getClientId } from "./clientId";

function joinUrl(base: string, path: string): string {
  if (!base) return path;
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`.replace(/([^:])\/\/+/, "$1/");
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("X-Client-Id", getClientId());

  // 前后端都在 Vercel，同域调用
  const base = "";
  let url: RequestInfo | URL = input;

  if (typeof input === "string" && input.startsWith("/")) {
    url = joinUrl(base, input);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include", // 保留 Cookie
  });
}
