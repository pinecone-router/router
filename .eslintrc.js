module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  },
  extends: ['plugin:perfectionist/recommended-line-length-legacy'],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true
};