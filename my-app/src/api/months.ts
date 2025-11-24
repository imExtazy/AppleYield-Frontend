import { httpRequest, isNetworkError } from './httpClient';
import { MOCK_MONTHS, MOCK_MONTH_BY_ID } from '../mocks/months.ts';

export interface ServiceMonth {
  month_id: number;
  month_name: string;
  main_value: string;
  image_url: string;
}

export async function getMonths(q: string = ''): Promise<ServiceMonth[]> {
  try {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return await httpRequest<ServiceMonth[]>(`/api/months/${query}`);
  } catch (e) {
    const status = (e as any)?.status as number | undefined;
    if (isNetworkError(e) || (typeof status === 'number' && status >= 400)) {
      const qLower = (q || '').trim().toLowerCase();
      const data = MOCK_MONTHS;
      if (!qLower) return data;
      return data.filter(m => m.month_name.toLowerCase().includes(qLower));
    }
    throw e;
  }
}

export async function getMonth(id: number): Promise<ServiceMonth> {
  try {
    return await httpRequest<ServiceMonth>(`/api/months/${id}/`);
  } catch (e) {
    const status = (e as any)?.status as number | undefined;
    if (isNetworkError(e) || (typeof status === 'number' && status >= 400)) {
      return MOCK_MONTH_BY_ID(id);
    }
    throw e;
  }
}

export async function addToCalculation(id: number): Promise<{ order_id: number } | undefined> {
  try {
    return await httpRequest<{ order_id: number }>(`/api/months/${id}/add/`, { method: 'POST' });
  } catch (e) {
    // В гостевом режиме 401/403 — пробрасываем дальше, mock не используем
    throw e;
  }
}


