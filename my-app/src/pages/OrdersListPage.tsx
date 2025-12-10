import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchOrdersListThunk, setFilters, type OrdersFilters } from '../store/ordersListSlice';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { finishCalculation, rejectCalculation } from '../api/calculation';

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

function statusClass(s: string) {
  switch (s) {
    case 'draft': return 'ay-status-draft';
    case 'deleted': return 'ay-status-deleted';
    case 'submitted': return 'ay-status-submitted';
    case 'finished': return 'ay-status-finished';
    case 'rejected': return 'ay-status-rejected';
    default: return '';
  }
}

export default function OrdersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, filters } = useSelector((s: RootState) => s.ordersList);
  const auth = useSelector((s: RootState) => s.auth.user);
  const isModerator = !!(auth && ((auth as any).is_staff || (auth as any).is_superuser));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createdByQ, setCreatedByQ] = useState<string>(''); // фильтрация по создателю (только фронт)

  useEffect(() => {
    dispatch(fetchOrdersListThunk(filters) as any);
  }, [dispatch, filters]);

  // Short polling для актуальных статусов
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) dispatch(fetchOrdersListThunk(filters) as any);
    }, 5000);
    return () => clearInterval(id);
  }, [dispatch, filters]);
  function onFiltersChange(patch: Partial<OrdersFilters>) {
    const next = { ...filters, ...patch };
    dispatch(setFilters(next));
  }

  const displayedItems = (() => {
    const q = (createdByQ || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.created_by_email || '').toLowerCase().includes(q));
  })();

  return (
    <>
      <Breadcrumbs />
      <section className="container" style={{ marginTop: 24 }}>
        <h1 className="h1 text-center">Заявки</h1>
        {isModerator && selectedId != null && (() => {
          const current = items.find(i => i.id === selectedId);
          if (!current || current.status !== 'submitted') return null;
          return (
            <div className="ay-table-actions">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="ay-table-actions-title">Заявка № {current.id}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="ay-btn ay-btn-sm"
                    onClick={async () => {
                      await finishCalculation(current.id);
                      setSelectedId(null);
                      dispatch(fetchOrdersListThunk(filters) as any);
                    }}
                  >
                    Подтвердить
                  </button>
                  <button
                    className="ay-btn ay-btn-sm"
                    onClick={async () => {
                      await rejectCalculation(current.id);
                      setSelectedId(null);
                      dispatch(fetchOrdersListThunk(filters) as any);
                    }}
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
        <div className="row" style={{ marginTop: 12, marginBottom: 12 }}>
          {/** одинаковая ширина колонок: у модератора 4x3, у пользователя 3x4 */}
          <div className={isModerator ? 'col-12 col-md-3' : 'col-12 col-md-4'}>
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
          <div className={isModerator ? 'col-12 col-md-3' : 'col-12 col-md-4'}>
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
          <div className={isModerator ? 'col-12 col-md-3' : 'col-12 col-md-4'}>
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
          {isModerator && (
            <div className="col-12 col-md-3">
              Создатель
              <input
                placeholder="email создателя"
                title="Фильтр по email создателя (фронтенд)"
                type="text"
                className="form-control"
                value={createdByQ}
                onChange={(e) => setCreatedByQ(e.target.value)}
              />
            </div>
          )}
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
              <th>Результат</th>
              <th>Создатель</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((o) => {
              const showSelect = isModerator && o.status === 'submitted';
              return (
                <tr
                  key={o.id}
                  onClick={() => {
                    if (showSelect) {
                      setSelectedId(prev => (prev === o.id ? null : o.id));
                    } else {
                      navigate(`/months_calculation/${o.id}`);
                    }
                  }}
                  style={{ cursor: 'pointer', background: selectedId === o.id ? '#f7f7f7' : undefined }}
                >
                  <td>{o.id}</td>
                  <td><span className={`ay-status-pill ${statusClass(o.status)}`}>{statusLabel(o.status)}</span></td>
                  <td>{formatDateTime(o.created_at)}</td>
                  <td>{formatDateTime(o.submitted_at)}</td>
                  <td>{formatDateTime(o.finished_at)}</td>
                  <td>{o.result_value ?? '--'}</td>
                  <td>{o.created_by_email ?? '--'}</td>
                </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">Нет заявок</td>
              </tr>
            )}
          </tbody>
        </table>

        
      </section>
    </>
  );
}


