import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import type { BrandStatus } from '../schemas/brand.schema.js';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  manufacturer!: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: BrandStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
