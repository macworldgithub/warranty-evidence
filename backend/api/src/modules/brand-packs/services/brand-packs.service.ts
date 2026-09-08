import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import {
  BrandPack,
  type BrandPackDocument,
  type PackStatus,
} from '../schemas/brand-pack.schema.js';
import { BrandPackValidator, type ValidationResult } from './brand-pack-validator.service.js';
import { BrandsService } from '../../brands/brands.service.js';
import type { CreateBrandPackDto } from '../dto/create-brand-pack.dto.js';
import type { UpdateBrandPackDto, CloneBrandPackDto, PublishBrandPackDto } from '../dto/update-brand-pack.dto.js';

@Injectable()
export class BrandPacksService {
  constructor(
    @InjectModel(BrandPack.name) private readonly packModel: Model<BrandPackDocument>,
    private readonly validator: BrandPackValidator,
    private readonly brandsService: BrandsService,
  ) {}

  async findAll(filter?: {
    brandId?: string;
    brandCode?: string;
    status?: PackStatus;
    site?: string;
  }): Promise<BrandPack[]> {
    const query: Record<string, unknown> = {};
    if (filter?.brandId && isValidObjectId(filter.brandId)) {
      query['brandId'] = new Types.ObjectId(filter.brandId);
    }
    if (filter?.brandCode) {
      query['brandCode'] = filter.brandCode.toUpperCase().trim();
    }
    if (filter?.status) {
      query['status'] = filter.status;
    }
    if (filter?.site) {
      query['applicableSites'] = filter.site.toUpperCase().trim();
    }
    return this.packModel.find(query).sort({ brandCode: 1, createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<BrandPackDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid Brand Pack ID format: "${id}"`);
    }
    const pack = await this.packModel.findById(id).exec();
    if (!pack) {
      throw new NotFoundException(`Brand Pack with ID "${id}" not found.`);
    }
    return pack;
  }

  async findVersionsForBrand(brandIdentifier: string): Promise<BrandPack[]> {
    const query: Record<string, unknown> = {};
    if (isValidObjectId(brandIdentifier)) {
      query['brandId'] = new Types.ObjectId(brandIdentifier);
    } else {
      query['brandCode'] = brandIdentifier.toUpperCase().trim();
    }
    return this.packModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async createDraft(dto: CreateBrandPackDto, userEmail: string): Promise<BrandPack> {
    const brand = await this.brandsService.findById(dto.brandId);
    const normVersion = dto.version.trim();

    // Check version uniqueness for this brand
    const existing = await this.packModel
      .findOne({
        brandId: (brand as any)._id,
        version: normVersion,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        `A Brand Pack with version "${normVersion}" already exists for ${brand.name}.`,
      );
    }

    const pack = new this.packModel({
      brandId: (brand as any)._id,
      brandCode: brand.code,
      version: normVersion,
      status: 'DRAFT',
      description: dto.description?.trim() || '',
      applicableSites: (dto.applicableSites || []).map((s) => s.toUpperCase().trim()),
      vehicleRules: dto.vehicleRules || {},
      tier1Items: dto.tier1Items || [],
      faultTypes: dto.faultTypes || [],
      conditionalRules: dto.conditionalRules || [],
      namingRules: dto.namingRules || [],
      createdBy: userEmail,
      changelog: dto.changelog || 'Initial draft version.',
    });

    return pack.save();
  }

  async updateDraft(id: string, dto: UpdateBrandPackDto): Promise<BrandPack> {
    const pack = await this.findById(id);

    if (pack.status !== 'DRAFT') {
      throw new ForbiddenException(
        `Brand Pack "${pack.version}" is in "${pack.status}" status and cannot be edited. Please clone it to create a new draft version.`,
      );
    }

    if (dto.description !== undefined) pack.description = dto.description.trim();
    if (dto.applicableSites !== undefined) {
      pack.applicableSites = dto.applicableSites.map((s) => s.toUpperCase().trim());
    }
    if (dto.vehicleRules !== undefined) pack.vehicleRules = dto.vehicleRules as any;
    if (dto.tier1Items !== undefined) pack.tier1Items = dto.tier1Items as any;
    if (dto.faultTypes !== undefined) pack.faultTypes = dto.faultTypes as any;
    if (dto.conditionalRules !== undefined) pack.conditionalRules = dto.conditionalRules as any;
    if (dto.namingRules !== undefined) pack.namingRules = dto.namingRules as any;
    if (dto.changelog !== undefined) pack.changelog = dto.changelog.trim();

    return pack.save();
  }

  async clone(id: string, dto: CloneBrandPackDto, userEmail: string): Promise<BrandPack> {
    const sourcePack = await this.findById(id);

    // Calculate default new version if not supplied
    let newVersion = dto.newVersion?.trim();
    if (!newVersion) {
      const match = sourcePack.version.match(/^v?(\d+)(\.(\d+))?$/i);
      if (match) {
        const major = parseInt(match[1], 10);
        newVersion = `v${major + 1}`;
      } else {
        newVersion = `${sourcePack.version}-draft`;
      }
    }

    // Check version uniqueness
    const existing = await this.packModel
      .findOne({
        brandId: sourcePack.brandId,
        version: newVersion,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        `Version "${newVersion}" already exists for this brand. Please specify a unique version string.`,
      );
    }

    const cloned = new this.packModel({
      brandId: sourcePack.brandId,
      brandCode: sourcePack.brandCode,
      version: newVersion,
      status: 'DRAFT',
      description: sourcePack.description,
      applicableSites: [...sourcePack.applicableSites],
      vehicleRules: JSON.parse(JSON.stringify(sourcePack.vehicleRules)),
      tier1Items: JSON.parse(JSON.stringify(sourcePack.tier1Items)),
      faultTypes: JSON.parse(JSON.stringify(sourcePack.faultTypes)),
      conditionalRules: JSON.parse(JSON.stringify(sourcePack.conditionalRules)),
      namingRules: JSON.parse(JSON.stringify(sourcePack.namingRules)),
      createdBy: userEmail,
      changelog: dto.changelog || `Cloned from ${sourcePack.version} (${sourcePack.status}).`,
    });

    return cloned.save();
  }

  validatePack(pack: BrandPack): ValidationResult {
    return this.validator.validate(pack);
  }

  async validateById(id: string): Promise<ValidationResult> {
    const pack = await this.findById(id);
    return this.validator.validate(pack);
  }

  async publish(id: string, userEmail: string, dto?: PublishBrandPackDto): Promise<BrandPack> {
    const pack = await this.findById(id);

    if (pack.status === 'PUBLISHED') {
      throw new BadRequestException(`Brand Pack "${pack.version}" is already published.`);
    }

    // Validate pack before publishing
    this.validator.assertValidForPublish(pack);

    // Archive any currently published pack for the same brand and overlapping scope
    await this.packModel.updateMany(
      {
        brandId: pack.brandId,
        status: 'PUBLISHED',
        _id: { $ne: pack._id },
      },
      {
        $set: {
          status: 'ARCHIVED',
          updatedAt: new Date(),
        },
      },
    );

    // Mark current pack as PUBLISHED
    pack.status = 'PUBLISHED';
    pack.publishedBy = userEmail;
    pack.publishedAt = new Date();
    if (dto?.changelog) {
      pack.changelog = dto.changelog.trim();
    }

    const saved = await pack.save();

    // Update Brand's activePackVersion
    await this.brandsService.updateActivePackVersion(pack.brandCode, pack.version);

    return saved;
  }

  async archive(id: string, _userEmail: string): Promise<BrandPack> {
    const pack = await this.findById(id);

    if (pack.status === 'ARCHIVED') {
      throw new BadRequestException(`Brand Pack "${pack.version}" is already archived.`);
    }

    pack.status = 'ARCHIVED';
    return pack.save();
  }
}
