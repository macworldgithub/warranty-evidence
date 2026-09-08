import { api, type ApiResponse } from '../api';
import type { Site } from '../../types/brand-pack';

export async function getSites(filter?: { status?: 'ACTIVE' | 'INACTIVE'; brand?: string }): Promise<Site[]> {
  try {
    const res = await api.get<ApiResponse<Site[]>>('/sites', { params: filter });
    return res.data || [];
  } catch (err) {
    console.warn('Could not fetch sites from API:', err);
    return [];
  }
}

export async function getSite(id: string): Promise<Site | null> {
  try {
    const res = await api.get<ApiResponse<Site>>(`/sites/${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`Failed to fetch site ${id}:`, err);
    return null;
  }
}

export async function createSite(payload: Partial<Site>): Promise<Site> {
  const res = await api.post<ApiResponse<Site>>('/sites', payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to create site.');
  }
  return res.data;
}

export async function updateSite(id: string, payload: Partial<Site>): Promise<Site> {
  const res = await api.patch<ApiResponse<Site>>(`/sites/${id}`, payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to update site.');
  }
  return res.data;
}
