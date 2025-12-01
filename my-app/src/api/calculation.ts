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
    return await httpRequest<CalculationDetail>(`/api/months_calculation/${id}/`);
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
  return await httpRequest<MonthIndicator>(`/api/months_calculation/${orderId}/month_indicators/${serviceId}/`, {
    method: 'PUT',
    body: payload,
  });
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


