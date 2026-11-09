// Função serverless da Vercel: usa o backend Express já compilado (backend/dist).
import app from "../backend/dist/src/app.js";

export default function handler(req, res) {
  // Garante que o Express sempre receba rotas começando com /api,
  // preservando a sub-rota e query parameters independentemente de rewrites internos da Vercel.
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-invoke-path"];
  if (matchedPath && typeof matchedPath === "string" && matchedPath.startsWith("/api")) {
    const queryIdx = req.url.indexOf("?");
    const query = queryIdx !== -1 ? req.url.slice(queryIdx) : "";
    req.url = matchedPath + query;
  } else if (!req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
  }
  return app(req, res);
}
