import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
import { BrandPacksService } from './services/brand-packs.service.js';
import { BrandPackResolutionService } from './services/brand-pack-resolution.service.js';
import { CreateBrandPackDto } from './dto/create-brand-pack.dto.js';
import {
  UpdateBrandPackDto,
  CloneBrandPackDto,
  PublishBrandPackDto,
} from './dto/update-brand-pack.dto.js';
import type { PackStatus } from './schemas/brand-pack.schema.js';

@Controller('brand-packs')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class BrandPacksController {
  constructor(
    private readonly packsService: BrandPacksService,
    private readonly resolutionService: BrandPackResolutionService,
  ) {}

  @Get()
  @RequirePermissions('brand_packs.view')
  async findAll(
    @Query('brandId') brandId?: string,
    @Query('brandCode') brandCode?: string,
    @Query('status') status?: PackStatus,
    @Query('site') site?: string,
  ) {
    const packs = await this.packsService.findAll({
      brandId,
      brandCode,
      status,
      site,
    });
    return {
      success: true,
      data: packs,
    };
  }

  @Get('resolve')
  @RequirePermissions('brand_packs.view')
  async resolve(
    @Query('brandCode') brandCode?: string,
    @Query('siteCode') siteCode?: string,
  ) {
    if (!brandCode) {
      throw new BadRequestException('Query parameter "brandCode" is required for resolution.');
    }
    const resolved = await this.resolutionService.resolveBrandPack(brandCode, siteCode);
    return {
      success: true,
      data: resolved,
    };
  }

  @Get('brand/:brandId/versions')
  @RequirePermissions('brand_packs.view')
  async findVersionsForBrand(@Param('brandId') brandId: string) {
    const versions = await this.packsService.findVersionsForBrand(brandId);
    return {
      success: true,
      data: versions,
    };
  }

  @Get(':id')
  @RequirePermissions('brand_packs.view')
  async findOne(@Param('id') id: string) {
    const pack = await this.packsService.findById(id);
    return {
      success: true,
      data: pack,
    };
  }

  @Post()
  @RequirePermissions('brand_packs.create')
  async create(
    @Body() createBrandPackDto: CreateBrandPackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const pack = await this.packsService.createDraft(
      createBrandPackDto,
      user?.email || 'admin@booran.com',
    );
    return {
      success: true,
      data: pack,
      message: 'Draft Brand Pack created successfully.',
    };
  }

  @Patch(':id')
  @RequirePermissions('brand_packs.update')
  async update(
    @Param('id') id: string,
    @Body() updateBrandPackDto: UpdateBrandPackDto,
  ) {
    const pack = await this.packsService.updateDraft(id, updateBrandPackDto);
    return {
      success: true,
      data: pack,
      message: 'Draft Brand Pack updated successfully.',
    };
  }

  @Post(':id/clone')
  @RequirePermissions('brand_packs.create')
  async clone(
    @Param('id') id: string,
    @Body() cloneBrandPackDto: CloneBrandPackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const pack = await this.packsService.clone(
      id,
      cloneBrandPackDto,
      user?.email || 'admin@booran.com',
    );
    return {
      success: true,
      data: pack,
      message: `Brand Pack cloned to new draft version "${pack.version}".`,
    };
  }

  @Post(':id/validate')
  @RequirePermissions('brand_packs.view')
  async validate(@Param('id') id: string) {
    const result = await this.packsService.validateById(id);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/publish')
  @RequirePermissions('brand_packs.publish')
  async publish(
    @Param('id') id: string,
    @Body() publishBrandPackDto: PublishBrandPackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const pack = await this.packsService.publish(
      id,
      user?.email || 'admin@booran.com',
      publishBrandPackDto,
    );
    return {
      success: true,
      data: pack,
      message: `Brand Pack "${pack.version}" published successfully.`,
    };
  }

  @Post(':id/archive')
  @RequirePermissions('brand_packs.archive')
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const pack = await this.packsService.archive(
      id,
      user?.email || 'admin@booran.com',
    );
    return {
      success: true,
      data: pack,
      message: `Brand Pack "${pack.version}" archived.`,
    };
  }
}
