import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import * as prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore output folders and dependencies
  {
    ignores: ['dist', 'node_modules'],
  },
  // Base JavaScript config
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
  // TypeScript config
  {
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
    },
  },
  // Prettier integration
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { prettier: prettierPlugin },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
];
