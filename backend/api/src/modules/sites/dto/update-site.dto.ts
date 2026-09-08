import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SiteAddressDto } from './create-site.dto.js';
import type { SiteStatus } from '../schemas/site.schema.js';

export class UpdateSiteDto {
  @ApiPropertyOptional({ description: 'Dealership trade / commercial name', example: 'Booran BYD Cranbourne' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Physical address of the dealership rooftop', type: () => SiteAddressDto })
  @ValidateNested()
  @Type(() => SiteAddressDto)
  @IsOptional()
  address?: SiteAddressDto;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: SiteStatus;

  @ApiPropertyOptional({
    description: 'Authorized OEM brand franchises active at this facility',
    example: ['BYD', 'MG'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brands?: string[];

  @ApiPropertyOptional({ description: 'Service department telephone', example: '(03) 5996 0000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Service department contact email', example: 'service.cranbourne@booran.com.au' })
  @IsString()
  @IsOptional()
  email?: string;
}
