import { PartialType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';
import { CreateAccountDTO } from './create.dto';

export class UpdateAccountDTO extends PartialType(CreateAccountDTO) {
  @IsUUID()
  id: string;
}
