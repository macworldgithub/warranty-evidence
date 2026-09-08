import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator.js';
import { SitesService } from './sites.service.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { UpdateSiteDto } from './dto/update-site.dto.js';
import type { SiteStatus } from './schemas/site.schema.js';

@Controller('sites')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @RequirePermissions('sites.view')
  async findAll(
    @Query('status') status?: SiteStatus,
    @Query('brand') brand?: string,
  ) {
    const sites = await this.sitesService.findAll({
      status: status ? status : undefined,
      brand: brand ? brand : undefined,
    });
    return {
      success: true,
      data: sites,
    };
  }

  @Get(':id')
  @RequirePermissions('sites.view')
  async findOne(@Param('id') id: string) {
    const site = await this.sitesService.findById(id);
    return {
      success: true,
      data: site,
    };
  }

  @Post()
  @RequirePermissions('sites.create')
  async create(@Body() createSiteDto: CreateSiteDto) {
    const site = await this.sitesService.create(createSiteDto);
    return {
      success: true,
      data: site,
      message: 'Site created successfully.',
    };
  }

  @Patch(':id')
  @RequirePermissions('sites.update')
  async update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    const site = await this.sitesService.update(id, updateSiteDto);
    return {
      success: true,
      data: site,
      message: 'Site updated successfully.',
    };
  }
}
