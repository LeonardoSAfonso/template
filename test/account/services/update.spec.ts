import { Test, TestingModule } from '@nestjs/testing';
import UpdateAccountService from 'src/account/services/update';
import AccountRepository from 'src/account/repository';
import AppError from 'src/shared/AppError';
import { mockAccountData, mockUpdateAccountDTO } from 'test/mocks/utils';

describe('UpdateAccountService', () => {
  let service: UpdateAccountService;
  let accountRepository: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAccountService,
        {
          provide: AccountRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByIdentification: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UpdateAccountService>(UpdateAccountService);
    accountRepository = module.get<AccountRepository>(AccountRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update an account successfully', async () => {
      const inputData = { ...mockUpdateAccountDTO };
      const existingAccount = { ...mockAccountData };
      const updatedAccount = { ...mockAccountData, ...inputData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest.spyOn(accountRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(null);
      jest.spyOn(accountRepository, 'update').mockResolvedValue(updatedAccount);

      const result = await service.execute(inputData);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        inputData.email,
      );
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(updatedAccount);
    });

    it('should update account without email change', async () => {
      const inputData = { id: 'account-id-123', name: 'João Silva Updated' };
      const existingAccount = { ...mockAccountData };
      const updatedAccount = { ...mockAccountData, ...inputData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest.spyOn(accountRepository, 'update').mockResolvedValue(updatedAccount);

      const result = await service.execute(inputData);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).not.toHaveBeenCalled();
      expect(accountRepository.findByIdentification).not.toHaveBeenCalled();
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(updatedAccount);
    });

    it('should update account with same email (not changed)', async () => {
      const inputData = {
        id: 'account-id-123',
        email: 'joao@teste.com',
        name: 'João Silva Updated',
      };
      const existingAccount = { ...mockAccountData, email: 'joao@teste.com' };
      const updatedAccount = { ...existingAccount, ...inputData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest
        .spyOn(accountRepository, 'findByEmail')
        .mockResolvedValue(existingAccount);
      jest.spyOn(accountRepository, 'update').mockResolvedValue(updatedAccount);

      const result = await service.execute(inputData);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        inputData.email,
      );
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(updatedAccount);
    });

    it('should update account with same identification (not changed)', async () => {
      const inputData = {
        id: 'account-id-123',
        identification: '12345678901',
        name: 'João Silva Updated',
      };
      const existingAccount = {
        ...mockAccountData,
        identification: '12345678901',
      };
      const updatedAccount = { ...existingAccount, ...inputData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(existingAccount);
      jest.spyOn(accountRepository, 'update').mockResolvedValue(updatedAccount);

      const result = await service.execute(inputData);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        inputData.identification,
      );
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(updatedAccount);
    });

    it('should throw error when account does not exist', async () => {
      const inputData = { ...mockUpdateAccountDTO };

      jest.spyOn(accountRepository, 'findById').mockResolvedValue(null);

      await expect(service.execute(inputData)).rejects.toThrow(
        new AppError('ERRO: Nenhum usuário foi encontrado.', 404),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).not.toHaveBeenCalled();
      expect(accountRepository.findByIdentification).not.toHaveBeenCalled();
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when new email already exists for another account', async () => {
      const inputData = { ...mockUpdateAccountDTO, email: 'outro@teste.com' };
      const existingAccount = { ...mockAccountData, email: 'joao@teste.com' };
      const anotherAccount = {
        ...mockAccountData,
        id: 'another-id',
        email: 'outro@teste.com',
      };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest
        .spyOn(accountRepository, 'findByEmail')
        .mockResolvedValue(anotherAccount);

      await expect(service.execute(inputData)).rejects.toThrow(
        new AppError('ERRO: O endereço de e-mail já está sendo utilizado', 409),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        inputData.email,
      );
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when new identification already exists for another account', async () => {
      const inputData = {
        id: 'account-id-123',
        name: 'João Silva Updated',
        identification: '98765432100',
      };
      const existingAccount = {
        ...mockAccountData,
        identification: '12345678901',
      };
      const anotherAccount = {
        ...mockAccountData,
        id: 'another-id',
        identification: '98765432100',
      };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(anotherAccount);

      await expect(service.execute(inputData)).rejects.toThrow(
        new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        inputData.identification,
      );
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when both email and identification already exist for other accounts', async () => {
      const inputData = {
        ...mockUpdateAccountDTO,
        email: 'outro@teste.com',
        identification: '98765432100',
      };
      const existingAccount = {
        ...mockAccountData,
        email: 'joao@teste.com',
        identification: '12345678901',
      };
      const anotherAccount = {
        ...mockAccountData,
        id: 'another-id',
        email: 'outro@teste.com',
      };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest
        .spyOn(accountRepository, 'findByEmail')
        .mockResolvedValue(anotherAccount);

      await expect(service.execute(inputData)).rejects.toThrow(
        new AppError('ERRO: O endereço de e-mail já está sendo utilizado', 409),
      );

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        inputData.email,
      );
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when repository update fails', async () => {
      const inputData = { ...mockUpdateAccountDTO };
      const existingAccount = { ...mockAccountData };
      const updateError = new Error('Database update error');

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest.spyOn(accountRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(accountRepository, 'update').mockRejectedValue(updateError);

      await expect(service.execute(inputData)).rejects.toThrow(updateError);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).toHaveBeenCalledWith(
        inputData.email,
      );
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
    });

    it('should update account with only identification change', async () => {
      const inputData = {
        id: 'account-id-123',
        identification: '98765432100',
      };
      const existingAccount = {
        ...mockAccountData,
        identification: '12345678901',
      };
      const updatedAccount = { ...existingAccount, ...inputData };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockResolvedValue(null);
      jest.spyOn(accountRepository, 'update').mockResolvedValue(updatedAccount);

      const result = await service.execute(inputData);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).not.toHaveBeenCalled();
      expect(accountRepository.findByIdentification).toHaveBeenCalledWith(
        inputData.identification,
      );
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(updatedAccount);
    });

    it('should update only name field without validating email or identification', async () => {
      const inputData = {
        id: 'account-id-123',
        name: 'Nome Completamente Novo',
      };
      const existingAccount = { ...mockAccountData };
      const updatedAccount = { ...existingAccount, name: inputData.name };

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValue(existingAccount);
      jest.spyOn(accountRepository, 'update').mockResolvedValue(updatedAccount);

      const result = await service.execute(inputData);

      expect(accountRepository.findById).toHaveBeenCalledWith(inputData.id);
      expect(accountRepository.findByEmail).not.toHaveBeenCalled();
      expect(accountRepository.findByIdentification).not.toHaveBeenCalled();
      expect(accountRepository.update).toHaveBeenCalledWith(inputData);
      expect(result.name).toBe('Nome Completamente Novo');
    });

    it('should call validations in correct order', async () => {
      const inputData = {
        ...mockUpdateAccountDTO,
        email: 'novo@teste.com',
        identification: '11122233344',
      };
      const callOrder: string[] = [];
      const existingAccount = { ...mockAccountData };

      jest.spyOn(accountRepository, 'findById').mockImplementation(() => {
        callOrder.push('findById');
        return Promise.resolve(existingAccount);
      });
      jest.spyOn(accountRepository, 'findByEmail').mockImplementation(() => {
        callOrder.push('findByEmail');
        return Promise.resolve(null);
      });
      jest
        .spyOn(accountRepository, 'findByIdentification')
        .mockImplementation(() => {
          callOrder.push('findByIdentification');
          return Promise.resolve(null);
        });
      jest.spyOn(accountRepository, 'update').mockImplementation(() => {
        callOrder.push('update');
        return Promise.resolve({ ...existingAccount, ...inputData });
      });

      await service.execute(inputData);

      expect(callOrder).toEqual([
        'findById',
        'findByEmail',
        'findByIdentification',
        'update',
      ]);
    });
  });
});
