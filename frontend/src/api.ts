export let csrf = "";
export async function api(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<any> {
  const r = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[API non-JSON response] Status ${r.status}:`, text.slice(0, 300));
    data = {
      error:
        `Servidor indisponível (${r.status}). Confira se o backend está em execução e tente novamente.`,
    };
  }
  if (!r.ok) {
    console.error(`[API Error] ${method} /api${path} -> Status ${r.status}:`, data);
    throw new Error(data.error || "Não foi possível carregar os dados");
  }
  if (data.csrf) csrf = data.csrf;
  return data;
}
