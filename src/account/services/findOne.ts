import AccountRepository from '../repository';
import AppError from 'src/shared/AppError';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FindOneAccountService {
  constructor(private repository: AccountRepository) {}

  public async execute(id: string) {
    const account = await this.repository.findById(id);

    if (!account) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    return account;
  }
}
