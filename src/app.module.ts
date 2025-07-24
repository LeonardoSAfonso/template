import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { FarmModule } from './farm/farm.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { ConfigModule } from '@nestjs/config';
import { OrmModule } from './orm/orm.module';
import { HarvestModule } from './harvest/harvest.module';
import { CultivarModule } from './cultivar/cultivar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrmModule,
    AccountModule,
    FarmModule,
    HarvestModule,
    CultivarModule,
    KeycloakModule.forRoot(),
  ],
})
export class AppModule {}
