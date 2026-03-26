import eslint from '@eslint/js';
import js from '@eslint/js';

export default [
  eslint.configs.recommended,
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { module: 'writable', require: 'writable' }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  }
];
