import { httpRequest, isNetworkError } from './httpClient';
import { MOCK_MONTHS, MOCK_MONTH_BY_ID } from '../mocks/months.ts';

export interface ServiceMonth {
  month_id: number;
  month_name: string;
  description: string;
  main_value: string;
  image_url: string;
}

export async function getMonths(q: string = ''): Promise<ServiceMonth[]> {
  try {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    const raw = await httpRequest<any[]>(`/api/months/${query}`);
    // Нормализуем возможные расхождения бэка: description vs descriptions
    return (raw || []).map((m: any) => ({
      month_id: m.month_id ?? m.id ?? m.monthId,
      month_name: m.month_name ?? m.name ?? '',
      description: m.description ?? m.descriptions ?? '',
      main_value: m.main_value ?? m.mainValue ?? '',
      image_url: m.image_url ?? m.imageUrl ?? '',
    })) as ServiceMonth[];
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
    const m = await httpRequest<any>(`/api/months/${id}/`);
    return {
      month_id: m.month_id ?? m.id ?? m.monthId,
      month_name: m.month_name ?? m.name ?? '',
      description: m.description ?? m.descriptions ?? '',
      main_value: m.main_value ?? m.mainValue ?? '',
      image_url: m.image_url ?? m.imageUrl ?? '',
    } as ServiceMonth;
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


