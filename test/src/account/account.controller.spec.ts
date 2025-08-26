import { Test, TestingModule } from '@nestjs/testing';
import AccountController from '../../../src/account/account.controller';
import CreateAccountService from '../../../src/account/services/create';
import DeleteAccountService from '../../../src/account/services/delete';
import FindAccountsService from '../../../src/account/services/find';
import FindOneAccountService from '../../../src/account/services/findOne';
import UpdateAccountService from '../../../src/account/services/update';
import { PaginationParams } from '../../../src/shared/types/pagination.type';

import { afterEach } from 'node:test';
import {
  mockAccountData,
  mockCreateAccountDTO,
  mockPaginationParams,
  mockUpdateAccountDTO,
} from 'test/mocks/utils';

describe('AccountController', () => {
  let controller: AccountController;
  let createService: CreateAccountService;
  let findService: FindAccountsService;
  let findOneService: FindOneAccountService;
  let updateService: UpdateAccountService;
  let deleteService: DeleteAccountService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: CreateAccountService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAccountsService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindOneAccountService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateAccountService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteAccountService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    createService = module.get<CreateAccountService>(CreateAccountService);
    findService = module.get<FindAccountsService>(FindAccountsService);
    findOneService = module.get<FindOneAccountService>(FindOneAccountService);
    updateService = module.get<UpdateAccountService>(UpdateAccountService);
    deleteService = module.get<DeleteAccountService>(DeleteAccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createSpy = jest
        .spyOn(createService, 'execute')
        .mockResolvedValue(mockAccountData);

      const result = await controller.create(mockCreateAccountDTO);

      expect(createSpy).toHaveBeenCalledWith(mockCreateAccountDTO);
      expect(result).toEqual(mockAccountData);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      const createSpy = jest
        .spyOn(createService, 'execute')
        .mockRejectedValue(error);

      await expect(controller.create(mockCreateAccountDTO)).rejects.toThrow(
        error,
      );
      expect(createSpy).toHaveBeenCalledWith(mockCreateAccountDTO);
    });
  });

  describe('find', () => {
    it('should return paginated accounts', async () => {
      const mockResult: [(typeof mockAccountData)[], number] = [
        [mockAccountData],
        1,
      ];
      const findSpy = jest
        .spyOn(findService, 'execute')
        .mockResolvedValue(mockResult);

      const result = await controller.find(mockPaginationParams);

      expect(findSpy).toHaveBeenCalledWith(expect.any(PaginationParams));
      expect(result).toEqual(mockResult);
    });

    it('should handle find errors', async () => {
      const error = new Error('Find failed');
      const findSpy = jest
        .spyOn(findService, 'execute')
        .mockRejectedValue(error);

      await expect(controller.find(mockPaginationParams)).rejects.toThrow(
        error,
      );
      expect(findSpy).toHaveBeenCalledWith(expect.any(PaginationParams));
    });
  });

  describe('findOne', () => {
    it('should return a single account', async () => {
      const accountId = 'account-id-123';
      const findOneSpy = jest
        .spyOn(findOneService, 'execute')
        .mockResolvedValue(mockAccountData);

      const result = await controller.findOne(accountId);

      expect(findOneSpy).toHaveBeenCalledWith(accountId);
      expect(result).toEqual(mockAccountData);
    });

    it('should handle findOne errors', async () => {
      const accountId = 'non-existent-id';
      const error = new Error('Account not found');
      const findOneSpy = jest
        .spyOn(findOneService, 'execute')
        .mockRejectedValue(error);

      await expect(controller.findOne(accountId)).rejects.toThrow(error);
      expect(findOneSpy).toHaveBeenCalledWith(accountId);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      const updatedAccount = { ...mockAccountData, ...mockUpdateAccountDTO };
      const updateSpy = jest
        .spyOn(updateService, 'execute')
        .mockResolvedValue(updatedAccount);

      const result = await controller.update(mockUpdateAccountDTO);

      expect(updateSpy).toHaveBeenCalledWith(mockUpdateAccountDTO);
      expect(result).toEqual(updatedAccount);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      const updateSpy = jest
        .spyOn(updateService, 'execute')
        .mockRejectedValue(error);

      await expect(controller.update(mockUpdateAccountDTO)).rejects.toThrow(
        error,
      );
      expect(updateSpy).toHaveBeenCalledWith(mockUpdateAccountDTO);
    });
  });

  describe('delete', () => {
    it('should delete an account', async () => {
      const accountId = 'account-id-123';
      const deleteSpy = jest
        .spyOn(deleteService, 'execute')
        .mockResolvedValue(mockAccountData);

      const result = await controller.delete(accountId);

      expect(deleteSpy).toHaveBeenCalledWith(accountId);
      expect(result).toEqual(mockAccountData);
    });

    it('should handle delete errors', async () => {
      const accountId = 'account-id-123';
      const error = new Error('Delete failed');
      const deleteSpy = jest
        .spyOn(deleteService, 'execute')
        .mockRejectedValue(error);

      await expect(controller.delete(accountId)).rejects.toThrow(error);
      expect(deleteSpy).toHaveBeenCalledWith(accountId);
    });
  });
});
