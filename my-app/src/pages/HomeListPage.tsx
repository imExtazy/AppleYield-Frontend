import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filters } from '../components/Filters';
import { getMonths } from '../api/months';
import type { ServiceMonth } from '../api/months';
import { ServiceCard } from '../components/ServiceCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MINIO_STATIC_BASE } from '../config';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setQ } from '../store/filtersSlice';

export default function HomeListPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const qFromStore = useSelector((s: RootState) => s.filters.q);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceMonth[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = params.get('q') || '';
    if (q !== qFromStore) dispatch(setQ(q));
    setLoading(true);
    setError(null);
    getMonths(q)
      .then((data) => setItems(data))
      .catch((e: any) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [params, qFromStore, dispatch]);



  return (
    <>
      <Breadcrumbs />
      <section className="ay-hero">
        <div className="ay-hero-head">
          <div className="ay-hero-spacer"></div>
          <h1 className="ay-hero-title">Услуги для расчета урожайности антоновки</h1>
          {(() => {
            const isHosted = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
            const baseUrl = (p: string) => {
              const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
              return `${base}${p}`;
            };
            const src = isHosted ? baseUrl('month_cart.svg') : `${MINIO_STATIC_BASE}/month_cart.svg`;
            return (
              <span className="ay-cart-link ay-cart-disabled" aria-label="Заявка отсутствует">
                <img
                  className="ay-cart-icon"
                  src={src}
                  alt="Заявка"
                  onError={(e:any)=>{
                    const fallback = baseUrl('month_cart.svg');
                    if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                  }}
                />
                <span className="ay-badge">0</span>
              </span>
            );
          })()}
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


