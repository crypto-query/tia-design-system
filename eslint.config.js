import globals from "globals";
import javascriptEslint from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import sveltePlugin from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
    javascriptEslint.configs.recommended,

    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
        plugins: {
            "@typescript-eslint": typescriptEslint
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                extraFileExtensions: [".svelte"]
            }
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            "no-undef": "off",
            "no-redeclare": "off",
            "preserve-caught-error": "off",
            "@typescript-eslint/no-unused-expressions": ["error", { allowTernary: true, allowShortCircuit: true }]
        }
    },

    {
        files: ["**/*.svelte", "**/*.svelte.js", "**/*.svelte.ts"],
        plugins: {
            svelte: sveltePlugin
        },
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: typescriptParser
            }
        },
        rules: {
            ...sveltePlugin.configs.recommended.rules
        }
    },

    betterTailwindcss.configs.recommended,
    {
        files: ["**/*.svelte", "**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx"],
        settings: {
            "better-tailwindcss": {
                entryPoint: "src/app.css",
                // required for enforce-canonical-classes px→token autofix
                // Removing this silently disables those rewrites.
                rootFontSize: 16
            }
        },
        rules: {
            "better-tailwindcss/enforce-consistent-class-order": "off",
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
            // `dark` is the theme marker the dark variant is built on — mode-watcher
            // writes it onto <html> — not a utility, so the rule cannot resolve it.
            "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^dark$"] }]
        }
    },

    {
        files: ["**/*.ts", "**/*.js", "**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
        ignores: ["**/*.test.ts", "**/*.svelte.test.ts"],
        rules: {
            "no-console": "error"
        }
    },

    {
        files: ["src/lib/**"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["$lib", "$lib/*", "$app/*"],
                            message:
                                "The library is consumed as source by apps that are not SvelteKit apps, so imports inside src/lib stay relative."
                        }
                    ]
                }
            ]
        }
    },

    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser
            }
        }
    },

    {
        ignores: ["**/node_modules", ".svelte-kit", "build", "test-results", "eslint.config.js", "svelte.config.js"]
    }
];
