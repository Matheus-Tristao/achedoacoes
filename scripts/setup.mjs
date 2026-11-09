import { existsSync, copyFileSync } from "node:fs";
if (!existsSync("backend/.env"))
  copyFileSync("backend/.env.example", "backend/.env");
console.log("Edite backend/.env com DATABASE_URL e DIRECT_URL do seu Postgres.");
