import { defineConfig } from "eslint/config";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.greasemonkey,
                Atomics: "readonly",
                SharedArrayBuffer: "readonly",
                PardusOptions: "readonly",
                PardusOptionsUtility: "readonly",
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            "@stylistic": stylistic,
        },
        files: ["**/*.js"],
        ignores: ["dist/**"],
        rules: {
            "@stylistic/brace-style": ["error", "1tbs"],
            "semi": "error",
            "prefer-const": "error",
            "indent": ["error", 4, { SwitchCase: 1 }],
            "curly": ["error", "all"],
            "max-len": "off",
            "wrap-iife": [2, "inside"],
            "no-console": "off",
            "max-classes-per-file": "off",
            "spaced-comment": "off",
            "class-methods-use-this": "off",
            "no-restricted-syntax": "off",
            "no-use-before-define": "off",
            "no-new": "off",
            "no-plusplus": "off",
            "no-continue": "off",
            "prefer-destructuring": "off",
            "no-restricted-properties": "off",
            "prefer-exponentiation-operator": "off",
        },
    },
]);
