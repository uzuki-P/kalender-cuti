import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // a fixed, rarely used port behind the kalender-cuti dev route
  server: {
    host: "127.0.0.1",
    port: 38417,
    strictPort: true,
    allowedHosts: ["kalender-cuti.ts.uzuki-p.my.id"],
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
})
