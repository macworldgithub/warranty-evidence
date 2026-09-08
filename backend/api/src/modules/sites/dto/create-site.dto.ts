import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { SiteStatus } from '../schemas/site.schema.js';

export class SiteAddressDto {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  suburb!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  postcode!: string;
}

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateNested()
  @Type(() => SiteAddressDto)
  @IsNotEmpty()
  address!: SiteAddressDto;

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
