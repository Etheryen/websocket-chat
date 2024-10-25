import { getApiUrl } from "./url";

const fetchApi = (route: string, opts?: RequestInit) =>
  fetch(getApiUrl() + route, opts);

export async function getUsers(): Promise<string[]> {
  return await (await fetchApi("/api/users")).json();
}

export async function checkUsername(username: string) {
  const response = await fetchApi("/api/username", {
    method: "POST",
    body: JSON.stringify({ username }),
    headers: { "Content-type": "application/json" },
  });

  if (response.ok) return { available: true, error: null } as const;
  return { available: false, error: await response.text() } as const;
}
