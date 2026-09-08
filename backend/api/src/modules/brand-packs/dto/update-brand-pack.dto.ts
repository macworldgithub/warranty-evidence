import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VehicleRulesDto,
  EvidenceRuleDto,
  FaultTypeDto,
  ConditionalRuleDto,
  NamingRuleDto,
} from './create-brand-pack.dto.js';

export class UpdateBrandPackDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @ValidateNested()
  @Type(() => VehicleRulesDto)
  @IsOptional()
  vehicleRules?: VehicleRulesDto;

  @ValidateNested({ each: true })
  @Type(() => EvidenceRuleDto)
  @IsArray()
  @IsOptional()
  tier1Items?: EvidenceRuleDto[];

  @ValidateNested({ each: true })
  @Type(() => FaultTypeDto)
  @IsArray()
  @IsOptional()
  faultTypes?: FaultTypeDto[];

  @ValidateNested({ each: true })
  @Type(() => ConditionalRuleDto)
  @IsArray()
  @IsOptional()
  conditionalRules?: ConditionalRuleDto[];

  @ValidateNested({ each: true })
  @Type(() => NamingRuleDto)
  @IsArray()
  @IsOptional()
  namingRules?: NamingRuleDto[];

  @IsString()
  @IsOptional()
  changelog?: string;
}

export class CloneBrandPackDto {
  @IsString()
  @IsOptional()
  newVersion?: string;

  @IsString()
  @IsOptional()
  changelog?: string;
}

export class PublishBrandPackDto {
  @IsString()
  @IsOptional()
  changelog?: string;
}

export class ResolveBrandPackQueryDto {
  @IsString()
  brandCode!: string;

  @IsString()
  @IsOptional()
  siteCode?: string;

  @IsString()
  @IsOptional()
  date?: string;
}
