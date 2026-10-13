import { existsSync, realpathSync } from "node:fs";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Worktrees symlink `node_modules` to the main checkout; without its real path here, Vite
// 403s SvelteKit's client entry and nothing hydrates — the SSR'd page just looks inert.
const linkedNodeModules = existsSync("node_modules") ? realpathSync("node_modules") : null;

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        fs: {
            allow: linkedNodeModules ? [process.cwd(), linkedNodeModules] : [process.cwd()]
        }
    }
});
