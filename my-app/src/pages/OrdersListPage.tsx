import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchOrdersListThunk, setFilters, type OrdersFilters } from '../store/ordersListSlice';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';

function statusLabel(s: string) {
  switch (s) {
    case 'draft': return 'Черновик';
    case 'deleted': return 'Удалён';
    case 'submitted': return 'Сформирован';
    case 'finished': return 'Завершён';
    case 'rejected': return 'Отклонён';
    default: return s || '--';
  }
}

function formatDateTime(iso: string | null) {
  if (!iso) return '--';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function OrdersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, filters } = useSelector((s: RootState) => s.ordersList);

  useEffect(() => {
    dispatch(fetchOrdersListThunk(filters) as any);
  }, [dispatch, filters]);

  function onFiltersChange(patch: Partial<OrdersFilters>) {
    const next = { ...filters, ...patch };
    dispatch(setFilters(next));
  }

  return (
    <>
      <Breadcrumbs />
      <section className="container" style={{ marginTop: 24 }}>
        <h1 className="h1 text-center">Заявки</h1>
        <div className="row" style={{ marginTop: 12, marginBottom: 12 }}>
          <div className="col-12 col-md-4">
            Статус
            <select
              aria-label="status"
              className="form-select"
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value })}
            >
              <option value="">Любой статус</option>
              <option value="draft">Черновик</option>
              <option value="deleted">Удалён</option>
              <option value="submitted">Сформирован</option>
              <option value="finished">Завершён</option>
              <option value="rejected">Отклонён</option>
            </select>
          </div>
          <div className="col-12 col-md-4">
            Дата начала
            <input
              placeholder="Дата начала"
              title="Дата начала оформления"
              type="date"
              className="form-control"
              value={filters.submitted_from}
              onChange={(e) => onFiltersChange({ submitted_from: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-4">
            Дата окончания
            <input
              placeholder="Дата окончания"
              title="Дата окончания оформления"
              type="date"
              className="form-control"
              value={filters.submitted_to}
              onChange={(e) => onFiltersChange({ submitted_to: e.target.value })}
            />
          </div>
        </div>

        {loading && <p>Загрузка...</p>}
        {error && <p className="text-danger">{error}</p>}

        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Статус</th>
              <th>Дата создания</th>
              <th>Дата оформления</th>
              <th>Дата завершения</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} onClick={() => navigate(`/months_calculation/${o.id}`)} style={{ cursor: 'pointer' }}>
                <td>{o.id}</td>
                <td>{statusLabel(o.status)}</td>
                <td>{formatDateTime(o.created_at)}</td>
                <td>{formatDateTime(o.submitted_at)}</td>
                <td>{formatDateTime(o.finished_at)}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">Нет заявок</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}


