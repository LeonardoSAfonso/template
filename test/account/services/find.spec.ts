import { Test, TestingModule } from '@nestjs/testing';
import FindAccountsService from 'src/account/services/find';
import AccountRepository from 'src/account/repository';
import {
  mockAccountData,
  mockPaginationParams,
  clearAllMocks,
} from 'test/mocks/utils';

jest.mock('src/shared/utils/totalPage', () => ({
  default: jest.fn((elements: number, limit: number) => {
    if (!limit) {
      return 0;
    }
    return elements % limit === 0
      ? elements / limit
      : parseInt(`${elements / limit}`, 10) + 1;
  }),
}));

describe('FindAccountsService', () => {
  let service: FindAccountsService;
  let accountRepository: AccountRepository;

  const mockAccountRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAccountsService,
        {
          provide: AccountRepository,
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<FindAccountsService>(FindAccountsService);
    accountRepository = module.get<AccountRepository>(AccountRepository);

    clearAllMocks();
  });

  describe('execute', () => {
    it('should find accounts successfully and return accounts with total pages', async () => {
      const inputParams = { ...mockPaginationParams };
      const mockAccounts = [mockAccountData];
      const mockElements = 25;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result).toEqual([mockAccounts, 3]);
      expect(result[0]).toEqual(mockAccounts);
      expect(result[1]).toBe(3);
    });

    it('should return empty array and 0 when no accounts are found', async () => {
      const inputParams = { ...mockPaginationParams };

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: [],
        elements: 0,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result).toEqual([[], 0]);
      expect(result[0]).toEqual([]);
      expect(result[1]).toBe(0);
    });

    it('should return empty array and 0 when accounts is null', async () => {
      const inputParams = { ...mockPaginationParams };

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: null,
        elements: 0,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result).toEqual([[], 0]);
    });

    it('should return empty array and 0 when accounts is undefined', async () => {
      const inputParams = { ...mockPaginationParams };

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: undefined,
        elements: 0,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result).toEqual([[], 0]);
    });

    it('should calculate total pages correctly when elements divide evenly by limit', async () => {
      const inputParams = { ...mockPaginationParams, limit: 10 };
      const mockAccounts = [mockAccountData];
      const mockElements = 30;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result[0]).toEqual(mockAccounts);
      expect(result[1]).toBe(3);
    });

    it('should calculate total pages correctly when elements do not divide evenly by limit', async () => {
      const inputParams = { ...mockPaginationParams, limit: 10 };
      const mockAccounts = [mockAccountData];
      const mockElements = 35;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result[0]).toEqual(mockAccounts);
      expect(result[1]).toBe(4);
    });

    it('should return 0 pages when limit is 0', async () => {
      const inputParams = { ...mockPaginationParams, limit: 0 };
      const mockAccounts = [mockAccountData];
      const mockElements = 10;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result[0]).toEqual(mockAccounts);
      expect(result[1]).toBe(0);
    });

    it('should handle multiple accounts returned', async () => {
      const inputParams = { ...mockPaginationParams };
      const mockAccounts = [
        mockAccountData,
        { ...mockAccountData, id: 'account-id-456', email: 'outro@teste.com' },
        { ...mockAccountData, id: 'account-id-789', email: 'mais@teste.com' },
      ];
      const mockElements = 50;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      const result = await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith(inputParams);
      expect(result[0]).toHaveLength(3);
      expect(result[0]).toEqual(mockAccounts);
      expect(result[1]).toBe(5);
    });

    it('should respect pagination parameters', async () => {
      const inputParams = {
        ...mockPaginationParams,
        limit: 20,
        offset: 40,
        orderBy: 'email' as const,
        order: 'desc' as const,
      };
      const mockAccounts = [mockAccountData];
      const mockElements = 100;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      await service.execute(inputParams);

      expect(accountRepository.find).toHaveBeenCalledWith({
        limit: 20,
        offset: 40,
        orderBy: 'email',
        order: 'desc',
      });
    });

    it('should handle single account result', async () => {
      const inputParams = { ...mockPaginationParams };
      const mockAccounts = [mockAccountData];
      const mockElements = 1;

      jest.spyOn(accountRepository, 'find').mockResolvedValue({
        accounts: mockAccounts,
        elements: mockElements,
      });

      const result = await service.execute(inputParams);

      expect(result[0]).toHaveLength(1);
      expect(result[1]).toBe(1);
    });
  });
});
