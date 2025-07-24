import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakSettings {
  public url: string;
  public realm: string;
  public adminUser: string;
  public adminPassword: string;
  public clientID: string;
  public clientSecret: string;
  public requestTimeout: number;

  constructor(config: ConfigService) {
    this.url = config.get<string>('KC_AUTH_SERVER_URL');
    this.realm = config.get<string>('KC_REALM');
    this.adminUser = config.get<string>('KC_ADMIN');
    this.adminPassword = config.get<string>('KC_ADMIN_PASSWORD');
    this.clientID = config.get<string>('KC_CLIENT_ID');
    this.clientSecret = config.get<string>('KC_SECRET');
    this.requestTimeout = config.get<number>('KC_REQUEST_TIMEOUT');
  }
}
