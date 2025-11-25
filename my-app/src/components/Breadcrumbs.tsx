import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface Props { currentTitle?: string }

export function Breadcrumbs({ currentTitle }: Props) {
  const location = useLocation();
  const params = useParams();
  const path = location.pathname;
  const q = useSelector((s: RootState) => s.filters.q);

  if (path === '/') {
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">Главная</li>
        </ol>
      </nav>
    );
  }

  if (path.startsWith('/months')) {
    const isList = path === '/months';
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
          {isList ? (
            <li className="breadcrumb-item active" aria-current="page">Месяцы</li>
          ) : null}
        </ol>
      </nav>
    );
  }

  if (path.startsWith('/month/')) {
    const id = params.id;
    const monthsLink = q ? `/months?q=${encodeURIComponent(q)}` : '/months';
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
          <li className="breadcrumb-item"><Link to={monthsLink}>Месяцы</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{currentTitle || `#${id}`}</li>
        </ol>
      </nav>
    );
  }

  if (path === '/months_calculations') {
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Заявки</li>
        </ol>
      </nav>
    );
  }

  if (path.startsWith('/months_calculation/')) {
    const id = params.id;
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Главная</a></li>
          <li className="breadcrumb-item active" aria-current="page">Заявка #{id}</li>
        </ol>
      </nav>
    );
  }

  return null;
}


