/**
 * MIRA Ops Intelligence - Backend Service Discovery Helper
 * In Vercel Services mode, the 'BACKEND_URL' binding environment variable
 * injects the internal URL of the FastAPI backend service at runtime.
 */

export function getBackendUrl(path: string = ""): string {
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${cleanBase}${cleanPath}`;
}
