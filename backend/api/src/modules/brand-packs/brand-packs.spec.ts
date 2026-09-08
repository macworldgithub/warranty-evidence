import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { BrandPackValidator } from './services/brand-pack-validator.service.js';
import { BrandPacksService } from './services/brand-packs.service.js';
import { BrandPackResolutionService } from './services/brand-pack-resolution.service.js';
import type { BrandPack } from './schemas/brand-pack.schema.js';

describe('Brand Pack Engine Unit Tests', () => {
  let validator: BrandPackValidator;

  const createSamplePack = (overrides?: Partial<BrandPack>): BrandPack => ({
    brandId: 'brand-byd-01' as any,
    brandCode: 'BYD',
    version: 'v1',
    status: 'DRAFT',
    description: 'BYD Baseline Warranty Pack',
    applicableSites: [],
    vehicleRules: {
      vinRequired: true,
      vinOcrEnabled: true,
      odometerRequired: true,
      frontPhotoRequired: true,
      supportedPowertrains: ['EV', 'PHEV'],
      decodeVin: true,
    },
    tier1Items: [
      {
        key: 'VIN_PHOTO',
        title: 'VIN Plate Photo',
        description: 'Clear photo of compliance plate or windshield VIN',
        required: true,
        mediaType: 'IMAGE',
        minimumCount: 1,
        maximumCount: 2,
        instructions: 'Ensure all 17 characters are legible',
        order: 1,
        qualityRules: { ocrRequired: true },
      },
      {
        key: 'ODOMETER_PHOTO',
        title: 'Odometer Cluster',
        description: 'Dashboard instrument cluster showing current mileage',
        required: true,
        mediaType: 'IMAGE',
        minimumCount: 1,
        maximumCount: 1,
        instructions: 'Vehicle in Ready mode with odometer illuminated',
        order: 2,
        qualityRules: {},
      },
    ],
    faultTypes: [
      {
        key: 'OIL_LEAK',
        name: 'Oil leaks or seepage',
        description: 'Fluid leaks from powertrain or drive unit',
        tier: 'TIER_2',
        active: true,
        order: 1,
        tier2Items: [
          {
            key: 'LEAK_ORIGIN',
            title: 'Leak Origin Close-up',
            description: 'Close-up of suspected leak source',
            required: true,
            mediaType: 'IMAGE',
            minimumCount: 1,
            maximumCount: 3,
            instructions: 'Clean area first if heavily soiled to show seep path',
            order: 1,
            qualityRules: {},
          },
        ],
      },
    ],
    conditionalRules: [
      {
        id: 'cond-part-replaced',
        name: 'Part Replacement Serial Verification',
        condition: {
          field: 'partBeingReplaced',
          operator: 'EQUALS',
          value: true,
        },
        actions: [
          {
            type: 'REQUIRE_EVIDENCE',
            evidenceKey: 'OLD_PART_SERIAL',
            reason: 'OEM requires traceability of replaced component',
          },
        ],
      },
    ],
    namingRules: [
      {
        evidenceKey: 'VIN_PHOTO',
        template: '{RO}VIN.{ext}',
        descriptor: 'VIN',
      },
    ],
    createdBy: 'admin@booran.com',
    ...overrides,
  });

  beforeEach(() => {
    validator = new BrandPackValidator();
  });

  describe('BrandPackValidator', () => {
    it('should validate a compliant Brand Pack successfully', () => {
      const pack = createSamplePack();
      const result = validator.validate(pack);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a pack with no Tier 1 items', () => {
      const pack = createSamplePack({ tier1Items: [] });
      const result = validator.validate(pack);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Tier 1'))).toBe(true);
    });

    it('should reject duplicate evidence keys', () => {
      const pack = createSamplePack({
        tier1Items: [
          {
            key: 'DUPLICATE_KEY',
            title: 'Item 1',
            description: '',
            required: true,
            mediaType: 'IMAGE',
            minimumCount: 1,
            maximumCount: 1,
            instructions: '',
            order: 1,
            qualityRules: {},
          },
          {
            key: 'DUPLICATE_KEY',
            title: 'Item 2',
            description: '',
            required: true,
            mediaType: 'IMAGE',
            minimumCount: 1,
            maximumCount: 1,
            instructions: '',
            order: 2,
            qualityRules: {},
          },
        ],
      });

      const result = validator.validate(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate evidence key'))).toBe(true);
    });

    it('should reject invalid media types', () => {
      const pack = createSamplePack({
        tier1Items: [
          {
            key: 'TEST_KEY',
            title: 'Item 1',
            description: '',
            required: true,
            mediaType: 'INVALID_FORMAT' as any,
            minimumCount: 1,
            maximumCount: 1,
            instructions: '',
            order: 1,
            qualityRules: {},
          },
        ],
      });

      const result = validator.validate(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid media type'))).toBe(true);
    });

    it('should reject when maximumCount is less than minimumCount', () => {
      const pack = createSamplePack({
        tier1Items: [
          {
            key: 'TEST_KEY',
            title: 'Item 1',
            description: '',
            required: true,
            mediaType: 'IMAGE',
            minimumCount: 5,
            maximumCount: 2,
            instructions: '',
            order: 1,
            qualityRules: {},
          },
        ],
      });

      const result = validator.validate(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('cannot be less than minimum count'))).toBe(true);
    });

    it('should reject unsupported condition fields in conditional rules', () => {
      const pack = createSamplePack({
        conditionalRules: [
          {
            id: 'bad-field-rule',
            name: 'Malicious or invalid field injection',
            condition: {
              field: 'arbitraryUnsafeField',
              operator: 'EQUALS',
              value: true,
            },
            actions: [
              {
                type: 'REQUIRE_EVIDENCE',
                evidenceKey: 'SOME_KEY',
              },
            ],
          },
        ],
      });

      const result = validator.validate(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('not in the whitelist'))).toBe(true);
    });

    it('should throw BadRequestException on assertValidForPublish if invalid', () => {
      const invalidPack = createSamplePack({ tier1Items: [] });
      expect(() => validator.assertValidForPublish(invalidPack)).toThrow(BadRequestException);
    });
  });

  describe('BrandPacksService Immutability & Lifecycle', () => {
    let service: BrandPacksService;
    let mockPackModel: any;
    let mockBrandsService: any;

    beforeEach(() => {
      mockPackModel = {
        find: vi.fn(),
        findById: vi.fn(),
        findOne: vi.fn(),
        updateMany: vi.fn(),
      };
      mockBrandsService = {
        findById: vi.fn(),
        updateActivePackVersion: vi.fn(),
      };
      service = new BrandPacksService(mockPackModel, validator, mockBrandsService);
    });

    it('should prevent mutating a PUBLISHED brand pack directly', async () => {
      const publishedDoc = {
        ...createSamplePack({ status: 'PUBLISHED' }),
        save: vi.fn(),
      };
      mockPackModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(publishedDoc),
      });

      await expect(
        service.updateDraft('507f1f77bcf86cd799439011', { description: 'New description' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('BrandPackResolutionService', () => {
    let resolutionService: BrandPackResolutionService;
    let mockPackModel: any;
    let mockBrandsService: any;
    let mockSitesService: any;

    beforeEach(() => {
      mockPackModel = {
        findOne: vi.fn(),
      };
      mockBrandsService = {
        findByCode: vi.fn().mockResolvedValue({
          code: 'BYD',
          name: 'BYD',
          manufacturer: 'BYD Auto',
        }),
      };
      mockSitesService = {
        findByCode: vi.fn().mockResolvedValue({
          code: 'CRANBOURNE',
          name: 'Booran BYD Cranbourne',
        }),
      };
      resolutionService = new BrandPackResolutionService(
        mockPackModel,
        mockBrandsService,
        mockSitesService,
      );
    });

    it('should resolve the active published Brand Pack and return deterministic contract', async () => {
      const samplePack = createSamplePack({ status: 'PUBLISHED', version: 'v1' });
      const mockDoc = {
        ...samplePack,
        _id: 'pack-123',
      };

      mockPackModel.findOne.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockDoc),
        }),
      });

      const contract = await resolutionService.resolveBrandPack('BYD', 'CRANBOURNE');

      expect(contract.brand.code).toBe('BYD');
      expect(contract.site?.code).toBe('CRANBOURNE');
      expect(contract.pack.version).toBe('v1');
      expect(contract.tier1Items).toHaveLength(2);
      expect(contract.faultTypes).toHaveLength(1);
    });
  });
});
