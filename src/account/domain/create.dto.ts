import { IsEmail, IsString, IsStrongPassword, Validate } from 'class-validator';
import { IsCPFOrCNPJ } from '../utils/cpfCnpj.validator';

export class CreateAccountDTO {
  @IsString()
  name: string;

  @IsString()
  @Validate(IsCPFOrCNPJ)
  identification: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  @IsEmail()
  email: string;

  keycloakId: string;
}
