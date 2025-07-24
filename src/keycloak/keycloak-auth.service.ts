import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { Inject, Injectable } from '@nestjs/common';
import { BaseClient } from 'openid-client';
import { ISSUER_CLIENT } from './constants';
import jwt_decode from 'jwt-decode';
import { JwtService } from '@nestjs/jwt';
import { Token } from './domain/token.dto';

@Injectable()
export class KeycloakAuthService {
  constructor(
    private readonly admin: KeycloakAdminClient,
    @Inject(ISSUER_CLIENT)
    private readonly issuer: BaseClient,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<Token> {
    const scope = 'openid email profile';
    return this.loginWithScope(username, password, scope);
  }

  async loginWithScope(
    username: string,
    password: string,
    scope: string,
  ): Promise<Token> {
    const tokenSet = await this.issuer.grant({
      scope: scope,
      grant_type: 'password',
      username: username,
      password: password,
    });

    return {
      accessToken: tokenSet.access_token,
      expiresIn: tokenSet.expires_in,
      idToken: tokenSet.id_token,
      refreshToken: tokenSet.refresh_token,
      tokenType: tokenSet.token_type,
      sessionState: tokenSet.session_state,
      scope: tokenSet.scope,
    };
  }

  async refreshToken(token: string): Promise<Token> {
    const tokenSet = await this.issuer.refresh(token);

    return {
      accessToken: tokenSet.access_token,
      expiresIn: tokenSet.expires_in,
      idToken: tokenSet.id_token,
      refreshToken: tokenSet.refresh_token,
      tokenType: tokenSet.token_type,
      sessionState: tokenSet.session_state,
      scope: tokenSet.scope,
    };
  }

  async loginLongLivedToken(
    username: string,
    password: string,
  ): Promise<Token> {
    const scope = 'openid email profile offline_access';
    return this.loginWithScope(username, password, scope);
  }

  async logout(id: string): Promise<void> {
    await this.checkIfAdminTokenStillValid();
    await this.admin.users.logout({ id });
  }

  async resetPasswordToken(id: string): Promise<string> {
    return this.jwtService.sign({
      id,
      expireIn: new Date(),
    });
  }

  async checkIfAdminTokenStillValid(): Promise<void | null> {
    const expiresIn = await jwt_decode(this.admin.accessToken)['exp'];
    const currentUnixTimestamp = new Date().getTime();

    if (currentUnixTimestamp < expiresIn) return;

    const newToken = await this.issuer.refresh(this.admin.refreshToken);
    return this.admin.setAccessToken(newToken.access_token);
  }
}
