import { Test, TestingModule } from '@nestjs/testing';
import AccountRepository from 'src/account/repository';
import { PrismaService } from 'src/orm/prisma.service';
import { PaginationParams } from 'src/shared/types/pagination.type';
import {
  mockPrismaService,
  mockAccountData,
  mockCreateAccountDTO,
  mockPaginationParams,
  mockUpdateAccountDTO,
} from 'test/mocks/utils';

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<AccountRepository>(AccountRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new account', async () => {
      jest
        .spyOn(prismaService.account, 'create')
        .mockResolvedValue(mockAccountData);

      const result = await repository.create(mockCreateAccountDTO);

      expect(prismaService.account.create).toHaveBeenCalledWith({
        data: mockCreateAccountDTO,
      });
      expect(result).toEqual(mockAccountData);
    });
  });

  describe('find', () => {
    it('should return accounts with pagination', async () => {
      const mockAccounts = [mockAccountData];
      const mockCount = 1;

      jest.spyOn(prismaService.account, 'count').mockResolvedValue(mockCount);
      jest
        .spyOn(prismaService.account, 'findMany')
        .mockResolvedValue(mockAccounts);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        accounts: mockAccounts,
      });
      expect(prismaService.account.count).toHaveBeenCalled();
      expect(prismaService.account.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return an account by id', async () => {
      jest
        .spyOn(prismaService.account, 'findFirst')
        .mockResolvedValue(mockAccountData);

      const result = await repository.findById('account-id-123');

      expect(prismaService.account.findFirst).toHaveBeenCalledWith({
        where: { id: 'account-id-123' },
      });
      expect(result).toEqual(mockAccountData);
    });

    it('should return null if account not found', async () => {
      jest.spyOn(prismaService.account, 'findFirst').mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findForBI', () => {
    it('should return an account for BI purposes', async () => {
      jest
        .spyOn(prismaService.account, 'findFirst')
        .mockResolvedValue(mockAccountData);

      const result = await repository.findForBI('account-id-123');

      expect(prismaService.account.findFirst).toHaveBeenCalledWith({
        where: { id: 'account-id-123' },
      });
      expect(result).toEqual(mockAccountData);
    });
  });

  describe('findByEmail', () => {
    it('should return an account by email', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccountData);

      const result = await repository.findByEmail('joao@teste.com');

      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: 'joao@teste.com' },
      });
      expect(result).toEqual(mockAccountData);
    });

    it('should return null if email not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@teste.com');

      expect(result).toBeNull();
    });
  });

  describe('findByIdentification', () => {
    it('should return an account by identification', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccountData);

      const result = await repository.findByIdentification('12345678901');

      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { identification: '12345678901' },
      });
      expect(result).toEqual(mockAccountData);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      const updatedAccount = { ...mockAccountData, ...mockUpdateAccountDTO };
      jest
        .spyOn(prismaService.account, 'update')
        .mockResolvedValue(updatedAccount);

      const result = await repository.update(mockUpdateAccountDTO);

      expect(prismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'account-id-123' },
        data: mockUpdateAccountDTO,
      });
      expect(result).toEqual(updatedAccount);
    });
  });

  describe('delete', () => {
    it('should delete an account', async () => {
      jest
        .spyOn(prismaService.account, 'delete')
        .mockResolvedValue(mockAccountData);

      const result = await repository.delete('account-id-123');

      expect(prismaService.account.delete).toHaveBeenCalledWith({
        where: { id: 'account-id-123' },
      });
      expect(result).toEqual(mockAccountData);
    });
  });
});
