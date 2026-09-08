import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandPack, BrandPackSchema } from './schemas/brand-pack.schema.js';
import { BrandPacksService } from './services/brand-packs.service.js';
import { BrandPackValidator } from './services/brand-pack-validator.service.js';
import { BrandPackResolutionService } from './services/brand-pack-resolution.service.js';
import { BrandPacksController } from './brand-packs.controller.js';
import { BrandsModule } from '../brands/brands.module.js';
import { SitesModule } from '../sites/sites.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BrandPack.name, schema: BrandPackSchema }]),
    BrandsModule,
    SitesModule,
    AuthModule,
  ],
  controllers: [BrandPacksController],
  providers: [
    BrandPacksService,
    BrandPackValidator,
    BrandPackResolutionService,
  ],
  exports: [
    BrandPacksService,
    BrandPackResolutionService,
    BrandPackValidator,
  ],
})
export class BrandPacksModule {}
