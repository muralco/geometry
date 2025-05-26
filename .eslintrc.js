const path = require('node:path');

module.exports = {
  settings: {
    'import/resolver': {
      webpack: null,
    },
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: path.join(__dirname),
      },
    ],
    '@typescript-eslint/no-namespace': 'off',
    'no-param-reassign': 'off',
  },
};
