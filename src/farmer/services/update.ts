import { Account } from 'prisma/client';
import AccountRepository from '../repository';
import AppError from 'src/shared/AppError';
import { Injectable } from '@nestjs/common';
import { UpdateAccountDTO } from '../domain/update.dto';

@Injectable()
export default class UpdateAccountService {
  constructor(private repository: AccountRepository) {
    this.repository = repository;
  }

  public async execute(accountData: UpdateAccountDTO): Promise<Account> {
    const account = await this.repository.findById(accountData.id);

    if (!account) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (accountData.email) {
      const checkFarmEmailExist = await this.repository.findByEmail(
        accountData.email,
      );

      if (checkFarmEmailExist && accountData.email !== account.email) {
        throw new AppError(
          'ERRO: O endereço de e-mail já está sendo utilizado',
          409,
        );
      }
    }

    if (accountData.identification) {
      const checkFarmEmailExist = await this.repository.findByEmail(
        accountData.identification,
      );

      if (
        checkFarmEmailExist &&
        accountData.identification !== account.identification
      ) {
        throw new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409);
      }
    }

    const updatedAccount = await this.repository.update(accountData);

    return updatedAccount;
  }
}
