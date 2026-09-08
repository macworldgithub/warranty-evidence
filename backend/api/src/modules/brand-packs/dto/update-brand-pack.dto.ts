import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VehicleRulesDto,
  EvidenceRuleDto,
  FaultTypeDto,
  ConditionalRuleDto,
  NamingRuleDto,
} from './create-brand-pack.dto.js';

export class UpdateBrandPackDto {
  @ApiPropertyOptional({ description: 'Pack specification summary', example: 'Updated warranty capture rules' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Specific dealership site codes where this pack applies',
    example: ['CRANBOURNE'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @ApiPropertyOptional({ description: 'Vehicle identification requirements', type: () => VehicleRulesDto })
  @ValidateNested()
  @Type(() => VehicleRulesDto)
  @IsOptional()
  vehicleRules?: VehicleRulesDto;

  @ApiPropertyOptional({ description: 'Tier 1 baseline mandatory evidence requirements', type: [EvidenceRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => EvidenceRuleDto)
  @IsArray()
  @IsOptional()
  tier1Items?: EvidenceRuleDto[];

  @ApiPropertyOptional({ description: 'Fault defect categories and Tier 2 rules', type: [FaultTypeDto] })
  @ValidateNested({ each: true })
  @Type(() => FaultTypeDto)
  @IsArray()
  @IsOptional()
  faultTypes?: FaultTypeDto[];

  @ApiPropertyOptional({ description: 'Conditional dynamic evidence rules', type: [ConditionalRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => ConditionalRuleDto)
  @IsArray()
  @IsOptional()
  conditionalRules?: ConditionalRuleDto[];

  @ApiPropertyOptional({ description: 'OEM file naming templates', type: [NamingRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => NamingRuleDto)
  @IsArray()
  @IsOptional()
  namingRules?: NamingRuleDto[];

  @ApiPropertyOptional({ description: 'Version changelog notes' })
  @IsString()
  @IsOptional()
  changelog?: string;
}

export class CloneBrandPackDto {
  @ApiPropertyOptional({ description: 'New version identifier for cloned draft', example: 'v2.0' })
  @IsString()
  @IsOptional()
  newVersion?: string;

  @ApiPropertyOptional({ description: 'Audit rationale or changelog summary for cloning', example: 'Cloned from v1.0 to add HV checklist' })
  @IsString()
  @IsOptional()
  changelog?: string;
}

export class PublishBrandPackDto {
  @ApiPropertyOptional({ description: 'Publish notes or changelog comment', example: 'Published via Admin Portal' })
  @IsString()
  @IsOptional()
  changelog?: string;
}

export class ResolveBrandPackQueryDto {
  @ApiProperty({ description: 'Target OEM brand code', example: 'BYD' })
  @IsString()
  brandCode!: string;

  @ApiPropertyOptional({ description: 'Dealership rooftop site code', example: 'CRANBOURNE' })
  @IsString()
  @IsOptional()
  siteCode?: string;

  @ApiPropertyOptional({ description: 'Audit resolution timestamp (ISO 8601)' })
  @IsString()
  @IsOptional()
  date?: string;
}
