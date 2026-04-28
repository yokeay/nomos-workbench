import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import nextjs from 'eslint-config-next';

export default [
  ...js.configs.recommended,
  ...nextjs.coreWebVitals,
  ...nextjs.ts,
  ...react.configs.recommended,
  {
    files: ['**/*.{js,mjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
