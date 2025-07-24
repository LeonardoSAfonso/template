import { Module } from '@nestjs/common';
import { KeycloakModule } from './keycloak/keycloak.module';
import { ConfigModule } from '@nestjs/config';
import { OrmModule } from './orm/orm.module';
import { AccountModule } from './account/account.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrmModule,
    AccountModule,
    KeycloakModule.forRoot(),
  ],
})
export class AppModule {}
