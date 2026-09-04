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
const config = [
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
      // No `any` is left in the codebase, so a new one is a mistake rather
      // than a backlog item. The CSV importer — the one place that genuinely
      // handles values of unknown shape — types them as `unknown` and narrows.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]

export default config
