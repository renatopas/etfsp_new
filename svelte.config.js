import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * @type import("@sveltejs/vite-plugin-svelte").SvelteConfig
 */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      precompress: true,
    }),
  },
};

export default config;
