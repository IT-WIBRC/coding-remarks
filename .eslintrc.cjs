module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],

  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: "@typescript-eslint/parser",
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: ["vue", "@typescript-eslint", "markdown"],

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    "vue/multi-word-component-names": "off",
    "vue/no-v-html": "off",
  },

  overrides: [
    {
      files: ["**/*.md"],
      processor: "markdown/markdown",
    },
    {
      files: ["**/*.md/*.js", "**/*.md/*.ts"],
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      rules: {
        "no-console": "off",
        "no-undef": "off",
      },
    },
    {
      files: ["**/*.md/*.vue"],
      rules: {
        "vue/no-unused-components": "off",
        "vue/valid-template-root": "off",
        "vue/require-default-prop": "off",
      },
    },
  ],
};
