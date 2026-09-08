import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandPack, type BrandPackDocument } from '../schemas/brand-pack.schema.js';
import { BrandsService } from '../../brands/brands.service.js';
import { SitesService } from '../../sites/sites.service.js';

export interface ResolvedBrandPackContract {
  brand: {
    code: string;
    name: string;
    manufacturer: string;
  };
  site?: {
    code: string;
    name: string;
  };
  pack: {
    id: string;
    version: string;
    status: string;
    description: string;
    publishedAt?: Date;
  };
  vehicleRules: BrandPack['vehicleRules'];
  tier1Items: BrandPack['tier1Items'];
  faultTypes: BrandPack['faultTypes'];
  conditionalRules: BrandPack['conditionalRules'];
  namingRules: BrandPack['namingRules'];
}

@Injectable()
export class BrandPackResolutionService {
  constructor(
    @InjectModel(BrandPack.name) private readonly packModel: Model<BrandPackDocument>,
    private readonly brandsService: BrandsService,
    private readonly sitesService: SitesService,
  ) {}

  async resolveBrandPack(
    brandCode: string,
    siteCode?: string,
    _effectiveDate?: Date,
  ): Promise<ResolvedBrandPackContract> {
    const normBrandCode = brandCode.toUpperCase().trim();
    const brand = await this.brandsService.findByCode(normBrandCode);
    if (!brand) {
      throw new NotFoundException(`Brand "${normBrandCode}" not found.`);
    }

    let siteInfo: { code: string; name: string } | undefined = undefined;
    if (siteCode) {
      const normSiteCode = siteCode.toUpperCase().trim();
      const site = await this.sitesService.findByCode(normSiteCode);
      if (site) {
        siteInfo = { code: site.code, name: site.name };
      }
    }

    // 1. Check for site-specific published pack first
    let pack: BrandPackDocument | null = null;
    if (siteCode) {
      pack = await this.packModel
        .findOne({
          brandCode: normBrandCode,
          status: 'PUBLISHED',
          applicableSites: siteCode.toUpperCase().trim(),
        })
        .sort({ createdAt: -1 })
        .exec();
    }

    // 2. Fall back to general published pack for this brand (applicableSites empty or containing site)
    if (!pack) {
      pack = await this.packModel
        .findOne({
          brandCode: normBrandCode,
          status: 'PUBLISHED',
          $or: [
            { applicableSites: { $size: 0 } },
            ...(siteCode ? [{ applicableSites: siteCode.toUpperCase().trim() }] : []),
          ],
        })
        .sort({ createdAt: -1 })
        .exec();
    }

    // 3. If no published pack exists for brand, check COMMON fallback
    if (!pack) {
      pack = await this.packModel
        .findOne({
          brandCode: 'COMMON',
          status: 'PUBLISHED',
        })
        .sort({ createdAt: -1 })
        .exec();
    }

    if (!pack) {
      throw new NotFoundException(
        `No published Brand Pack found for Brand "${normBrandCode}"${siteCode ? ` at Site "${siteCode}"` : ''}.`,
      );
    }

    return {
      brand: {
        code: brand.code,
        name: brand.name,
        manufacturer: brand.manufacturer,
      },
      site: siteInfo,
      pack: {
        id: pack._id.toString(),
        version: pack.version,
        status: pack.status,
        description: pack.description,
        publishedAt: pack.publishedAt,
      },
      vehicleRules: pack.vehicleRules,
      tier1Items: pack.tier1Items,
      faultTypes: pack.faultTypes.filter((ft) => ft.active !== false),
      conditionalRules: pack.conditionalRules,
      namingRules: pack.namingRules,
    };
  }
}
