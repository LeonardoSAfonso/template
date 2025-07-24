import { Module } from '@nestjs/common';
import AccountController from './account.controller';
import CreateAccountService from './services/create';
import FindAccountsService from './services/find';
import FindOneAccountService from './services/findOne';
import UpdateAccountService from './services/update';
import DeleteAccountService from './services/delete';
import AccountRepository from './repository';

@Module({
  controllers: [AccountController],
  providers: [
    AccountRepository,
    CreateAccountService,
    FindAccountsService,
    FindOneAccountService,
    UpdateAccountService,
    DeleteAccountService,
  ],
})
export class AccountModule {}
