import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BrandsModule } from './modules/brands/brands.module.js';
import { SitesModule } from './modules/sites/sites.module.js';
import { BrandPacksModule } from './modules/brand-packs/brand-packs.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot(),
    UsersModule,
    AuthModule,
    BrandsModule,
    SitesModule,
    BrandPacksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
