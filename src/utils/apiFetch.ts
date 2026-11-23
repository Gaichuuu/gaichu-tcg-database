export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchApiData<T>(
  path: string,
  what: string,
  notFound: T,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    if (response.status === 404) return notFound;
    throw new Error(`Failed to fetch ${what}: ${response.status}`);
  }
  const json = (await response.json()) as { data: T | null };
  return json.data ?? notFound;
}
