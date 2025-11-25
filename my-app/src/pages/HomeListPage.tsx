import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filters } from '../components/Filters';
import { getMonths } from '../api/months';
import type { ServiceMonth } from '../api/months';
import { ServiceCard } from '../components/ServiceCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MINIO_STATIC_BASE } from '../config';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setQ } from '../store/filtersSlice';
import { fetchCartThunk } from '../store/cartSlice';

export default function HomeListPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const qFromStore = useSelector((s: RootState) => s.filters.q);
  const cart = useSelector((s: RootState) => s.cart);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceMonth[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = params.get('q') || '';
    if (q !== qFromStore) dispatch(setQ(q));
    // Обновляем корзину при заходе на страницу
    dispatch(fetchCartThunk() as any);
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
            const hasDraft = !!cart.orderId && cart.itemsCount > 0;
            const className = `ay-cart-link ${hasDraft ? '' : 'ay-cart-disabled'}`.trim();
            const onClick = () => {
              if (hasDraft && cart.orderId) {
                navigate(`/months_calculation/${cart.orderId}`);
              }
            };
            return (
              <span className={className} aria-label={hasDraft ? 'Открыть заявку' : 'Заявка отсутствует'} onClick={onClick} style={{ cursor: hasDraft ? 'pointer' : 'default' }}>
                <img
                  className="ay-cart-icon"
                  src={src}
                  alt="Заявка"
                  onError={(e:any)=>{
                    const fallback = baseUrl('month_cart.svg');
                    if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                  }}
                />
                <span className="ay-badge">{cart.itemsCount || 0}</span>
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


