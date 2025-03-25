module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.integration.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/integration/setup.ts'],
    testTimeout: 10000
}; 