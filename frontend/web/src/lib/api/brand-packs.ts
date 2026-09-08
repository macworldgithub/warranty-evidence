import { api, type ApiResponse } from '../api';
import type { BrandPack, ValidationResult, PackStatus } from '../../types/brand-pack';

export interface BrandPackFilter {
  [key: string]: string | undefined;
  brandId?: string;
  brandCode?: string;
  status?: PackStatus;
  site?: string;
}

export async function getBrandPacks(filter?: BrandPackFilter): Promise<BrandPack[]> {
  try {
    const res = await api.get<ApiResponse<BrandPack[]>>('/brand-packs', { params: filter });
    return res.data || [];
  } catch (err) {
    console.warn('Could not fetch brand packs from API:', err);
    return [];
  }
}

export async function getBrandPack(id: string): Promise<BrandPack | null> {
  try {
    const res = await api.get<ApiResponse<BrandPack>>(`/brand-packs/${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`Failed to fetch brand pack ${id}:`, err);
    return null;
  }
}

export async function getBrandVersions(brandId: string): Promise<BrandPack[]> {
  try {
    const res = await api.get<ApiResponse<BrandPack[]>>(`/brand-packs/brand/${brandId}/versions`);
    return res.data || [];
  } catch (err) {
    console.error(`Failed to fetch versions for brand ${brandId}:`, err);
    return [];
  }
}

export async function createBrandPack(payload: Partial<BrandPack>): Promise<BrandPack> {
  const res = await api.post<ApiResponse<BrandPack>>('/brand-packs', payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to create brand pack.');
  }
  return res.data;
}

export async function updateBrandPack(id: string, payload: Partial<BrandPack>): Promise<BrandPack> {
  const res = await api.patch<ApiResponse<BrandPack>>(`/brand-packs/${id}`, payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to update brand pack.');
  }
  return res.data;
}

export async function cloneBrandPack(
  id: string,
  payload?: { newVersion?: string; changelog?: string },
): Promise<BrandPack> {
  const res = await api.post<ApiResponse<BrandPack>>(`/brand-packs/${id}/clone`, payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to clone brand pack.');
  }
  return res.data;
}

export async function validateBrandPack(id: string): Promise<ValidationResult> {
  const res = await api.post<ApiResponse<ValidationResult>>(`/brand-packs/${id}/validate`);
  return res.data || { valid: false, errors: ['Unknown error'], warnings: [], issues: [] };
}

export async function publishBrandPack(
  id: string,
  payload?: { changelog?: string },
): Promise<BrandPack> {
  const res = await api.post<ApiResponse<BrandPack>>(`/brand-packs/${id}/publish`, payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to publish brand pack.');
  }
  return res.data;
}

export async function archiveBrandPack(id: string): Promise<BrandPack> {
  const res = await api.post<ApiResponse<BrandPack>>(`/brand-packs/${id}/archive`);
  if (!res.data) {
    throw new Error(res.message || 'Failed to archive brand pack.');
  }
  return res.data;
}

export async function resolveBrandPack(brandCode: string, siteCode?: string) {
  const res = await api.get<ApiResponse<any>>('/brand-packs/resolve', {
    params: { brandCode, siteCode },
  });
  return res.data;
}
