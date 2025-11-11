import { MINIO_STATIC_BASE } from '../config';
import { Link } from 'react-router-dom';

export function AppNavbar() {
  const isHosted = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  const baseUrl = (p: string) => {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    return `${base}${p}`;
  };
  const logoSrc = isHosted ? baseUrl('vite.svg') : `${MINIO_STATIC_BASE}/Logo_Apple.png`;

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
    </header>
  );
}


