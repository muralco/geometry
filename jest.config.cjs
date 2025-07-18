/** @type{import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  collectCoverageFrom: ['src/**/*.ts?(x)'],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
  verbose: true,
};