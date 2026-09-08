import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import type { BrandStatus } from '../schemas/brand.schema.js';

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: BrandStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @IsString()
  @IsOptional()
  activePackVersion?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
