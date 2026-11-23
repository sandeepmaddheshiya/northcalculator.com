import next from 'eslint-config-next';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...next,
  ...nextTs,
  {
    ignores: [
      'brand/**',
      '.next/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
    ],
  },
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "CallExpression[callee.name='eval']", message: 'eval is banned (BRIEF §11).' },
        {
          selector: "NewExpression[callee.name='Function']",
          message: 'new Function is banned (BRIEF §11).',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
export default config;
