import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { BrandStatus } from '../schemas/brand.schema.js';

export class UpdateBrandDto {
  @ApiPropertyOptional({ description: 'Commercial brand name', example: 'BYD Auto Australia' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Vehicle manufacturer name', example: 'BYD Auto Co., Ltd.' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: BrandStatus;

  @ApiPropertyOptional({
    description: 'Dealership rooftop codes authorized to service this brand',
    example: ['CRANBOURNE', 'MELBOURNE'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @ApiPropertyOptional({ description: 'Active published brand pack version identifier', example: 'v1.0' })
  @IsString()
  @IsOptional()
  activePackVersion?: string;

  @ApiPropertyOptional({ description: 'URL to brand vector/raster logo', example: 'https://cdn.example.com/byd.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
