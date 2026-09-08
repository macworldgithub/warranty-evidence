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
import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import type { BrandStatus } from './schemas/brand.schema.js';

@ApiTags('Brands')
@ApiBearerAuth('JWT-auth')
@Controller('brands')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @RequirePermissions('brands.view')
  @ApiOperation({ summary: 'List all OEM vehicle brands and franchises' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'], description: 'Filter by brand operational status' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires brands.view permission' })
  async findAll(@Query('status') status?: BrandStatus) {
    const brands = await this.brandsService.findAll(status ? { status } : undefined);
    return {
      success: true,
      data: brands,
    };
  }

  @Get(':id')
  @RequirePermissions('brands.view')
  @ApiOperation({ summary: 'Get brand by MongoDB ObjectId or unique OEM code' })
  @ApiParam({ name: 'id', description: 'Brand ObjectId or unique code (e.g. BYD)' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('id') id: string) {
    const brand = await this.brandsService.findById(id);
    return {
      success: true,
      data: brand,
    };
  }

  @Post()
  @RequirePermissions('brands.create')
  @ApiOperation({ summary: 'Register a new OEM brand franchise' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate brand code' })
  async create(@Body() createBrandDto: CreateBrandDto) {
    const brand = await this.brandsService.create(createBrandDto);
    return {
      success: true,
      data: brand,
      message: 'Brand created successfully.',
    };
  }

  @Patch(':id')
  @RequirePermissions('brands.update')
  @ApiOperation({ summary: 'Update an existing OEM brand profile' })
  @ApiParam({ name: 'id', description: 'Brand ObjectId or unique code' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    const brand = await this.brandsService.update(id, updateBrandDto);
    return {
      success: true,
      data: brand,
      message: 'Brand updated successfully.',
    };
  }
}
