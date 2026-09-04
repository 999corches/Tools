/**
 * Fetch-Wrapper für das spätere Python-Backend.
 *
 * Noch existiert kein Backend — dieser Wrapper liegt hier, damit
 * Tools mit `requiresBackend: true` (MarkItDown, PDF, ffmpeg …)
 * später nur noch `apiFetch` bzw. `apiUpload` aufrufen müssen.
 *
 * Die Basis-URL kommt aus `NEXT_PUBLIC_API_URL`, z. B.
 * `https://api.example.com`. Ist sie nicht gesetzt, schlagen
 * Aufrufe mit einer klaren Meldung fehl statt gegen die eigene
 * Origin zu laufen.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const isBackendConfigured = API_URL.length > 0;

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  /** Wird als JSON serialisiert. Für Datei-Uploads `apiUpload` nutzen. */
  json?: unknown;
  body?: BodyInit | null;
  /** Abbruch nach n Millisekunden. Standard: 60 Sekunden. */
  timeoutMs?: number;
};

function resolveUrl(path: string): string {
  if (!isBackendConfigured) {
    throw new ApiError(
      "Kein Backend konfiguriert. Bitte NEXT_PUBLIC_API_URL setzen.",
      0,
      null,
    );
  }
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => null);
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["detail", "message", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
}

/**
 * Ruft `path` relativ zur API-Basis auf und gibt die geparste
 * Antwort zurück. Fehler landen als `ApiError` mit lesbarer
 * Meldung — die Tools zeigen sie im Inline-Alert an.
 */
export async function apiFetch<T = unknown>(
  path: string,
  { json, timeoutMs = 60_000, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const url = resolveUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });

    const body = await readBody(response);

    if (!response.ok) {
      throw new ApiError(
        messageFromBody(body, `Anfrage fehlgeschlagen (${response.status}).`),
        response.status,
        body,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Zeitüberschreitung bei der Anfrage.", 0, null);
    }
    throw new ApiError(
      "Backend nicht erreichbar. Läuft der Dienst und stimmt NEXT_PUBLIC_API_URL?",
      0,
      null,
    );
  } finally {
    clearTimeout(timeout);
  }
}

/** Lädt eine Datei als multipart/form-data hoch. */
export async function apiUpload<T = unknown>(
  path: string,
  file: File,
  { fields, ...options }: ApiFetchOptions & { fields?: Record<string, string> } = {},
): Promise<T> {
  const form = new FormData();
  form.append("file", file, file.name);
  for (const [key, value] of Object.entries(fields ?? {})) {
    form.append(key, value);
  }
  // Content-Type bewusst nicht setzen — der Browser ergänzt die Boundary.
  return apiFetch<T>(path, { ...options, method: "POST", body: form });
}

/** Lädt eine Datei vom Backend herunter (PDF, Audio, …). */
export async function apiDownload(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Blob> {
  const url = resolveUrl(path);
  const response = await fetch(url, {
    ...options,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    headers: {
      ...(options.json !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await readBody(response);
    throw new ApiError(
      messageFromBody(body, `Download fehlgeschlagen (${response.status}).`),
      response.status,
      body,
    );
  }

  return response.blob();
}
