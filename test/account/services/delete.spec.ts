import { Test, TestingModule } from '@nestjs/testing';
import DeleteAccountService from 'src/account/services/delete';
import AccountRepository from 'src/account/repository';
import { KeycloakUserService } from 'src/keycloak/keycloak-user.service';
import AppError from 'src/shared/AppError';
import {
  mockAccountData,
  mockKeycloakUserService,
  clearAllMocks,
} from 'test/mocks/utils';

describe('DeleteAccountService', () => {
  let service: DeleteAccountService;
  let accountRepository: AccountRepository;
  let keycloakUserService: KeycloakUserService;

  const mockAccountRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccountService,
        {
          provide: AccountRepository,
          useValue: mockAccountRepository,
        },
        {
          provide: KeycloakUserService,
          useValue: mockKeycloakUserService,
        },
      ],
    }).compile();

    service = module.get<DeleteAccountService>(DeleteAccountService);
    accountRepository = module.get<AccountRepository>(AccountRepository);
    keycloakUserService = module.get<KeycloakUserService>(KeycloakUserService);

    clearAllMocks();
  });

  describe('execute', () => {
    it('should delete an account successfully', async () => {
      const inputId = 'account-id-123';
      const expectedAccount = { ...mockAccountData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(mockAccountData);
      jest.spyOn(keycloakUserService, 'remove').mockResolvedValue(undefined);
      jest
        .spyOn(accountRepository, 'delete')
        .mockResolvedValue(expectedAccount);

      const result = await service.execute(inputId);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
      expect(keycloakUserService.remove).toHaveBeenCalledWith(
        mockAccountData.keycloakId,
      );
      expect(accountRepository.delete).toHaveBeenCalledWith(inputId);
      expect(result).toEqual(expectedAccount);
    });

    it('should throw error when account does not exist', async () => {
      const inputId = 'non-existent-id';

      jest.spyOn(accountRepository, 'findById').mockResolvedValue(null);

      await expect(service.execute(inputId)).rejects.toThrow(
        new AppError('ERRO: Nenhum usuário foi encontrada.', 404),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
      expect(keycloakUserService.remove).not.toHaveBeenCalled();
      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when Keycloak user removal fails', async () => {
      const inputId = 'account-id-123';
      const keycloakError = new Error('Keycloak removal failed');

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(mockAccountData);
      jest
        .spyOn(keycloakUserService, 'remove')
        .mockRejectedValue(keycloakError);

      await expect(service.execute(inputId)).rejects.toThrow(keycloakError);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
      expect(keycloakUserService.remove).toHaveBeenCalledWith(
        mockAccountData.keycloakId,
      );
      expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when account deletion fails', async () => {
      const inputId = 'account-id-123';
      const accountError = new Error('Account deletion failed');

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(mockAccountData);
      jest.spyOn(keycloakUserService, 'remove').mockResolvedValue(undefined);
      jest.spyOn(accountRepository, 'delete').mockRejectedValue(accountError);

      await expect(service.execute(inputId)).rejects.toThrow(accountError);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
      expect(keycloakUserService.remove).toHaveBeenCalledWith(
        mockAccountData.keycloakId,
      );
      expect(accountRepository.delete).toHaveBeenCalledWith(inputId);
    });

    it('should call services in correct order', async () => {
      const inputId = 'account-id-123';
      const callOrder: string[] = [];

      jest.spyOn(accountRepository, 'findById').mockImplementation(() => {
        callOrder.push('findById');
        return Promise.resolve(mockAccountData);
      });
      jest.spyOn(keycloakUserService, 'remove').mockImplementation(() => {
        callOrder.push('keycloakRemove');
        return Promise.resolve(undefined);
      });
      jest.spyOn(accountRepository, 'delete').mockImplementation(() => {
        callOrder.push('accountDelete');
        return Promise.resolve(mockAccountData);
      });

      await service.execute(inputId);

      expect(callOrder).toEqual([
        'findById',
        'keycloakRemove',
        'accountDelete',
      ]);
    });

    it('should pass correct keycloakId to Keycloak service', async () => {
      const inputId = 'account-id-123';
      const accountWithSpecificKeycloakId = {
        ...mockAccountData,
        keycloakId: 'specific-keycloak-id-xyz',
      };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(accountWithSpecificKeycloakId);
      jest.spyOn(keycloakUserService, 'remove').mockResolvedValue(undefined);
      jest
        .spyOn(accountRepository, 'delete')
        .mockResolvedValue(accountWithSpecificKeycloakId);

      await service.execute(inputId);

      expect(keycloakUserService.remove).toHaveBeenCalledWith(
        'specific-keycloak-id-xyz',
      );
    });
  });
});
