import { Test, TestingModule } from '@nestjs/testing';
import { AuthControler } from 'src/keycloak/auth.controller';
import { KeycloakUserService } from 'src/keycloak/keycloak-user.service';
import { KeycloakAuthService } from 'src/keycloak/keycloak-auth.service';
import { Token } from 'src/keycloak/domain/token.dto';

describe('AuthControler', () => {
  let controller: AuthControler;
  let keycloakUserService: KeycloakUserService;
  let keycloakAuthService: KeycloakAuthService;

  const mockKeycloakUserService = {
    changePassword: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockKeycloakAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    checkIfAdminTokenStillValid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthControler],
      providers: [
        {
          provide: KeycloakUserService,
          useValue: mockKeycloakUserService,
        },
        {
          provide: KeycloakAuthService,
          useValue: mockKeycloakAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthControler>(AuthControler);
    keycloakUserService = module.get<KeycloakUserService>(KeycloakUserService);
    keycloakAuthService = module.get<KeycloakAuthService>(KeycloakAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData = {
        username: 'joao@example.com',
        password: 'senha123',
      };

      const expectedToken: Token = {
        accessToken: 'access-token-123',
        expiresIn: 3600,
        idToken: 'id-token-123',
        refreshToken: 'refresh-token-123',
        tokenType: 'Bearer',
        sessionState: 'session-123',
        scope: 'openid email profile',
      };

      jest.spyOn(keycloakAuthService, 'login').mockResolvedValue(expectedToken);

      const result = await controller.login(loginData);

      expect(keycloakAuthService.login).toHaveBeenCalledWith(
        loginData.username,
        loginData.password,
      );
      expect(result).toEqual(expectedToken);
    });

    it('should propagate error when login fails', async () => {
      const loginData = {
        username: 'joao@example.com',
        password: 'senha123',
      };

      const error = new Error('Invalid credentials');
      jest.spyOn(keycloakAuthService, 'login').mockRejectedValue(error);

      await expect(controller.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('refreshToken', () => {
    it('should renew token successfully', async () => {
      const refreshData = {
        token: 'refresh-token-123',
      };

      const expectedToken: Token = {
        accessToken: 'new-access-token-123',
        expiresIn: 3600,
        idToken: 'new-id-token-123',
        refreshToken: 'new-refresh-token-123',
        tokenType: 'Bearer',
        sessionState: 'new-session-123',
        scope: 'openid email profile',
      };

      jest
        .spyOn(keycloakAuthService, 'refreshToken')
        .mockResolvedValue(expectedToken);

      const result = await controller.refreshToken(refreshData);

      expect(keycloakAuthService.refreshToken).toHaveBeenCalledWith(
        refreshData.token,
      );
      expect(result).toEqual(expectedToken);
    });

    it('should propagate error when refresh fails', async () => {
      const refreshData = {
        token: 'invalid-refresh-token',
      };

      const error = new Error('Invalid refresh token');
      jest.spyOn(keycloakAuthService, 'refreshToken').mockRejectedValue(error);

      await expect(controller.refreshToken(refreshData)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordData = {
        email: 'joao@example.com',
        newPassword: 'nova-senha',
      };

      const expectedResult = { id: 'user-123' };
      jest
        .spyOn(keycloakAuthService, 'checkIfAdminTokenStillValid')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keycloakUserService, 'changePassword')
        .mockResolvedValue(expectedResult);

      const result = await controller.changePassword(changePasswordData);

      expect(
        keycloakAuthService.checkIfAdminTokenStillValid,
      ).toHaveBeenCalled();
      expect(keycloakUserService.changePassword).toHaveBeenCalledWith(
        changePasswordData.email,
        changePasswordData.newPassword,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate error when admin token verification fails', async () => {
      const changePasswordData = {
        email: 'joao@example.com',
        newPassword: 'nova-senha',
      };

      const error = new Error('Admin token invalid');
      jest
        .spyOn(keycloakAuthService, 'checkIfAdminTokenStillValid')
        .mockRejectedValue(error);

      await expect(
        controller.changePassword(changePasswordData),
      ).rejects.toThrow('Admin token invalid');
      expect(keycloakUserService.changePassword).not.toHaveBeenCalled();
    });

    it('should propagate error when password change fails', async () => {
      const changePasswordData = {
        email: 'joao@example.com',
        newPassword: 'nova-senha',
      };

      jest
        .spyOn(keycloakAuthService, 'checkIfAdminTokenStillValid')
        .mockResolvedValue(undefined);
      const error = new Error('Password change failed');
      jest
        .spyOn(keycloakUserService, 'changePassword')
        .mockRejectedValue(error);

      await expect(
        controller.changePassword(changePasswordData),
      ).rejects.toThrow('Password change failed');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordData = {
        token: 'reset-token-123',
        newPassword: 'nova-senha123',
      };

      const email = 'joao@example.com';
      const expectedResult = { id: 'user-123' };

      jest.spyOn(keycloakUserService, 'verifyToken').mockResolvedValue(email);
      jest
        .spyOn(keycloakAuthService, 'checkIfAdminTokenStillValid')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keycloakUserService, 'changePassword')
        .mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordData);

      expect(keycloakUserService.verifyToken).toHaveBeenCalledWith(
        resetPasswordData.token,
      );
      expect(
        keycloakAuthService.checkIfAdminTokenStillValid,
      ).toHaveBeenCalled();
      expect(keycloakUserService.changePassword).toHaveBeenCalledWith(
        email,
        resetPasswordData.newPassword,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate error when token verification fails', async () => {
      const resetPasswordData = {
        token: 'invalid-reset-token',
        newPassword: 'nova-senha123',
      };

      const error = new Error('Invalid reset token');
      jest.spyOn(keycloakUserService, 'verifyToken').mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordData)).rejects.toThrow(
        'Invalid reset token',
      );
      expect(
        keycloakAuthService.checkIfAdminTokenStillValid,
      ).not.toHaveBeenCalled();
      expect(keycloakUserService.changePassword).not.toHaveBeenCalled();
    });

    it('should propagate error when admin token verification fails', async () => {
      const resetPasswordData = {
        token: 'valid-reset-token',
        newPassword: 'nova-senha123',
      };

      const email = 'joao@example.com';
      jest.spyOn(keycloakUserService, 'verifyToken').mockResolvedValue(email);
      const error = new Error('Admin token invalid');
      jest
        .spyOn(keycloakAuthService, 'checkIfAdminTokenStillValid')
        .mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordData)).rejects.toThrow(
        'Admin token invalid',
      );
      expect(keycloakUserService.changePassword).not.toHaveBeenCalled();
    });

    it('should propagate error when password change fails', async () => {
      const resetPasswordData = {
        token: 'valid-reset-token',
        newPassword: 'nova-senha123',
      };

      const email = 'joao@example.com';
      jest.spyOn(keycloakUserService, 'verifyToken').mockResolvedValue(email);
      jest
        .spyOn(keycloakAuthService, 'checkIfAdminTokenStillValid')
        .mockResolvedValue(undefined);
      const error = new Error('Password change failed');
      jest
        .spyOn(keycloakUserService, 'changePassword')
        .mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordData)).rejects.toThrow(
        'Password change failed',
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const logoutData = {
        id: 'user-123',
      };

      jest.spyOn(keycloakAuthService, 'logout').mockResolvedValue(undefined);

      await controller.logout(logoutData);

      expect(keycloakAuthService.logout).toHaveBeenCalledWith(logoutData.id);
    });

    it('should propagate error when logout fails', async () => {
      const logoutData = {
        id: 'user-123',
      };

      const error = new Error('Logout failed');
      jest.spyOn(keycloakAuthService, 'logout').mockRejectedValue(error);

      await expect(controller.logout(logoutData)).rejects.toThrow(
        'Logout failed',
      );
    });
  });

  describe('decorators', () => {
    it('should have the @Controller() decorator', () => {
      const controllerMetadata = Reflect.getMetadata('path', AuthControler);
      expect(controllerMetadata).toBe('account');
    });
  });
});
