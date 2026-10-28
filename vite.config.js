import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "bananas-32.png",
        "bananas-128.png",
        "bananas-144.png",
        "bananas-152.png",
        "bananas-192.png",
        "bananas-256.png",
        "PWA-preview.jpeg",
      ],
      manifest: {
        name: "Feira da Fruta",
        short_name: "Feira da Fruta",
        description:
          "Guia prático de frutas, verduras e legumes da estação na feira.",
        lang: "pt-BR",
        theme_color: "#2e7d32",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/bananas-32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/bananas-128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/bananas-144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/bananas-152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/bananas-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/bananas-256.png",
            sizes: "256x256",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,jpg,jpeg,png,svg,webp}"],
        globIgnores: ["PWA-preview.jpeg"],
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsInlineLimit: 0,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
