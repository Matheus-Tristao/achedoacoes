import { app } from "./app.js";

// Na Vercel o app roda como função serverless (sem listen).
// Localmente e em servidores tradicionais (Render, Railway), sobe normalmente.
if (!process.env.VERCEL) {
  app.listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
    console.log("AcheDoações API: http://localhost:3001"),
  );
}
