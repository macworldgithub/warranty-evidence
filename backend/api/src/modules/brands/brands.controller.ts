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
import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import type { BrandStatus } from './schemas/brand.schema.js';

@Controller('brands')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @RequirePermissions('brands.view')
  async findAll(@Query('status') status?: BrandStatus) {
    const brands = await this.brandsService.findAll(status ? { status } : undefined);
    return {
      success: true,
      data: brands,
    };
  }

  @Get(':id')
  @RequirePermissions('brands.view')
  async findOne(@Param('id') id: string) {
    const brand = await this.brandsService.findById(id);
    return {
      success: true,
      data: brand,
    };
  }

  @Post()
  @RequirePermissions('brands.create')
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
