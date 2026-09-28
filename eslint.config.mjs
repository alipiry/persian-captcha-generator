import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // The v1 font loader shadowed the `path` module; keep that class of bug out.
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
    },
  },
);
