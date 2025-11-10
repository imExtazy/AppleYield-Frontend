import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filters } from '../components/Filters';
import { getMonths } from '../api/months';
import type { ServiceMonth } from '../api/months';
import { ServiceCard } from '../components/ServiceCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MINIO_STATIC_BASE } from '../config';

export default function HomeListPage() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceMonth[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = params.get('q') || '';
    setLoading(true);
    setError(null);
    getMonths(q)
      .then((data) => setItems(data))
      .catch((e: any) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [params]);



  return (
    <>
      <Breadcrumbs />
      <section className="ay-hero">
        <div className="ay-hero-head">
          <div className="ay-hero-spacer"></div>
          <h1 className="ay-hero-title">Услуги для расчета урожайности антоновки</h1>
          <span className="ay-cart-link ay-cart-disabled" aria-label="Заявка отсутствует">
            <img className="ay-cart-icon" src={`${MINIO_STATIC_BASE}/month_cart.svg`} alt="Заявка" onError={(e:any)=>{e.currentTarget.src='/month_cart.svg'}} />
            <span className="ay-badge">0</span>
          </span>
        </div>
        <div className="ay-search-center">
          <Filters />
        </div>
      </section>

      {loading && <p>Загрузка...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="ay-grid-3">
        {items.map((s) => (
          <ServiceCard key={s.month_id} service={s} />
        ))}
        {!loading && items.length === 0 && <p className="muted">Ничего не найдено.</p>}
      </div>
    </>
  );
}


