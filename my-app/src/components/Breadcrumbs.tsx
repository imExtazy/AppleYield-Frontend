import { Link, useLocation, useParams } from 'react-router-dom';

interface Props { currentTitle?: string }

export function Breadcrumbs({ currentTitle }: Props) {
  const location = useLocation();
  const params = useParams();
  const path = location.pathname;

  if (path === '/') {
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Главная</a></li>
          <li className="breadcrumb-item active" aria-current="page">Месяцы</li>
        </ol>
      </nav>
    );
  }

  if (path.startsWith('/month/')) {
    const id = params.id;
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: 12 }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Главная</a></li>
          <li className="breadcrumb-item"><a href="/">Месяцы</a></li>
          <li className="breadcrumb-item active" aria-current="page">{currentTitle || `#${id}`}</li>
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


