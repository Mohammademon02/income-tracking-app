import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * Lint configuration.
 *
 * `npm run lint` was in package.json from the start but there was no config
 * file of any kind, so it had never once run — it exited with "ESLint couldn't
 * find an eslint.config.* file" every time.
 *
 * eslint-config-next 16 ships flat configs directly, so there is no need for
 * the FlatCompat bridge (which throws on this version anyway).
 */
export default [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'public/sw.js',
      'public/workbox-*.js',
      'public/worker-*.js',
    ],
  },
  {
    rules: {
      // The CSV import works with rows whose shape comes from a file, so `any`
      // is load-bearing there rather than laziness. Flag it, do not fail on it.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
