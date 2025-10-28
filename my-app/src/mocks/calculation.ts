import type { CalculationDetail, CartInfo } from '../api/calculation';
import { MOCK_MONTHS } from './months';

export const MOCK_CART: CartInfo = {
  order_id: 101,
  items_count: 2,
};

export function MOCK_CALCULATION_DETAIL(id: number): CalculationDetail {
  return {
    id,
    status: 'draft',
    created_at: new Date().toISOString(),
    submitted_at: null,
    finished_at: null,
    location: 'moscow',
    person: 'ivanov',
    result_value: null,
    items: [
      {
        service: MOCK_MONTHS[0],
        sum_precipitation: 0,
        avg_temp: 0,
        comment: '',
      },
      {
        service: MOCK_MONTHS[1],
        sum_precipitation: 0,
        avg_temp: 0,
        comment: '',
      },
    ],
  };
}


