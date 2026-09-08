import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BrandStatus } from '../schemas/brand.schema.js';

export class CreateBrandDto {
  @ApiProperty({ description: 'Unique OEM brand code', example: 'BYD' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Commercial brand name', example: 'BYD Auto Australia' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Vehicle manufacturer name', example: 'BYD Auto Co., Ltd.' })
  @IsString()
  @IsNotEmpty()
  manufacturer!: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
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

  @ApiPropertyOptional({ description: 'URL to brand vector/raster logo', example: 'https://cdn.example.com/byd.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
