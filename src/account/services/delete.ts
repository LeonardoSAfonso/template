import { Account } from 'prisma/client';

import AccountRepository from '../repository';
import AppError from 'src/shared/AppError';
import { Injectable } from '@nestjs/common';
import { KeycloakUserService } from 'src/keycloak/keycloak-user.service';

@Injectable()
export default class DeleteAccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly keycloakUserService: KeycloakUserService,
  ) {}

  public async execute(id: string): Promise<Account> {
    const checkAccountExist = await this.repository.findById(id);

    if (!checkAccountExist) {
      throw new AppError('ERRO: Nenhum usuário foi encontrada.', 404);
    }

    await this.keycloakUserService.remove(checkAccountExist.keycloakId);

    return this.repository.delete(id);
  }
}
