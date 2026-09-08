import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SiteStatus } from '../schemas/site.schema.js';

export class SiteAddressDto {
  @ApiProperty({ description: 'Street address', example: '215 South Gippsland Hwy' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ description: 'Suburb', example: 'Cranbourne' })
  @IsString()
  @IsNotEmpty()
  suburb!: string;

  @ApiProperty({ description: 'State / Territory', example: 'VIC' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ description: 'Postal code', example: '3977' })
  @IsString()
  @IsNotEmpty()
  postcode!: string;
}

export class CreateSiteDto {
  @ApiProperty({ description: 'Unique uppercase site identifier code', example: 'CRANBOURNE' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Dealership trade / commercial name', example: 'Booran BYD Cranbourne' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Physical address of the dealership rooftop', type: () => SiteAddressDto })
  @ValidateNested()
  @Type(() => SiteAddressDto)
  @IsNotEmpty()
  address!: SiteAddressDto;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
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
