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
import { SitesService } from './sites.service.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { UpdateSiteDto } from './dto/update-site.dto.js';
import type { SiteStatus } from './schemas/site.schema.js';

@ApiTags('Sites')
@ApiBearerAuth('JWT-auth')
@Controller('sites')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @RequirePermissions('sites.view')
  @ApiOperation({ summary: 'List all physical dealership rooftop service locations' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'], description: 'Filter by operational status' })
  @ApiQuery({ name: 'brand', required: false, description: 'Filter by authorized brand franchise (e.g. BYD)' })
  @ApiResponse({ status: 200, description: 'Sites retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires sites.view permission' })
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
  @ApiOperation({ summary: 'Get dealership site by MongoDB ObjectId or unique site code' })
  @ApiParam({ name: 'id', description: 'Site ObjectId or uppercase code (e.g. CRANBOURNE)' })
  @ApiResponse({ status: 200, description: 'Site retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Site not found' })
  async findOne(@Param('id') id: string) {
    const site = await this.sitesService.findById(id);
    return {
      success: true,
      data: site,
    };
  }

  @Post()
  @RequirePermissions('sites.create')
  @ApiOperation({ summary: 'Register a new dealership rooftop and service center' })
  @ApiResponse({ status: 201, description: 'Site registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate site code' })
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
  @ApiOperation({ summary: 'Update dealership rooftop address, brands, or contact details' })
  @ApiParam({ name: 'id', description: 'Site ObjectId or uppercase code' })
  @ApiResponse({ status: 200, description: 'Site updated successfully' })
  @ApiResponse({ status: 404, description: 'Site not found' })
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
