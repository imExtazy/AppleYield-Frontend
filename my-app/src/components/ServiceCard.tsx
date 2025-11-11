import type { ServiceMonth } from '../api/months';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface Props {
  service: ServiceMonth;
}

export function ServiceCard({ service }: Props) {
  const [imgSrc, setImgSrc] = useState(service.image_url);

  return (
    <div className="ay-card">
      <div className="ay-card-inner">
        <img
          src={imgSrc}
          alt={service.month_name}
          onError={() => {
            const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
            const fallback = `${base}default_img.jpeg`;
            if (imgSrc !== fallback) setImgSrc(fallback);
          }}
        />
        <h3>{service.month_name}</h3>
        <div className="ay-main">{service.main_value}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Link to={`/month/${service.month_id}`} className="ay-btn-outline">Подробнее</Link>
        </div>
      </div>
    </div>
  );
}


