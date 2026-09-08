import { api, type ApiResponse } from '../api';
import type { Brand } from '../../types/brand-pack';

export async function getBrands(status?: 'ACTIVE' | 'INACTIVE'): Promise<Brand[]> {
  try {
    const params = status ? { status } : undefined;
    const res = await api.get<ApiResponse<Brand[]>>('/brands', { params });
    return res.data || [];
  } catch (err) {
    console.warn('Could not fetch brands from API, falling back to mock:', err);
    return [];
  }
}

export async function getBrand(id: string): Promise<Brand | null> {
  try {
    const res = await api.get<ApiResponse<Brand>>(`/brands/${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`Failed to fetch brand ${id}:`, err);
    return null;
  }
}

export async function createBrand(payload: Partial<Brand>): Promise<Brand> {
  const res = await api.post<ApiResponse<Brand>>('/brands', payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to create brand.');
  }
  return res.data;
}

export async function updateBrand(id: string, payload: Partial<Brand>): Promise<Brand> {
  const res = await api.patch<ApiResponse<Brand>>(`/brands/${id}`, payload);
  if (!res.data) {
    throw new Error(res.message || 'Failed to update brand.');
  }
  return res.data;
}
