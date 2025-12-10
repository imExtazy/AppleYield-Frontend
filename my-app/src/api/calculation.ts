import { httpRequest, isNetworkError } from './httpClient';
import { axiosInstance } from './axiosInstance';
import { MOCK_CALCULATION_DETAIL, MOCK_CART } from '../mocks/calculation.ts';
import type { ServiceMonth } from './months';

export interface CartInfo {
  order_id: number | null;
  items_count: number;
}

export interface MonthIndicator {
  service: ServiceMonth;
  sum_precipitation: number;
  avg_temp: number;
  comment: string;
}

export interface CalculationDetail {
  id: number;
  status: string;
  created_at: string;
  submitted_at: string | null;
  finished_at: string | null;
  location: string;
  person: string;
  result_value: string | null;
  items: MonthIndicator[];
}

function toNumberLike(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeIndicator(it: any): MonthIndicator {
  const sumRaw =
    it?.sum_precipitation ??
    it?.sumPrecipitation ??
    it?.sum_prec ??
    it?.precipitation ??
    it?.rain_sum ??
    it?.sum;
  const tempRaw =
    it?.avg_temp ??
    it?.avgTemp ??
    it?.avg_temperature ??
    it?.temperature ??
    it?.temp_avg ??
    it?.temp;
  return {
    service: it.service,
    sum_precipitation: toNumberLike(sumRaw),
    avg_temp: toNumberLike(tempRaw),
    comment: it?.comment ?? it?.note ?? '',
  };
}

function normalizeDetail(d: any): CalculationDetail {
  return {
    id: d.id,
    status: d.status,
    created_at: d.created_at,
    submitted_at: d.submitted_at ?? null,
    finished_at: d.finished_at ?? null,
    location: d.location ?? '',
    person: d.person ?? '',
    result_value: d.result_value ?? null,
    items: Array.isArray(d.items) ? d.items.map(normalizeIndicator) : [],
  };
}

export async function getCart(): Promise<CartInfo> {
  try {
    return await httpRequest<CartInfo>('/api/months_calculation/cart/');
  } catch (e) {
    const status = (e as any)?.status as number | undefined;
    if (isNetworkError(e) || (typeof status === 'number' && status >= 500)) {
      return MOCK_CART;
    }
    throw e;
  }
}

export async function getCalculation(id: number): Promise<CalculationDetail> {
  try {
    const raw = await httpRequest<any>(`/api/months_calculation/${id}/`);
    return normalizeDetail(raw);
  } catch (e) {
    const status = (e as any)?.status as number | undefined;
    if (isNetworkError(e) || (typeof status === 'number' && status >= 500)) {
      return MOCK_CALCULATION_DETAIL(id);
    }
    throw e;
  }
}

export async function updateCalculation(
  id: number,
  payload: { location: string; person: string },
): Promise<CalculationDetail> {
  return await httpRequest<CalculationDetail>(`/api/months_calculation/${id}/`, {
    method: 'PUT',
    body: payload,
  });
}

export async function updateItem(
  orderId: number,
  serviceId: number,
  payload: Partial<Pick<MonthIndicator, 'sum_precipitation' | 'avg_temp' | 'comment'>>,
): Promise<MonthIndicator> {
  const raw = await httpRequest<any>(`/api/months_calculation/${orderId}/month_indicators/${serviceId}/`, {
    method: 'PUT',
    body: payload,
  });
  return normalizeIndicator(raw);
}

export async function deleteItem(orderId: number, serviceId: number): Promise<void> {
  return await httpRequest<void>(`/api/months_calculation/${orderId}/month_indicators/${serviceId}/delete/`, {
    method: 'DELETE',
  });
}

export async function submitCalculation(id: number): Promise<CalculationDetail> {
  const { data } = await axiosInstance.put<CalculationDetail>(`/months_calculation/${id}/submit/`);
  return data;
}

export async function deleteCalculation(id: number): Promise<void> {
  const attempts: Array<() => Promise<any>> = [
    () => axiosInstance.post(`/months_calculation/${id}/delete/`),
    () => axiosInstance.post(`/months_calculation/${id}/delete`),
    () => axiosInstance.delete(`/months_calculation/${id}/`),
  ];
  let lastError: any;
  for (const run of attempts) {
    try {
      await run();
      return;
    } catch (e) {
      lastError = e;
      // 404/405/CSRF — пробуем следующий вариант
      continue;
    }
  }
  throw lastError;
}

export async function finishCalculation(id: number): Promise<void> {
  const attempts: Array<() => Promise<any>> = [
    () => axiosInstance.put(`/months_calculation/${id}/finish/`),
    () => axiosInstance.put(`/months_calculation/${id}/finish`),
    () => axiosInstance.post(`/months_calculation/${id}/finish/`),
    () => axiosInstance.post(`/months_calculation/${id}/finish`),
  ];
  let lastError: any;
  for (const run of attempts) {
    try { await run(); return; } catch (e) { lastError = e; continue; }
  }
  throw lastError;
}

export async function rejectCalculation(id: number): Promise<void> {
  const attempts: Array<() => Promise<any>> = [
    () => axiosInstance.put(`/months_calculation/${id}/reject/`),
    () => axiosInstance.put(`/months_calculation/${id}/reject`),
    () => axiosInstance.post(`/months_calculation/${id}/reject/`),
    () => axiosInstance.post(`/months_calculation/${id}/reject`),
  ];
  let lastError: any;
  for (const run of attempts) {
    try { await run(); return; } catch (e) { lastError = e; continue; }
  }
  throw lastError;
}

