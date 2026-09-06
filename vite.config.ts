import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [tailwindcss(), sveltekit()],
  build: {
    rollupOptions: {
      external: ["sharp", "sqlite3"],
    },
  },
});
