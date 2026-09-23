import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' = tayo mismo ang magpapakita ng "update available" toast,
      // sa halip na basta mag-reload agad mid-shoot ng user
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Photoreel Photobooth",
        short_name: "Photoreel",
        description: "tap. pose. pin it. — a photobooth web app",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // I-precache LAHAT ng built assets — para minsan lang mag-open
        // habang may signal, gagana na siya offline paulit-ulit pagkatapos.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        skipWaiting: false, // kontrolado natin ito via UpdateToast, hindi bigla
        clientsClaim: true,
      },
      devOptions: {
        // para matest mo ang offline behavior kahit `npm run dev` lang
        enabled: true,
        type: "module",
      },
    }),
  ],
});
