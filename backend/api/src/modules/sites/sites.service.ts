import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Site, type SiteDocument, type SiteStatus } from './schemas/site.schema.js';
import type { CreateSiteDto } from './dto/create-site.dto.js';
import type { UpdateSiteDto } from './dto/update-site.dto.js';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async findAll(filter?: { status?: SiteStatus; brand?: string }): Promise<Site[]> {
    const query: Record<string, unknown> = {};
    if (filter?.status) {
      query['status'] = filter.status;
    }
    if (filter?.brand) {
      query['brands'] = filter.brand.toUpperCase().trim();
    }
    return this.siteModel.find(query).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Site> {
    let site: SiteDocument | null = null;
    if (isValidObjectId(id)) {
      site = await this.siteModel.findById(id).exec();
    }
    if (!site) {
      site = await this.siteModel.findOne({ code: id.toUpperCase().trim() }).exec();
    }
    if (!site) {
      throw new NotFoundException(`Site with ID or Code "${id}" not found.`);
    }
    return site;
  }

  async findByCode(code: string): Promise<Site | null> {
    return this.siteModel.findOne({ code: code.toUpperCase().trim() }).exec();
  }

  async create(dto: CreateSiteDto): Promise<Site> {
    const normalizedCode = dto.code.toUpperCase().trim();
    const existing = await this.findByCode(normalizedCode);
    if (existing) {
      throw new ConflictException(`Site with code "${normalizedCode}" already exists.`);
    }

    const site = new this.siteModel({
      ...dto,
      code: normalizedCode,
      name: dto.name.trim(),
      status: dto.status || 'ACTIVE',
      brands: (dto.brands || []).map((b) => b.toUpperCase().trim()),
      phone: dto.phone?.trim(),
      email: dto.email?.trim().toLowerCase(),
    });

    return site.save();
  }

  async update(id: string, dto: UpdateSiteDto): Promise<Site> {
    const site = await this.findById(id);
    const siteDoc = site as SiteDocument;

    if (dto.name !== undefined) siteDoc.name = dto.name.trim();
    if (dto.address !== undefined) siteDoc.address = dto.address;
    if (dto.status !== undefined) siteDoc.status = dto.status;
    if (dto.brands !== undefined) {
      siteDoc.brands = dto.brands.map((b) => b.toUpperCase().trim());
    }
    if (dto.phone !== undefined) siteDoc.phone = dto.phone.trim();
    if (dto.email !== undefined) siteDoc.email = dto.email.trim().toLowerCase();

    return siteDoc.save();
  }

  async assignBrand(siteCode: string, brandCode: string): Promise<void> {
    await this.siteModel.updateOne(
      { code: siteCode.toUpperCase().trim() },
      { $addToSet: { brands: brandCode.toUpperCase().trim() } },
    );
  }

  async removeBrand(siteCode: string, brandCode: string): Promise<void> {
    await this.siteModel.updateOne(
      { code: siteCode.toUpperCase().trim() },
      { $pull: { brands: brandCode.toUpperCase().trim() } },
    );
  }
}
