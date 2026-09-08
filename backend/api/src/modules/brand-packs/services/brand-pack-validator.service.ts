import { Injectable, BadRequestException } from '@nestjs/common';
import type {
  BrandPack,
  EvidenceRule,
} from '../schemas/brand-pack.schema.js';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  issues: ValidationIssue[];
}

const ALLOWED_CONDITION_FIELDS = [
  'partBeingReplaced',
  'isNoiseOrOperationalFault',
  'hasDiagnostics',
  'repairStage',
  'highVoltageInvolved',
  'customerDispute',
  'isSafetyRecall',
];

const VALID_MEDIA_TYPES = ['IMAGE', 'VIDEO', 'PDF', 'AUDIO'];

@Injectable()
export class BrandPackValidator {
  validate(pack: BrandPack): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const issues: ValidationIssue[] = [];

    const addError = (field: string, message: string) => {
      errors.push(`${field}: ${message}`);
      issues.push({ field, message, severity: 'ERROR' });
    };

    const addWarning = (field: string, message: string) => {
      warnings.push(`${field}: ${message}`);
      issues.push({ field, message, severity: 'WARNING' });
    };

    // 1. Version validation
    if (!pack.version || pack.version.trim() === '') {
      addError('version', 'Pack version cannot be empty.');
    }

    // 2. Tier 1 items validation
    if (!pack.tier1Items || pack.tier1Items.length === 0) {
      addError('tier1Items', 'At least one Tier 1 evidence item is required.');
    }

    const allEvidenceKeys = new Set<string>();

    const validateEvidenceItem = (item: EvidenceRule, context: string) => {
      if (!item.key || item.key.trim() === '') {
        addError(`${context}.key`, 'Evidence item key is required.');
      } else {
        const normKey = item.key.toUpperCase().trim();
        if (allEvidenceKeys.has(normKey)) {
          addError(`${context}.key`, `Duplicate evidence key "${normKey}". All evidence keys must be globally unique within the pack.`);
        }
        allEvidenceKeys.add(normKey);
      }

      if (!item.title || item.title.trim() === '') {
        addError(`${context}.title`, 'Evidence item title is required.');
      }

      if (!VALID_MEDIA_TYPES.includes(item.mediaType)) {
        addError(`${context}.mediaType`, `Invalid media type "${item.mediaType}". Must be one of: ${VALID_MEDIA_TYPES.join(', ')}`);
      }

      if (item.minimumCount === undefined || item.minimumCount < 1) {
        addError(`${context}.minimumCount`, 'Minimum count must be at least 1.');
      }

      if (item.maximumCount === undefined || item.maximumCount < (item.minimumCount || 1)) {
        addError(`${context}.maximumCount`, `Maximum count (${item.maximumCount}) cannot be less than minimum count (${item.minimumCount}).`);
      }
    };

    pack.tier1Items?.forEach((item, idx) => {
      validateEvidenceItem(item, `tier1Items[${idx}] (${item.key || 'unknown'})`);
    });

    // 3. Fault types & Tier 2 items validation
    if (!pack.faultTypes || pack.faultTypes.length === 0) {
      addWarning('faultTypes', 'No fault types configured in this pack.');
    }

    const faultTypeKeys = new Set<string>();
    pack.faultTypes?.forEach((fault, fIdx) => {
      if (!fault.key || fault.key.trim() === '') {
        addError(`faultTypes[${fIdx}].key`, 'Fault type key is required.');
      } else {
        const normFaultKey = fault.key.toUpperCase().trim();
        if (faultTypeKeys.has(normFaultKey)) {
          addError(`faultTypes[${fIdx}].key`, `Duplicate fault type key "${normFaultKey}".`);
        }
        faultTypeKeys.add(normFaultKey);
      }

      if (!fault.name || fault.name.trim() === '') {
        addError(`faultTypes[${fIdx}].name`, 'Fault type name is required.');
      }

      fault.tier2Items?.forEach((t2Item, t2Idx) => {
        validateEvidenceItem(t2Item, `faultTypes[${fIdx}].tier2Items[${t2Idx}] (${t2Item.key || 'unknown'})`);
      });
    });

    // 4. Conditional Rules validation
    pack.conditionalRules?.forEach((rule, rIdx) => {
      if (!rule.id || rule.id.trim() === '') {
        addError(`conditionalRules[${rIdx}].id`, 'Conditional rule ID is required.');
      }

      if (!rule.condition) {
        addError(`conditionalRules[${rIdx}].condition`, 'Rule condition object is missing.');
      } else {
        if (!ALLOWED_CONDITION_FIELDS.includes(rule.condition.field)) {
          addError(
            `conditionalRules[${rIdx}].condition.field`,
            `Field "${rule.condition.field}" is not in the whitelist of supported condition fields: ${ALLOWED_CONDITION_FIELDS.join(', ')}`,
          );
        }
      }

      if (!rule.actions || rule.actions.length === 0) {
        addError(`conditionalRules[${rIdx}].actions`, 'Conditional rule must define at least one action.');
      } else {
        rule.actions.forEach((act, aIdx) => {
          if (act.type === 'REQUIRE_EVIDENCE') {
            const targetKey = act.evidenceKey?.toUpperCase().trim();
            // Note: Conditional evidence items might be defined in naming rules or globally
            if (!targetKey) {
              addError(`conditionalRules[${rIdx}].actions[${aIdx}].evidenceKey`, 'Target evidenceKey is required.');
            }
          }
        });
      }
    });

    // 5. Naming Rules validation
    if (pack.namingRules && pack.namingRules.length > 0) {
      const namingKeys = new Set<string>();
      pack.namingRules.forEach((nr, nIdx) => {
        const normKey = nr.evidenceKey?.toUpperCase().trim();
        if (!normKey) {
          addError(`namingRules[${nIdx}].evidenceKey`, 'Evidence key is required in naming rule.');
        } else {
          if (namingKeys.has(normKey)) {
            addWarning(`namingRules[${nIdx}].evidenceKey`, `Multiple naming templates for evidence key "${normKey}".`);
          }
          namingKeys.add(normKey);
        }

        if (!nr.template || nr.template.trim() === '') {
          addError(`namingRules[${nIdx}].template`, 'Naming template cannot be empty.');
        } else {
          if (!nr.template.includes('{RO}')) {
            addWarning(`namingRules[${nIdx}].template`, `Naming template "${nr.template}" is missing the standard "{RO}" placeholder.`);
          }
          if (!nr.template.includes('{ext}')) {
            addWarning(`namingRules[${nIdx}].template`, `Naming template "${nr.template}" is missing the standard "{ext}" placeholder.`);
          }
        }
      });
    } else {
      addWarning('namingRules', 'No OEM file naming rules defined in this pack.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      issues,
    };
  }

  assertValidForPublish(pack: BrandPack): void {
    const result = this.validate(pack);
    if (!result.valid) {
      throw new BadRequestException({
        message: 'Brand Pack failed validation and cannot be published.',
        errors: result.errors,
        issues: result.issues,
      });
    }
  }
}
