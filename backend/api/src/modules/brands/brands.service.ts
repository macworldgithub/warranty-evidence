import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Brand, type BrandDocument, type BrandStatus } from './schemas/brand.schema.js';
import type { CreateBrandDto } from './dto/create-brand.dto.js';
import type { UpdateBrandDto } from './dto/update-brand.dto.js';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  async findAll(filter?: { status?: BrandStatus }): Promise<Brand[]> {
    const query: Record<string, unknown> = {};
    if (filter?.status) {
      query['status'] = filter.status;
    }
    return this.brandModel.find(query).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Brand> {
    let brand: BrandDocument | null = null;
    if (isValidObjectId(id)) {
      brand = await this.brandModel.findById(id).exec();
    }
    if (!brand) {
      brand = await this.brandModel.findOne({ code: id.toUpperCase().trim() }).exec();
    }
    if (!brand) {
      throw new NotFoundException(`Brand with ID or Code "${id}" not found.`);
    }
    return brand;
  }

  async findByCode(code: string): Promise<Brand | null> {
    return this.brandModel.findOne({ code: code.toUpperCase().trim() }).exec();
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    const normalizedCode = dto.code.toUpperCase().trim();
    const existing = await this.findByCode(normalizedCode);
    if (existing) {
      throw new ConflictException(`Brand with code "${normalizedCode}" already exists.`);
    }

    const brand = new this.brandModel({
      ...dto,
      code: normalizedCode,
      name: dto.name.trim(),
      manufacturer: dto.manufacturer.trim(),
      status: dto.status || 'ACTIVE',
      applicableSites: dto.applicableSites || [],
    });

    return brand.save();
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findById(id);
    const brandDoc = brand as BrandDocument;

    if (dto.name !== undefined) brandDoc.name = dto.name.trim();
    if (dto.manufacturer !== undefined) brandDoc.manufacturer = dto.manufacturer.trim();
    if (dto.status !== undefined) brandDoc.status = dto.status;
    if (dto.applicableSites !== undefined) brandDoc.applicableSites = dto.applicableSites;
    if (dto.activePackVersion !== undefined) brandDoc.activePackVersion = dto.activePackVersion;
    if (dto.logoUrl !== undefined) brandDoc.logoUrl = dto.logoUrl;

    return brandDoc.save();
  }

  async updateActivePackVersion(brandCode: string, version: string): Promise<void> {
    await this.brandModel.updateOne(
      { code: brandCode.toUpperCase().trim() },
      { $set: { activePackVersion: version, updatedAt: new Date() } },
    );
  }

  async assignSite(brandCode: string, siteCode: string): Promise<void> {
    await this.brandModel.updateOne(
      { code: brandCode.toUpperCase().trim() },
      { $addToSet: { applicableSites: siteCode.toUpperCase().trim() } },
    );
  }
}
