import { Controller, Post, Body } from '@nestjs/common';
import { ChangePasswordDTO } from './domain/changePassword.dto';
import { LoginDTO } from './domain/login.dto';
import { LogoutDTO } from './domain/logout.dto';
import { RefreshTokenDTO } from './domain/refreshToken.dto';
import { ResetPasswordDTO } from './domain/resetPassword.dto';
import { Token } from './domain/token.dto';
import { KeycloakAuthService } from './keycloak-auth.service';
import { KeycloakUserService } from './keycloak-user.service';
import { Public } from 'nest-keycloak-connect';

@Public()
@Controller('account')
export class AuthControler {
  constructor(
    private readonly keycloakUserService: KeycloakUserService,
    private readonly keycloakAuthService: KeycloakAuthService,
  ) {}

  @Post('login')
  login(@Body() { username, password }: LoginDTO): Promise<Token> {
    return this.keycloakAuthService.login(username, password);
  }

  @Post('refresh-token')
  refreshToken(@Body() { token }: RefreshTokenDTO): Promise<Token> {
    return this.keycloakAuthService.refreshToken(token);
  }

  @Post('logout')
  async logout(@Body() { id }: LogoutDTO) {
    await this.keycloakAuthService.logout(id);
  }

  @Post('change-password')
  async changePassword(@Body() { email, newPassword }: ChangePasswordDTO) {
    await this.keycloakAuthService.checkIfAdminTokenStillValid();
    return await this.keycloakUserService.changePassword(email, newPassword);
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, newPassword }: ResetPasswordDTO) {
    const email = await this.keycloakUserService.verifyToken(token);
    await this.keycloakAuthService.checkIfAdminTokenStillValid();
    return await this.keycloakUserService.changePassword(email, newPassword);
  }
}
