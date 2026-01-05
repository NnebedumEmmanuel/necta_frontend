module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  // Increase timeout because starting Next server may take a bit
  testTimeout: 30000,
}
