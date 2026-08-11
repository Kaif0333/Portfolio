import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Strip console/debugger from production bundles only.
  esbuild:
    command === "build" ? { drop: ["console", "debugger"] as const } : {},
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three-stdlib"],
          r3f: [
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/rapier",
            "@react-three/postprocessing",
          ],
          gsap: ["gsap"],
        },
      },
    },
  },
}));
