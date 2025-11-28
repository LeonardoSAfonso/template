// Setup global para testes

// Mock do console para evitar poluição dos logs durante os testes
global.console = {
  ...console,
  // Desabilita logs durante testes, mas mantém errors
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

// Configuração global de timeout para testes
jest.setTimeout(10000);

// Mock das variáveis de ambiente para testes
process.env.KC_AUTH_SERVER_URL = 'http://localhost:8080/auth';
process.env.KC_REALM = 'template-name';
process.env.KC_CLIENT_ID = 'api';
process.env.KC_SECRET = 'test-secret';
process.env.KC_ADMIN = 'admin';
process.env.KC_ADMIN_PASSWORD = 'admin';
process.env.KC_REQUEST_TIMEOUT = '5000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
