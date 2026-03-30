module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:import/recommended',
  ],

  plugins: ['boundaries', 'import'],

  settings: {
    'import/resolver': {
      typescript: {},
    },

    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/**' },
      { type: 'features', pattern: 'src/features/*/**' },
      { type: 'shared', pattern: 'src/shared/**' },
      { type: 'core', pattern: 'src/core/**' },
      { type: 'infra', pattern: 'src/infra/**' },
    ],
  },

  rules: {

    // Ban hardcoded candidate routes
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/^\\/candidate/]",
        message:
          'Do NOT hardcode candidate routes. Use candidateRoutes from features/candidates/routes.',
      },
    ],



    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'app', allow: ['features', 'shared', 'core', 'infra'] },
          { from: 'features', allow: ['shared', 'core', 'infra'] },
          { from: 'shared', allow: ['core'] },
          { from: 'core', allow: ['infra'] },
          { from: 'infra', allow: [] },
        ],
      },
    ],



    // No relative imports across features
    'import/no-relative-parent-imports': 'error',

    // Catch missing imports like useState
    'no-undef': 'error',

    // Enforce consistent imports
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling']],
        'newlines-between': 'always',
      },
    ],
  },
};
