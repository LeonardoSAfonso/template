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
    '!src/**/*.module.ts',
    '!src/**/*.types.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.interfaces.ts',
    '!src/**/*.dto.ts',
    '!src/main/**/*',
    '!src/config/**/*',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^prisma/client$': '<rootDir>/test/mocks/utils.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '.spec.ts',
    '.e2e-spec.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@keycloak/keycloak-admin-client|url-join|url-template|camelize-ts)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testTimeout: 30000,
  maxWorkers: 1,
};
