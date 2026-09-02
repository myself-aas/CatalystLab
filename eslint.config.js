import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'build/**',
      'scripts/**',
      'api/**',
      'public/**'
    ]
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      'react': reactPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'no-unused-vars': 'off',
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
);
