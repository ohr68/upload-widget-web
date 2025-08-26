// eslint.config.js
import neostandard from 'neostandard'
import stylistic from '@stylistic/eslint-plugin'
import vitestPlugin from 'eslint-plugin-vitest'

export default [
  ...neostandard({
    ts: true,
    jsx: true,
    tsx: true,
    plugins: {
      '@stylistic': stylistic,
      vitest: vitestPlugin
    },
    rules: {
      // Stylistic formatting rules
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'double'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],

      // Tailwind class sorting
      '@stylistic/tailwind/order': 'warn',
      '@stylistic/tailwind/no-custom-classname': 'off',

      'vitest/no-focused-tests': 'warn',
      'vitest/no-identical-title': 'error'
    },
    overrides: [
      {
        files: ['**/*.spec.ts', '**/*.spec.tsx'],
        parser: '@typescript-eslint/parser',
        env: {
          'vitest/globals': true
        },
        plugins: ['vitest'],
      },
    ],
  }),
]
