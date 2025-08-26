import { Test, TestingModule } from '@nestjs/testing';
import CreateAccountService from '../../../../src/account/services/create';
import AccountRepository from '../../../../src/account/repository';
import { KeycloakUserService } from '../../../../src/keycloak/keycloak-user.service';
import AppError from '../../../../src/shared/AppError';
import {
  mockAccountData,
  mockCreateAccountDTO,
  mockKeycloakUserService,
  clearAllMocks,
} from '../../../mocks';

describe('CreateAccountService', () => {
  let service: CreateAccountService;
  let accountRepository: AccountRepository;
  let keycloakUserService: KeycloakUserService;

  const mockAccountRepository = {
    findByEmail: jest.fn(),
    findByIdentification: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountService,
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

    service = module.get<CreateAccountService>(CreateAccountService);
    accountRepository = module.get<AccountRepository>(AccountRepository);
    keycloakUserService = module.get<KeycloakUserService>(KeycloakUserService);

    clearAllMocks();
  });

  describe('execute', () => {
    it('should create a new account successfully', async () => {
      jest.spyOn(accountRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(null);
      jest.spyOn(keycloakUserService, 'create').mockResolvedValue({
        id: 'keycloak-user-id',
      });
      jest
        .spyOn(accountRepository, 'create')
        .mockResolvedValue(mockAccountData);

      const accountData = { ...mockCreateAccountDTO };

      const result = await service.execute(accountData);

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(keycloakUserService.create).toHaveBeenCalledWith({
        email: mockCreateAccountDTO.email,
        name: mockCreateAccountDTO.name,
        password: mockCreateAccountDTO.email,
      });
      expect(accountRepository.create).toHaveBeenCalledWith({
        keycloakId: 'keycloak-user-id',
        ...accountData,
      });
      expect(result).toEqual(mockAccountData);
      expect(accountData.password).toBeUndefined();
    });

    it('should throw error when email already exists', async () => {
      jest
        .spyOn(accountRepository, 'findByEmail')
        .mockResolvedValue(mockAccountData);

      await expect(service.execute(mockCreateAccountDTO)).rejects.toThrow(
        new AppError('ERRO: O endereço de e-mail já está sendo utilizado', 409),
      );

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(accountRepository.findByIdentification).not.toHaveBeenCalled();
      expect(keycloakUserService.create).not.toHaveBeenCalled();
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when identification already exists', async () => {
      jest.spyOn(accountRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(mockAccountData);

      await expect(service.execute(mockCreateAccountDTO)).rejects.toThrow(
        new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409),
      );

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(keycloakUserService.create).not.toHaveBeenCalled();
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when Keycloak user creation fails', async () => {
      const keycloakError = new Error('Keycloak creation failed');
      jest.spyOn(accountRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(null);
      jest
        .spyOn(keycloakUserService, 'create')
        .mockRejectedValue(keycloakError);

      await expect(service.execute(mockCreateAccountDTO)).rejects.toThrow(
        keycloakError,
      );

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(keycloakUserService.create).toHaveBeenCalledWith({
        email: mockCreateAccountDTO.email,
        name: mockCreateAccountDTO.name,
        password: mockCreateAccountDTO.email,
      });
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when account creation fails', async () => {
      const accountError = new Error('Account creation failed');
      jest.spyOn(accountRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(null);
      jest.spyOn(keycloakUserService, 'create').mockResolvedValue({
        id: 'keycloak-user-id',
      });
      jest.spyOn(accountRepository, 'create').mockRejectedValue(accountError);

      await expect(service.execute(mockCreateAccountDTO)).rejects.toThrow(
        accountError,
      );

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        mockCreateAccountDTO.email,
      );
      expect(keycloakUserService.create).toHaveBeenCalledWith({
        email: mockCreateAccountDTO.email,
        name: mockCreateAccountDTO.name,
        password: mockCreateAccountDTO.email,
      });
      expect(accountRepository.create).toHaveBeenCalledWith({
        keycloakId: 'keycloak-user-id',
        ...mockCreateAccountDTO,
      });
    });
  });
});
