import { IsString } from 'class-validator';

export class LogoutDTO {
  @IsString()
  id: string;
}
