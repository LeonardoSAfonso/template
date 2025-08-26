import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakUserService } from 'src/keycloak/keycloak-user.service';
import { UserNotFoundError } from 'src/keycloak/errors/user-not-found.error';
import { UserDTO } from 'src/keycloak/domain/user.dto';
import { mockKeycloakAdminClient } from '../../mocks/utils';

describe('KeycloakUserService', () => {
  let service: KeycloakUserService;
  let adminClient: any;
  let jwtService: JwtService;

  const mockUser: UserDTO = {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
  };

  const mockKeycloakUser = {
    id: 'user-123',
    username: 'john@example.com',
    email: 'john@example.com',
    firstName: 'John',
    enabled: true,
  };

  beforeEach(async () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakUserService,
        {
          provide: KeycloakAdminClient,
          useValue: mockKeycloakAdminClient,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<KeycloakUserService>(KeycloakUserService);
    adminClient = mockKeycloakAdminClient;
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createSpy = jest
        .spyOn(adminClient.users, 'create')
        .mockResolvedValue(mockKeycloakUser);

      const result = await service.create(mockUser);

      expect(createSpy).toHaveBeenCalledWith({
        username: mockUser.email,
        email: mockUser.email,
        firstName: mockUser.name,
        enabled: true,
        credentials: [
          {
            temporary: false,
            type: 'password',
            value: mockUser.password,
          },
        ],
        realmRoles: ['panel'],
      });
      expect(result).toEqual(mockKeycloakUser);
    });

    it('should throw error when creation fails', async () => {
      const error = new Error('Keycloak error');
      jest.spyOn(adminClient.users, 'create').mockRejectedValue(error);

      await expect(service.create(mockUser)).rejects.toThrow('{}');
    });

    it('should throw error with Keycloak details', async () => {
      const keycloakError = { message: 'User already exists', status: 409 };
      jest.spyOn(adminClient.users, 'create').mockRejectedValue(keycloakError);

      await expect(service.create(mockUser)).rejects.toThrow(
        JSON.stringify(keycloakError),
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-123';
      const newPassword = 'new-password';

      const findOneSpy = jest
        .spyOn(adminClient.users, 'findOne')
        .mockResolvedValue(mockKeycloakUser);
      const resetPasswordSpy = jest
        .spyOn(adminClient.users, 'resetPassword')
        .mockResolvedValue(undefined);

      const result = await service.changePassword(userId, newPassword);

      expect(findOneSpy).toHaveBeenCalledWith({ id: userId });
      expect(resetPasswordSpy).toHaveBeenCalledWith({
        id: mockKeycloakUser.id,
        credential: {
          temporary: false,
          type: 'password',
          value: newPassword,
        },
      });
      expect(result).toEqual({ id: mockKeycloakUser.id });
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const userId = 'user-not-found';
      const newPassword = 'new-password';

      jest.spyOn(adminClient.users, 'findOne').mockResolvedValue({});

      await expect(service.changePassword(userId, newPassword)).rejects.toThrow(
        UserNotFoundError,
      );
    });
  });

  describe('activeUserEmail', () => {
    it('should activate user email successfully', async () => {
      const token = 'valid-token';
      const userId = 'user-123';

      const verifyAsyncSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ id: userId });
      const updateSpy = jest
        .spyOn(adminClient.users, 'update')
        .mockResolvedValue(undefined);

      const result = await service.activeUserEmail(token);

      expect(verifyAsyncSpy).toHaveBeenCalledWith(token);
      expect(updateSpy).toHaveBeenCalledWith(
        { id: userId },
        { emailVerified: true },
      );
      expect(result).toBe(true);
    });

    it('should throw error when token verification fails', async () => {
      const token = 'invalid-token';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.activeUserEmail(token)).rejects.toThrow(
        'Invalid token',
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData: Partial<UserDTO> = {
        id: 'user-123',
        name: 'John Smith Updated',
        email: 'john.new@example.com',
      };

      const findOneSpy = jest
        .spyOn(adminClient.users, 'findOne')
        .mockResolvedValue(mockKeycloakUser);
      const updateSpy = jest
        .spyOn(adminClient.users, 'update')
        .mockResolvedValue(undefined);

      const result = await service.update(updateData);

      expect(findOneSpy).toHaveBeenCalledWith({
        id: updateData.id,
      });
      expect(updateSpy).toHaveBeenCalledWith({ id: updateData.id }, updateData);
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      const updateData: Partial<UserDTO> = {
        id: 'user-not-found',
        name: 'User Does Not Exist',
      };

      jest.spyOn(adminClient.users, 'findOne').mockResolvedValue({});

      await expect(service.update(updateData)).rejects.toThrow(
        UserNotFoundError,
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const userId = 'user-123';

      const deleteSpy = jest
        .spyOn(adminClient.users, 'del')
        .mockResolvedValue(undefined);

      await service.remove(userId);

      expect(deleteSpy).toHaveBeenCalledWith({ id: userId });
    });

    it('should propagate error when removal fails', async () => {
      const userId = 'user-123';
      const error = new Error('Delete failed');

      jest.spyOn(adminClient.users, 'del').mockRejectedValue(error);

      await expect(service.remove(userId)).rejects.toThrow('Delete failed');
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return email', async () => {
      const token = 'valid-token';
      const email = 'john@example.com';

      const verifyAsyncSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ email });

      const result = await service.verifyToken(token);

      expect(verifyAsyncSpy).toHaveBeenCalledWith(token);
      expect(result).toBe(email);
    });

    it('should throw error when token verification fails', async () => {
      const token = 'invalid-token';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });
});
