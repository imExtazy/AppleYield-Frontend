import { Link } from 'react-router-dom';
import type { ServiceMonth } from '../api/months';
import { addToCalculation } from '../api/months';
import { useState } from 'react';

interface Props {
  service: ServiceMonth;
}

export function ServiceCard({ service }: Props) {
  const [adding, setAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(service.image_url);

  async function onAdd() {
    try {
      setAdding(true);
      await addToCalculation(service.month_id);
      // опционально: всплывашка/стейт
    } catch (e) {
      // гость или ошибка — игнорируем без mock
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="ay-card">
      <div className="ay-card-inner">
        <img src={imgSrc} alt={service.month_name} onError={() => setImgSrc('/default_service.png')} />
        <h3>{service.month_name}</h3>
        <div className="ay-main">{service.main_value}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <a href={`/month/${service.month_id}/`} className="ay-btn-outline">Подробнее</a>
          <button className="ay-btn-add" onClick={onAdd} disabled={adding}>В расчет</button>
        </div>
      </div>
    </div>
  );
}


