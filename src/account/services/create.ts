import AppError from 'src/shared/AppError';
import AccountRepository from '../repository';
import { Account } from 'prisma/client';
import { Injectable } from '@nestjs/common';
import { KeycloakUserService } from 'src/keycloak/keycloak-user.service';
import { CreateAccountDTO } from '../domain/create.dto';

@Injectable()
export default class CreateAccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly keycloakUserService: KeycloakUserService,
  ) {}

  public async execute(accountData: CreateAccountDTO): Promise<Account> {
    const checkAccountEmailExist = await this.repository.findByEmail(
      accountData.email,
    );

    if (checkAccountEmailExist) {
      throw new AppError(
        'ERRO: O endereço de e-mail já está sendo utilizado',
        409,
      );
    }

    const checkAccountIdentificationExist =
      await this.repository.findByIdentification(accountData.identification);

    if (checkAccountIdentificationExist) {
      throw new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409);
    }

    const kcUser = await this.keycloakUserService.create({
      email: accountData.email,
      name: accountData.name,
      password: accountData.email,
    });

    delete accountData.password;

    return this.repository.create({
      keycloakId: kcUser.id,
      ...accountData,
    });
  }
}
