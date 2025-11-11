import type { ServiceMonth } from '../api/months';
const DEFAULT_IMG = (() => {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}default_img.jpeg`;
})();

export const MOCK_MONTHS: ServiceMonth[] = [
  {
    month_id: 1,
    month_name: 'Январь',
    main_value: 'Темп: -5°C\nОсадки: 30 мм',
    image_url: DEFAULT_IMG,
  },
  {
    month_id: 2,
    month_name: 'Февраль',
    main_value: 'Темп: -3°C\nОсадки: 25 мм',
    image_url: DEFAULT_IMG,
  },
  {
    month_id: 3,
    month_name: 'Март',
    main_value: 'Темп: +2°C\nОсадки: 28 мм',
    image_url: DEFAULT_IMG,
  },
];

export function MOCK_MONTH_BY_ID(id: number): ServiceMonth {
  return (
    MOCK_MONTHS.find((m) => m.month_id === id) || {
      month_id: id,
      month_name: `Месяц #${id}`,
      main_value: 'Нет данных',
      image_url: DEFAULT_IMG,
    }
  );
}


