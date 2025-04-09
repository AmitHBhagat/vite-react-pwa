import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: ["fevicon.png"],
      manifest: {
        name: "Society Care",
        short_name: "SocietyCare",
        description: "Society Care application to manage society",
        theme_color: "#233c8e",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/fevicon.png",
            sizes: "200x200",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 5 * 1024 * 1024,
  },
  server: {
    // host: "192.168.83.208",
    port: 3002,
    // https: {
    //   key: fs.readFileSync(
    //     path.resolve(__dirname, "192.168.83.208-key.pem"),
    //     "utf-8"
    //   ),
    //   cert: fs.readFileSync(
    //     path.resolve(__dirname, "192.168.83.208.pem"),
    //     "utf-8"
    //   ),
    // },
  },
});
