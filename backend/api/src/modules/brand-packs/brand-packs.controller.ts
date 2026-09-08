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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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

@ApiTags('Brand Packs')
@ApiBearerAuth('JWT-auth')
@Controller('brand-packs')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class BrandPacksController {
  constructor(
    private readonly packsService: BrandPacksService,
    private readonly resolutionService: BrandPackResolutionService,
  ) {}

  @Get()
  @RequirePermissions('brand_packs.view')
  @ApiOperation({ summary: 'List all warranty brand packs with status, brand, and site filtering' })
  @ApiQuery({ name: 'brandId', required: false, description: 'Filter by Brand MongoDB ObjectId' })
  @ApiQuery({ name: 'brandCode', required: false, description: 'Filter by OEM brand code (e.g. BYD)' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: 'Filter by lifecycle status' })
  @ApiQuery({ name: 'site', required: false, description: 'Filter by applicable dealership site code' })
  @ApiResponse({ status: 200, description: 'Brand packs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires brand_packs.view permission' })
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
  @ApiOperation({ summary: 'Resolve active published brand pack for technician mobile capture' })
  @ApiQuery({ name: 'brandCode', required: true, description: 'OEM brand code (e.g. BYD)' })
  @ApiQuery({ name: 'siteCode', required: false, description: 'Dealership rooftop site code (e.g. CRANBOURNE)' })
  @ApiResponse({ status: 200, description: 'Active brand pack resolved successfully' })
  @ApiResponse({ status: 400, description: 'Missing brandCode parameter' })
  @ApiResponse({ status: 404, description: 'No active or fallback pack found' })
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
  @ApiOperation({ summary: 'List all historical and draft version revisions for a brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ObjectId or OEM code' })
  @ApiResponse({ status: 200, description: 'Version timeline retrieved successfully' })
  async findVersionsForBrand(@Param('brandId') brandId: string) {
    const versions = await this.packsService.findVersionsForBrand(brandId);
    return {
      success: true,
      data: versions,
    };
  }

  @Get(':id')
  @RequirePermissions('brand_packs.view')
  @ApiOperation({ summary: 'Get full brand pack specification by ID' })
  @ApiParam({ name: 'id', description: 'Brand pack MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Brand pack retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Brand pack not found' })
  async findOne(@Param('id') id: string) {
    const pack = await this.packsService.findById(id);
    return {
      success: true,
      data: pack,
    };
  }

  @Post()
  @RequirePermissions('brand_packs.create')
  @ApiOperation({ summary: 'Initialize a new DRAFT brand pack' })
  @ApiResponse({ status: 201, description: 'Draft brand pack created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
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
  @ApiOperation({ summary: 'Update rules in a DRAFT brand pack (published packs are immutable)' })
  @ApiParam({ name: 'id', description: 'Brand pack MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Draft brand pack updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot edit a PUBLISHED or ARCHIVED pack' })
  @ApiResponse({ status: 404, description: 'Brand pack not found' })
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
  @ApiOperation({ summary: 'Clone an existing brand pack into an editable DRAFT with incremented version' })
  @ApiParam({ name: 'id', description: 'Source brand pack MongoDB ObjectId' })
  @ApiResponse({ status: 201, description: 'Brand pack cloned successfully' })
  @ApiResponse({ status: 404, description: 'Source brand pack not found' })
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
  @ApiOperation({ summary: 'Validate brand pack rule consistency, uniqueness, and naming templates' })
  @ApiParam({ name: 'id', description: 'Brand pack MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Validation results returned' })
  @ApiResponse({ status: 404, description: 'Brand pack not found' })
  async validate(@Param('id') id: string) {
    const result = await this.packsService.validateById(id);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/publish')
  @RequirePermissions('brand_packs.publish')
  @ApiOperation({ summary: 'Validate and publish a DRAFT brand pack, archiving previous published versions' })
  @ApiParam({ name: 'id', description: 'Brand pack MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Brand pack published successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed - cannot publish invalid pack' })
  @ApiResponse({ status: 404, description: 'Brand pack not found' })
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
  @ApiOperation({ summary: 'Archive an active brand pack' })
  @ApiParam({ name: 'id', description: 'Brand pack MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Brand pack archived successfully' })
  @ApiResponse({ status: 404, description: 'Brand pack not found' })
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
