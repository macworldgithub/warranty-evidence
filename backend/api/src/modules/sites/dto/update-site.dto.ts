import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SiteAddressDto } from './create-site.dto.js';
import type { SiteStatus } from '../schemas/site.schema.js';

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @ValidateNested()
  @Type(() => SiteAddressDto)
  @IsOptional()
  address?: SiteAddressDto;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: SiteStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brands?: string[];

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;
}
