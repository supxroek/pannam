import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 2. ตั้งค่าให้เครื่องหมาย @ วิ่งไปหาโฟลเดอร์ src ทันที
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
