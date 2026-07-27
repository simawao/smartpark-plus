const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

type ApiResponse<T> = { success: boolean; message: string; data: T };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const result = await response.json() as ApiResponse<T>;
  if (!response.ok || !result.success) throw new Error(result.message || "API isteği başarısız.");
  return result.data;
}

export const recordsApi = {
  list: <T>(module: string) => request<T[]>(`/records/${module}`),
  bootstrap: <T>(module: string, records: T[]) => request<T[]>(`/records/${module}/bootstrap`, { method: "POST", body: JSON.stringify({ records }) }),
  create: <T>(module: string, record: Omit<T, "id">) => request<T>(`/records/${module}`, { method: "POST", body: JSON.stringify(record) }),
  update: <T>(module: string, id: number, record: Omit<T, "id">) => request<T>(`/records/${module}/${id}`, { method: "PUT", body: JSON.stringify(record) }),
  remove: (module: string, id: number) => request<{deleted:boolean}>(`/records/${module}/${id}`, { method: "DELETE" }),
};
