import { IsString } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  token: string;

  @IsString()
  newPassword: string;
}
