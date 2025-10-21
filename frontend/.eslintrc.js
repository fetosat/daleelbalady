module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Temporarily relax rules during migration
    // TODO: Re-enable once all images/hooks issues are fixed
    '@next/next/no-img-element': 'warn',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
  // Ignore specific directories during linting to reduce noise
  ignorePatterns: [
    '.next/',
    'node_modules/',
    'out/',
    'build/',
    'dist/',
    '*.config.js',
    'src/pages.disabled/**',
  ],
};
