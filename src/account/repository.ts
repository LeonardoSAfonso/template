import { PrismaService } from 'src/orm/prisma.service';
import { Account } from 'prisma/client';
import { PaginationParams } from 'src/shared/types/pagination.type';
import { CustomQuery } from 'src/shared/types/customQuery.type';
import { Injectable } from '@nestjs/common';
import { CreateAccountDTO } from './domain/create.dto';
import { UpdateAccountDTO } from './domain/update.dto';

@Injectable()
export default class AccountRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateAccountDTO) {
    return this.prismaService.account.create({ data });
  }

  public async find(params: PaginationParams<Account>) {
    const query = CustomQuery.fromPagination(params);

    const elements = await this.prismaService.account.count({
      ...query,
    });

    const accounts = await this.prismaService.account.findMany({
      ...query,
    });

    return { elements, accounts };
  }

  public async findById(id: string) {
    const Account = await this.prismaService.account.findFirst({
      where: { id },
    });

    return Account;
  }

  public async findForBI(id: string) {
    const Account = await this.prismaService.account.findFirst({
      where: { id },
    });

    return Account;
  }

  async findByEmail(email: string) {
    return this.prismaService.account.findUnique({
      where: { email },
    });
  }

  async findByIdentification(identification: string) {
    return this.prismaService.account.findUnique({
      where: { identification },
    });
  }

  public async update(data: UpdateAccountDTO) {
    const updatedAccount = await this.prismaService.account.update({
      where: { id: data.id },
      data,
    });

    return updatedAccount;
  }

  async delete(id: string) {
    return this.prismaService.account.delete({ where: { id } });
  }
}
