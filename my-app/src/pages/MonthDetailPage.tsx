import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMonth } from '../api/months';
import type { ServiceMonth } from '../api/months';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function MonthDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ServiceMonth | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const parsed = Number(id);
    setLoading(true);
    setError(null);
    getMonth(parsed)
      .then((d) => { setData(d); setImgSrc(d.image_url); })
      .catch((e: any) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p>Не найдено</p>;

  return (
    <>
      <Breadcrumbs currentTitle={data.month_name} />
      <div className="ay-detail-card">
        <img
          className="ay-detail-image"
          src={imgSrc || ''}
          alt={data.month_name}
          onError={() => {
            const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
            const fallback = `${base}default_img.jpeg`;
            if (imgSrc !== fallback) setImgSrc(fallback);
          }}
        />
        <div className="ay-detail-info-wrapper">
          <div className="ay-detail-info">
            <h1 className="ay-detail-title">{data.month_name}</h1>
            <div className="ay-detail-description">{data.main_value}</div>
          </div>
        </div>
      </div>
    </>
  );
}


