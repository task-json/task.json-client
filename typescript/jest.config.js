module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // See https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};