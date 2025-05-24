import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // ✅ important for relative paths when served via Express
  plugins: [react()],
});
