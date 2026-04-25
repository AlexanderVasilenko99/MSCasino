import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@casino/shared$': '<rootDir>/../shared/src/index',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
};

export default config;
