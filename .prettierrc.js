/** @type {import("prettier").Options} */
const config = {
    singleQuote: false,
    printWidth: 140,
    useTabs: false,
    tabWidth: 4,
    trailingComma: "none",
    arrowParens: "always",
    bracketSameLine: true,
    htmlWhitespaceSensitivity: "css",
    svelteSortOrder: "options-scripts-markup-styles",
    svelteAllowShorthand: true,
    svelteIndentScriptAndStyle: true,
    overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
    plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
    // Without this the sorter never loads the theme, so every @theme- and
    // @utility-defined class is unknown to it and gets hoisted to the front.
    tailwindStylesheet: "src/app.css"
};

export default config;
