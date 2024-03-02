module.exports = {
  root: true,
  extends: ["universe", "universe/native", "universe/web", "prettier"],
  env: {
    node: true,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.d.ts"],
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
  ],
  rules: {
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
  },
};
