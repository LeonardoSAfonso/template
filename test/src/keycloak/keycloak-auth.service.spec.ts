import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakAuthService } from 'src/keycloak/keycloak-auth.service';
import { Token } from 'src/keycloak/domain/token.dto';
import { mockKeycloakAdminClient } from '../../mocks/utils';
import { ISSUER_CLIENT } from 'src/keycloak/constants';
import { BaseClient } from 'openid-client';
import jwt_decode from 'jwt-decode';

jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('KeycloakAuthService', () => {
  let sut: KeycloakAuthService;
  let adminClient: KeycloakAdminClient;
  let issuerClient: BaseClient;
  let jwtService: JwtService;
  let mockJwtDecode: jest.MockedFunction<typeof jwt_decode>;

  const mockTokenSet = {
    access_token: 'access-token-123',
    expires_in: 3600,
    id_token: 'id-token-123',
    refresh_token: 'refresh-token-123',
    token_type: 'Bearer',
    session_state: 'session-123',
    scope: 'openid email profile',
    expired: false,
    claims: () => ({}),
  } as any;

  const mockToken: Token = {
    accessToken: 'access-token-123',
    expiresIn: 3600,
    idToken: 'id-token-123',
    refreshToken: 'refresh-token-123',
    tokenType: 'Bearer',
    sessionState: 'session-123',
    scope: 'openid email profile',
  };

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockIssuerClient = {
      grant: jest.fn(),
      refresh: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakAuthService,
        {
          provide: KeycloakAdminClient,
          useValue: mockKeycloakAdminClient,
        },
        {
          provide: ISSUER_CLIENT,
          useValue: mockIssuerClient,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    sut = module.get<KeycloakAuthService>(KeycloakAuthService);
    adminClient = module.get<KeycloakAdminClient>(KeycloakAdminClient);
    issuerClient = module.get<BaseClient>(ISSUER_CLIENT);
    jwtService = module.get<JwtService>(JwtService);

    mockJwtDecode = jwt_decode as jest.MockedFunction<typeof jwt_decode>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully using default scope', async () => {
      const username = 'john@example.com';
      const password = 'password123';

      jest.spyOn(issuerClient, 'grant').mockResolvedValue(mockTokenSet);

      const result = await sut.login(username, password);

      expect(issuerClient.grant).toHaveBeenCalledWith({
        scope: 'openid email profile',
        grant_type: 'password',
        username,
        password,
      });
      expect(result).toEqual(mockToken);
    });

    it('should propagate error when login fails', async () => {
      const username = 'john@example.com';
      const password = 'password123';
      const error = new Error('Invalid credentials');

      jest.spyOn(issuerClient, 'grant').mockRejectedValue(error);

      await expect(sut.login(username, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('loginWithScope', () => {
    it('should login with custom scope', async () => {
      const username = 'maria@example.com';
      const password = 'password456';
      const customScope = 'openid email profile offline_access';

      jest.spyOn(issuerClient, 'grant').mockResolvedValue(mockTokenSet);

      const result = await sut.loginWithScope(username, password, customScope);

      expect(issuerClient.grant).toHaveBeenCalledWith({
        scope: customScope,
        grant_type: 'password',
        username,
        password,
      });
      expect(result).toEqual(mockToken);
    });

    it('should correctly map token fields', async () => {
      const username = 'pedro@example.com';
      const password = 'password789';
      const scope = 'openid email';

      const customTokenSet = {
        ...mockTokenSet,
        access_token: 'custom-access-token',
        expires_in: 1800,
        scope: 'openid email',
      };

      jest.spyOn(issuerClient, 'grant').mockResolvedValue(customTokenSet);

      const result = await sut.loginWithScope(username, password, scope);

      expect(result.accessToken).toBe('custom-access-token');
      expect(result.expiresIn).toBe(1800);
      expect(result.scope).toBe('openid email');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'refresh-token-123';

      jest.spyOn(issuerClient, 'refresh').mockResolvedValue(mockTokenSet);

      const result = await sut.refreshToken(refreshToken);

      expect(issuerClient.refresh).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(mockToken);
    });

    it('should propagate error when refresh fails', async () => {
      const refreshToken = 'invalid-refresh-token';
      const error = new Error('Invalid refresh token');

      jest.spyOn(issuerClient, 'refresh').mockRejectedValue(error);

      await expect(sut.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('loginLongLivedToken', () => {
    it('should login with long-lived token', async () => {
      const username = 'admin@example.com';
      const password = 'admin123';

      jest.spyOn(issuerClient, 'grant').mockResolvedValue(mockTokenSet);

      const result = await sut.loginLongLivedToken(username, password);

      expect(issuerClient.grant).toHaveBeenCalledWith({
        scope: 'openid email profile offline_access',
        grant_type: 'password',
        username,
        password,
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const userId = 'user-123';
      const mockDecodedToken = { exp: Date.now() / 1000 + 3600 };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      const newTokenSet = {
        access_token: 'new-admin-token',
        refresh_token: 'new-refresh-token',
        expired: false,
        claims: () => ({}),
      } as any;
      jest.spyOn(issuerClient, 'refresh').mockResolvedValue(newTokenSet);
      jest.spyOn(adminClient, 'setAccessToken').mockReturnValue(undefined);
      jest.spyOn(adminClient.users, 'logout').mockResolvedValue(undefined);

      await sut.logout(userId);

      expect(mockJwtDecode).toHaveBeenCalledWith(adminClient.accessToken);
      expect(issuerClient.refresh).toHaveBeenCalledWith(
        adminClient.refreshToken,
      );
      expect(adminClient.setAccessToken).toHaveBeenCalledWith(
        newTokenSet.access_token,
      );
      expect(adminClient.users.logout).toHaveBeenCalledWith({ id: userId });
    });

    it('should refresh admin token when expired', async () => {
      const userId = 'user-123';
      const mockDecodedToken = { exp: Date.now() / 1000 - 3600 };
      const newTokenSet = {
        access_token: 'new-admin-token',
        refresh_token: 'new-refresh-token',
        expired: false,
        claims: () => ({}),
      } as any;

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      jest.spyOn(issuerClient, 'refresh').mockResolvedValue(newTokenSet);
      jest.spyOn(adminClient, 'setAccessToken').mockReturnValue(undefined);
      jest.spyOn(adminClient.users, 'logout').mockResolvedValue(undefined);

      await sut.logout(userId);

      expect(issuerClient.refresh).toHaveBeenCalledWith(
        adminClient.refreshToken,
      );
      expect(adminClient.setAccessToken).toHaveBeenCalledWith(
        newTokenSet.access_token,
      );
      expect(adminClient.users.logout).toHaveBeenCalledWith({ id: userId });
    });

    it('should propagate error when logout fails', async () => {
      const userId = 'user-123';
      const mockDecodedToken = { exp: Date.now() / 1000 + 3600 };
      const error = new Error('Logout failed');

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      const newTokenSet = {
        access_token: 'new-admin-token',
        refresh_token: 'new-refresh-token',
        expired: false,
        claims: () => ({}),
      } as any;
      jest.spyOn(issuerClient, 'refresh').mockResolvedValue(newTokenSet);
      jest.spyOn(adminClient, 'setAccessToken').mockReturnValue(undefined);
      jest.spyOn(adminClient.users, 'logout').mockRejectedValue(error);

      await expect(sut.logout(userId)).rejects.toThrow('Logout failed');
    });
  });

  describe('resetPasswordToken', () => {
    it('should generate password reset token', async () => {
      const userId = 'user-123';
      const expectedToken = 'reset-token-123';

      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      const result = await sut.resetPasswordToken(userId);

      expect(jwtService.sign).toHaveBeenCalledWith({
        id: userId,
        expireIn: expect.any(Date),
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('checkIfAdminTokenStillValid', () => {
    it('should return undefined when token is still valid', async () => {
      const mockDecodedToken = { exp: Date.now() / 1000 + 3600 };
      const newTokenSet = {
        access_token: 'new-admin-token',
        refresh_token: 'new-refresh-token',
        expired: false,
        claims: () => ({}),
      } as any;

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      jest.spyOn(issuerClient, 'refresh').mockResolvedValue(newTokenSet);
      jest.spyOn(adminClient, 'setAccessToken').mockReturnValue(undefined);

      const result = await sut.checkIfAdminTokenStillValid();

      expect(mockJwtDecode).toHaveBeenCalledWith(adminClient.accessToken);
      expect(issuerClient.refresh).toHaveBeenCalledWith(
        adminClient.refreshToken,
      );
      expect(adminClient.setAccessToken).toHaveBeenCalledWith(
        newTokenSet.access_token,
      );
      expect(result).toBeUndefined();
    });

    it('should refresh token when expired', async () => {
      const mockDecodedToken = { exp: Date.now() / 1000 - 3600 };
      const newTokenSet = {
        access_token: 'new-admin-token',
        refresh_token: 'new-refresh-token',
        expired: false,
        claims: () => ({}),
      } as any;

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      jest.spyOn(issuerClient, 'refresh').mockResolvedValue(newTokenSet);
      jest.spyOn(adminClient, 'setAccessToken').mockReturnValue(undefined);

      const result = await sut.checkIfAdminTokenStillValid();

      expect(issuerClient.refresh).toHaveBeenCalledWith(
        adminClient.refreshToken,
      );
      expect(adminClient.setAccessToken).toHaveBeenCalledWith(
        newTokenSet.access_token,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate error when refresh fails', async () => {
      const mockDecodedToken = { exp: Date.now() / 1000 - 3600 };
      const error = new Error('Refresh failed');

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      jest.spyOn(issuerClient, 'refresh').mockRejectedValue(error);

      await expect(sut.checkIfAdminTokenStillValid()).rejects.toThrow(
        'Refresh failed',
      );
    });
  });
});
