import { Account } from 'prisma/client';
import AccountRepository from '../repository';
import { PaginationParams } from 'src/shared/types/pagination.type';
import getTotalPage from 'src/shared/utils/totalPage';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FindAccountsService {
  constructor(private repository: AccountRepository) {}

  public async execute(
    params: PaginationParams<Account>,
  ): Promise<[Account[], number]> {
    const { accounts, elements } = await this.repository.find(params);

    if (!accounts?.length) {
      return [[], 0];
    }

    return [accounts, getTotalPage(elements, params.limit)];
  }
}
