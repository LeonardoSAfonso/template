// Mocks comuns para testes

// Mock do PrismaClient para moduleNameMapper
export class PrismaClient {
  account = {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
  $connect = jest.fn();
  $disconnect = jest.fn();
}

// Mock do PrismaService
export const mockPrismaService = {
  account: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock do KeycloakAdminClient
export const mockKeycloakAdminClient = {
  auth: jest.fn(),
  users: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
  },
  setAccessToken: jest.fn(),
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

// Mock do ConfigService
export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      KC_AUTH_SERVER_URL: 'http://localhost:8080/auth',
      KC_REALM: 'template-name',
      KC_CLIENT_ID: 'api',
      KC_SECRET: 'test-secret',
      KC_ADMIN: 'admin',
      KC_ADMIN_PASSWORD: 'admin',
      KC_REQUEST_TIMEOUT: 5000,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      JWT_SECRET: 'test-jwt-secret',
    };
    return config[key];
  }),
};

// Mock do JwtService
export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
  verifyAsync: jest
    .fn()
    .mockResolvedValue({ sub: 'user-id', email: 'test@test.com' }),
  decode: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
};

// Mock do KeycloakUserService
export const mockKeycloakUserService = {
  create: jest.fn().mockResolvedValue({ id: 'keycloak-user-id' }),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  changePassword: jest.fn(),
  remove: jest.fn(),
  verifyToken: jest.fn().mockResolvedValue('test@test.com'),
};

// Mock do KeycloakAuthService
export const mockKeycloakAuthService = {
  login: jest.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
  }),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  checkIfAdminTokenStillValid: jest.fn(),
};

// Mock do ISSUER_CLIENT
export const mockIssuerClient = {
  grant: jest.fn().mockResolvedValue({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    token_type: 'Bearer',
    id_token: 'id-token',
    session_state: 'session-state',
    scope: 'openid email profile',
  }),
  refresh: jest.fn(),
};

// Mock do BaseClient (openid-client)
export const mockBaseClient = {
  grant: jest.fn(),
  refresh: jest.fn(),
};

// Mock do jwt-decode
export const mockJwtDecode = jest.fn();

// Dados de exemplo para testes
export const mockAccountData = {
  id: 'account-id-123',
  name: 'João Silva',
  email: 'joao@teste.com',
  identification: '12345678901',
  first_access: false,
  email_checked: false,
  keycloakId: 'keycloak-user-id',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

export const mockCreateAccountDTO = {
  name: 'João Silva',
  email: 'joao@teste.com',
  identification: '12345678901',
  password: 'SenhaForte123!',
  keycloakId: 'keycloak-user-id',
};

export const mockUpdateAccountDTO = {
  id: 'account-id-123',
  name: 'João Silva Updated',
  email: 'joao.updated@teste.com',
};

export const mockPaginationParams = {
  limit: 10,
  offset: 0,
  orderBy: 'name' as
    | 'name'
    | 'id'
    | 'identification'
    | 'email'
    | 'first_access'
    | 'email_checked'
    | 'keycloakId'
    | 'createdAt'
    | 'updatedAt',
  order: 'asc' as 'asc' | 'desc',
};
