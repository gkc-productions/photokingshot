import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([
    ".codex/**",
    ".vscode-server/**",
    ".next/**",
    "node_modules/**",
    ".cache/**",
    ".npm/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/images/galleries/**",
    "public/audio/**",
  ]),
]);

export default eslintConfig;
