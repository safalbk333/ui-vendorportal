import eslintJs from '@eslint/js';
import globals from 'globals';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

const commonRules = () => ({
  ...reactHooksPlugin.configs.recommended.rules,

  'func-names': 1,
  'no-bitwise': 2,
  'object-shorthand': 1,
  'no-useless-rename': 1,
  'default-case-last': 2,
  'consistent-return': 2,
  'no-constant-condition': 1,

  'default-case': [2, { commentPattern: '^no default$' }],
  'lines-around-directive': [2, { before: 'always', after: 'always' }],
  'arrow-body-style': [2, 'as-needed'],

  // react
  'react/jsx-key': 0,
  'react/prop-types': 0,
  'react/display-name': 0,
  'react/no-children-prop': 0,
  'react/jsx-boolean-value': 2,
  'react/self-closing-comp': 2,
  'react/react-in-jsx-scope': 0,
  'react/jsx-no-useless-fragment': [1, { allowExpressions: true }],
  'react/jsx-curly-brace-presence': [2, { props: 'never', children: 'never' }],

  // typescript (kept safe rules only)
  '@typescript-eslint/no-explicit-any': 0,
  '@typescript-eslint/no-empty-object-type': 0,
  '@typescript-eslint/consistent-type-imports': 1,

  // 🚀 DISABLED NOISE RULES
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-shadow': 'off',
});

// ----------------------------------------------------------------------

const unusedImportsRules = () => ({
  // 🚀 disable all unused import + variable noise
  'unused-imports/no-unused-imports': 'off',
  'unused-imports/no-unused-vars': 'off',
});

// ----------------------------------------------------------------------

const customConfig = {
  plugins: {
    'react-hooks': reactHooksPlugin,
    'unused-imports': unusedImportsPlugin,
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  rules: {
    ...commonRules(),
    ...unusedImportsRules(),
  },
};

// ----------------------------------------------------------------------

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },

  {
    ignores: ['node_modules', '.next', 'dist', 'build'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  customConfig,
];