import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",           // ← 必须是 / （根域部署）
  build: { outDir: "dist" }
});
