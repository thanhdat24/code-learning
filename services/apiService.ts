import { User } from "../types";

/**
 * Client-side DB service.
 *
 * IMPORTANT:
 * - Do NOT call MongoDB directly from the browser with connection strings/API keys.
 * - This service talks to YOUR backend (Express) at /api, then the backend talks to MongoDB.
 */

type ApiErrorBody = { error?: string; details?: unknown };

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = (await parseJsonSafe<ApiErrorBody>(res)) ?? {};
    const msg = body.error || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  const data = await parseJsonSafe<T>(res);
  if (data == null) throw new Error("Server returned invalid JSON");
  return data;
}

export const dbService = {
  async getUser(username: string): Promise<User | null> {
    const safe = username.trim();
    if (!safe) return null;

    const res = await fetch(`/api/users/${encodeURIComponent(safe)}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = (await parseJsonSafe<ApiErrorBody>(res)) ?? {};
      throw new Error(body.error || `HTTP ${res.status} ${res.statusText}`);
    }
    const data = await parseJsonSafe<User>(res);
    if (data == null) throw new Error("Server returned invalid JSON");
    return data;
  },

  async saveUser(user: User): Promise<boolean> {
    await requestJson<{ ok: true }>(`/api/users/${encodeURIComponent(user.username)}`,
      {
        method: "PUT",
        body: JSON.stringify(user),
      }
    );
    return true;
  },
};
