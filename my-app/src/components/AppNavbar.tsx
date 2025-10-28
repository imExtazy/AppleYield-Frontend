import { MINIO_STATIC_BASE } from '../config';

export function AppNavbar() {
  return (
    <header className="ay-header">
      <a href="/" className="ay-home-link ay-home" aria-label="Домой">
        <img className="ay-home-logo" src={`${MINIO_STATIC_BASE}/Logo_Apple.png`} alt="AppleYield" width="100" height="100" onError={(e:any)=>{e.currentTarget.src='/vite.svg'}} />
        <span className="ay-home-title">AppleYield</span>
      </a>
    </header>
  );
}


