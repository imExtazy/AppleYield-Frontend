import type { ServiceMonth } from '../api/months';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { addToCalculation } from '../api/months';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartThunk } from '../store/cartSlice';
import type { RootState } from '../store';

interface Props {
  service: ServiceMonth;
}

export function ServiceCard({ service }: Props) {
  const [imgSrc, setImgSrc] = useState(service.image_url);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  async function onAdd() {
    setError(null);
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCalculation(service.month_id);
      dispatch(fetchCartThunk() as any);
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      if (status === 401 || status === 403) setError('Требуется вход');
      else setError(e?.message || 'Ошибка добавления');
    } finally {
      setAdding(false);
    }
  }

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
          <button className="ay-btn" onClick={onAdd} disabled={adding}>Добавить</button>
        </div>
        {error && <div className="text-danger" style={{ marginTop: 8, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
}


