import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import type { CalculationDetail } from '../api/calculation.ts';
import { deleteItem, getCalculation, updateCalculation, updateItem } from '../api/calculation';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function CalculationPage() {
  const { id } = useParams();
  const [data, setData] = useState<CalculationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const parsed = Number(id);
    setLoading(true);
    setError(null);
    getCalculation(parsed)
      .then((d) => setData(d))
      .catch((e: any) => setError(e.status === 401 || e.status === 403 ? 'Требуется вход' : e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p>Не найдено</p>;

  async function onMetaChange(field: 'location' | 'person', value: string) {
    if (!data) return;
    const updated = await updateCalculation(data.id, { ...data, [field]: value } as any);
    setData(updated);
  }

  async function onItemChange(serviceId: number, patch: { sum_precipitation?: number; avg_temp?: number; comment?: string; }) {
    if (!data) return;
    const item = await updateItem(data.id, serviceId, patch);
    setData({ ...data, items: data.items.map((it) => it.service.month_id === serviceId ? item : it) });
  }

  async function onDelete(serviceId: number) {
    if (!data) return;
    await deleteItem(data.id, serviceId);
    setData({ ...data, items: data.items.filter((it) => it.service.month_id !== serviceId) });
  }

  return (
    <>
      <Breadcrumbs />
      <section className="ay-app-head">
        <h1 className="ay-app-title">Заявка #{data.id}</h1>
        <div className="ay-app-subtitle">Позиций: {data.items.length}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Form.Label>
            Локация
            <Form.Select
              className="ay-input-lg"
              value={data.location}
              onChange={(e) => onMetaChange('location', e.target.value)}
            >
              <option value="moscow">Москва</option>
              <option value="spb">Санкт-Петербург</option>
              <option value="kazan">Казань</option>
            </Form.Select>
          </Form.Label>
          <Form.Label>
            Ответственный
            <Form.Select
              className="ay-input-lg"
              value={data.person}
              onChange={(e) => onMetaChange('person', e.target.value)}
            >
              <option value="ivanov">Иванов И.И.</option>
              <option value="petrov">Петров П.П.</option>
              <option value="sidorov">Сидоров С.С.</option>
            </Form.Select>
          </Form.Label>
        </div>
      </section>

      <div className="ay-app-list">
        {data.items.map((p) => (
          <div key={p.service.month_id} className="ay-app-item">
            <img className="ay-app-thumb" src={p.service.image_url} alt={p.service.month_name} />
            <div className="ay-app-row">
              <div className="ay-app-cell-name">{p.service.month_name}</div>
              <div className="ay-app-cell-main">{p.service.main_value}</div>
              <div className="ay-app-cell-precip">
                <Form.Control
                  className="ay-input-lg ay-app-input"
                  type="number"
                  step="0.01"
                  value={p.sum_precipitation}
                  onChange={(e) => onItemChange(p.service.month_id, { sum_precipitation: Number(e.target.value) })}
                />
              </div>
              <div className="ay-app-cell-temp">
                <Form.Control
                  className="ay-input-lg ay-app-input"
                  type="number"
                  step="0.01"
                  value={p.avg_temp}
                  onChange={(e) => onItemChange(p.service.month_id, { avg_temp: Number(e.target.value) })}
                />
              </div>
              <div className="ay-app-cell-comment">
                <Form.Control
                  as="textarea"
                  className="ay-textarea"
                  value={p.comment}
                  onChange={(e) => onItemChange(p.service.month_id, { comment: e.target.value })}
                />
              </div>
              <button className="ay-btn ay-btn-sm" onClick={() => onDelete(p.service.month_id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      <div className="ay-app-result">Урожайность: {data.result_value ?? '-'} ц/га</div>
    </>
  );
}


