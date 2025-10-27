import { Test, TestingModule } from '@nestjs/testing';
import FindOneAccountService from 'src/account/services/findOne';
import AccountRepository from 'src/account/repository';
import AppError from 'src/shared/AppError';
import { mockAccountData, clearAllMocks } from 'test/mocks/utils';

describe('FindOneAccountService', () => {
  let service: FindOneAccountService;
  let accountRepository: AccountRepository;

  const mockAccountRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneAccountService,
        {
          provide: AccountRepository,
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<FindOneAccountService>(FindOneAccountService);
    accountRepository = module.get<AccountRepository>(AccountRepository);

    clearAllMocks();
  });

  describe('execute', () => {
    it('should find an account by id successfully', async () => {
      const inputId = 'account-id-123';
      const expectedAccount = { ...mockAccountData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(expectedAccount);

      const result = await service.execute(inputId);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
      expect(accountRepository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedAccount);
    });

    it('should throw error when account does not exist', async () => {
      const inputId = 'non-existent-id';

      jest.spyOn(accountRepository, 'findById').mockResolvedValue(null);

      await expect(service.execute(inputId)).rejects.toThrow(
        new AppError('ERRO: Nenhum usuário foi encontrado.', 404),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
      expect(accountRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw error when account is undefined', async () => {
      const inputId = 'undefined-id';

      jest.spyOn(accountRepository, 'findById').mockResolvedValue(undefined);

      await expect(service.execute(inputId)).rejects.toThrow(
        new AppError('ERRO: Nenhum usuário foi encontrado.', 404),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
    });

    it('should throw error when repository throws an error', async () => {
      const inputId = 'account-id-123';
      const repositoryError = new Error('Database connection error');

      jest
        .spyOn(accountRepository, 'findById')
        .mockRejectedValue(repositoryError);

      await expect(service.execute(inputId)).rejects.toThrow(repositoryError);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputId);
    });

    it('should return account with all properties', async () => {
      const inputId = 'account-id-123';
      const fullAccountData = {
        ...mockAccountData,
        first_access: true,
        email_checked: true,
      };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(fullAccountData);

      const result = await service.execute(inputId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('identification');
      expect(result).toHaveProperty('keycloakId');
      expect(result).toHaveProperty('first_access');
      expect(result).toHaveProperty('email_checked');
    });
  });
});
