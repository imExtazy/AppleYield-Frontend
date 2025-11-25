import { MINIO_STATIC_BASE } from '../config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchCartThunk, resetCart } from '../store/cartSlice';
import { logoutThunk, resetAuthState, fetchMeThunk } from '../store/authSlice';
import { reset as resetSearchFilters } from '../store/filtersSlice';
import { resetFilters as resetOrdersFilters } from '../store/ordersListSlice';

export function AppNavbar() {
  const isHosted = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  const baseUrl = (p: string) => {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    return `${base}${p}`;
  };
  const logoSrc = isHosted ? baseUrl('vite.svg') : `${MINIO_STATIC_BASE}/Logo_Apple.png`;
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth.user);
  const cart = useSelector((s: RootState) => s.cart);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMeThunk() as any);
    dispatch(fetchCartThunk() as any);
  }, [dispatch]);

  async function onLogout() {
    await dispatch(logoutThunk() as any);
    dispatch(resetAuthState());
    dispatch(resetCart());
    dispatch(resetSearchFilters());
    dispatch(resetOrdersFilters());
    // Сброс поисковых фильтров произойдёт на страницах через соответствующие действия
  }

  return (
    <header className="ay-header">
      <Link to="/" className="ay-home-link ay-home" aria-label="Домой">
        <img
          className="ay-home-logo"
          src={logoSrc}
          alt="AppleYield"
          width="100"
          height="100"
          onError={(e:any)=>{
            const fallback = baseUrl('vite.svg');
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
          }}
        />
        <span className="ay-home-title">AppleYield</span>
      </Link>
      <div className="ay-burger">
        <button
          className="ay-burger-btn"
          aria-label="Меню"
          aria-expanded={open}
          aria-controls="ay-burger-menu"
          onClick={() => setOpen(v => !v)}
        >
          <span className="ay-burger-line" />
          <span className="ay-burger-line" />
          <span className="ay-burger-line" />
        </button>
        {open && (
          <nav id="ay-burger-menu" className="ay-burger-menu" role="menu">
            <Link role="menuitem" className="ay-burger-item" to="/" onClick={() => setOpen(false)}>Главная</Link>
            <Link role="menuitem" className="ay-burger-item" to="/months" onClick={() => setOpen(false)}>Месяцы</Link>
            <Link role="menuitem" className="ay-burger-item" to="/months_calculations" onClick={() => setOpen(false)}>Заявки</Link>
            <div className="ay-burger-divider" />
            {cart.orderId ? (
              <Link role="menuitem" className="ay-burger-item" to={`/months_calculation/${cart.orderId}`} onClick={() => setOpen(false)}>
                Черновик ({cart.itemsCount})
              </Link>
            ) : (
              <span role="menuitem" className="ay-burger-item ay-cart-disabled">Черновик (0)</span>
            )}
            <div className="ay-burger-divider" />
            {!auth ? (
              <>
                <Link role="menuitem" className="ay-burger-item" to="/login" onClick={() => setOpen(false)}>Вход</Link>
                <Link role="menuitem" className="ay-burger-item" to="/register" onClick={() => setOpen(false)}>Регистрация</Link>
              </>
            ) : (
              <>
                <Link role="menuitem" className="ay-burger-item" to="/profile" onClick={() => setOpen(false)}>
                  {auth.first_name || auth.last_name ? `${auth.first_name} ${auth.last_name}`.trim() : auth.email}
                </Link>
                <button role="menuitem" className="ay-burger-item" onClick={() => { onLogout(); setOpen(false); }}>
                  Выход
                </button>
              </>
            )}
          </nav>
        )}
      </div>
      <nav className="ay-nav" style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center', paddingRight: 8 }}>
        <button
          className="ay-nav-link"
          style={{ textDecoration: location.pathname.startsWith('/months_calculations') ? 'underline' : 'none' }}
          onClick={() => navigate('/months_calculations')}
        >
          Заявки
        </button>
        <button
          className="ay-nav-link"
          style={{ textDecoration: location.pathname === '/months' || location.pathname.startsWith('/month/') ? 'underline' : 'none' }}
          onClick={() => navigate('/months')}
        >
          Месяцы
        </button>
        {!auth ? (
          <>
            <button
              className="ay-nav-link"
              style={{ textDecoration: location.pathname === '/register' ? 'underline' : 'none' }}
              onClick={() => navigate('/register')}
            >
              Регистрация
            </button>
            <button
              className="ay-nav-link"
              style={{ textDecoration: location.pathname === '/login' ? 'underline' : 'none' }}
              onClick={() => navigate('/login')}
            >
              Вход
            </button>
          </>
        ) : (
          <>
            <button
              className="ay-nav-link"
              style={{ textDecoration: location.pathname === '/profile' ? 'underline' : 'none' }}
              onClick={() => navigate('/profile')}
              title={auth.email}
            >
              Профиль
            </button>
            <button className="ay-nav-link" onClick={onLogout}>Выход</button>
          </>
        )}
      </nav>
    </header>
  );
}


