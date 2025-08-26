module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^prisma/client$': '<rootDir>/test/mocks/prisma-client.ts',
    '^@keycloak/keycloak-admin-client$':
      '<rootDir>/test/mocks/keycloak-admin-client.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '.spec.ts',
    '.e2e-spec.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@keycloak/keycloak-admin-client)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
};
