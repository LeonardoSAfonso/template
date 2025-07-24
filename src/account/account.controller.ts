import { Account } from 'prisma/client';
import CreateAccountService from './services/create';
import DeleteAccountService from './services/delete';
import FindAccountsService from './services/find';
import FindOneAccountService from './services/findOne';
import UpdateAccountService from './services/update';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationParams } from 'src/shared/types/pagination.type';
import { Roles } from 'nest-keycloak-connect';
import { CreateAccountDTO } from './domain/create.dto';
import { UpdateAccountDTO } from './domain/update.dto';

@Roles({ roles: ['admin'] })
@Controller('account')
export default class AccountController {
  constructor(
    private readonly createService: CreateAccountService,
    private readonly findService: FindAccountsService,
    private readonly findOneService: FindOneAccountService,
    private readonly updateService: UpdateAccountService,
    private readonly deleteService: DeleteAccountService,
  ) {}

  @Post()
  async create(@Body() account: CreateAccountDTO) {
    return this.createService.execute(account);
  }

  @Get()
  async find(@Query() query: PaginationParams<Account>) {
    return this.findService.execute(new PaginationParams<Account>(query));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.findOneService.execute(id);
  }

  @Put()
  async update(@Body() account: UpdateAccountDTO) {
    return this.updateService.execute(account);
  }

  @Delete()
  async delete(@Param('id') id: string) {
    return this.deleteService.execute(id);
  }
}
