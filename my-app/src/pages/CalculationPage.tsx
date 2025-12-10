import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import type { CalculationDetail } from '../api/calculation';
import { deleteCalculation, deleteItem, getCalculation, submitCalculation, updateCalculation, updateItem } from '../api/calculation';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useDispatch } from 'react-redux';
import { fetchCartThunk } from '../store/cartSlice';
// no external assets here

export default function CalculationPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState<CalculationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [draftMap, setDraftMap] = useState<Record<number, { sum_precipitation: string; avg_temp: string; comment: string }>>({});

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

  // Инициализация локальных черновиков значений при загрузке/обновлении заявки
  useEffect(() => {
    if (!data) return;
    setDraftMap((prev) => {
      const next: Record<number, { sum_precipitation: string; avg_temp: string; comment: string }> = {};
      for (const it of data.items) {
        const id = it.service.month_id;
        const prevDraft = prev[id];
        const dataSum = typeof it.sum_precipitation === 'number' ? String(it.sum_precipitation) : '';
        const dataAvg = typeof it.avg_temp === 'number' ? String(it.avg_temp) : '';
        const dataComment = it.comment || '';
        const prevSum = prevDraft?.sum_precipitation;
        const prevAvg = prevDraft?.avg_temp;
        const prevComment = prevDraft?.comment;
        next[id] = {
          // Никогда не перезатираем локальный ввод (даже если пустая строка) данными с сервера
          sum_precipitation: prevSum !== undefined ? prevSum : dataSum,
          avg_temp: prevAvg !== undefined ? prevAvg : dataAvg,
          comment: prevComment !== undefined ? prevComment : dataComment,
        };
      }
      return next;
    });
  }, [data]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p>Не найдено</p>;

  function setDraftField(
    serviceId: number,
    field: 'sum_precipitation' | 'avg_temp' | 'comment',
    value: string,
  ) {
    setDraftMap((prev) => ({
      ...prev,
      [serviceId]: {
        sum_precipitation: prev[serviceId]?.sum_precipitation ?? '',
        avg_temp: prev[serviceId]?.avg_temp ?? '',
        comment: prev[serviceId]?.comment ?? '',
        [field]: value,
      },
    }));
  }

  function parseNumberInput(value: string): number | null {
    if (value == null) return null;
    const trimmed = String(value).trim().replace(',', '.');
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  async function onMetaChange(field: 'location' | 'person', value: string) {
    if (!data) return;
    setData({ ...data, [field]: value } as any);
  }

  async function onDelete(serviceId: number) {
    if (!data) return;
    await deleteItem(data.id, serviceId);
    setData({ ...data, items: data.items.filter((it) => it.service.month_id !== serviceId) });
  }

  async function onSubmitDraft() {
    if (!data) return;
    setSubmitting(true);
    try {
      const updated = await submitCalculation(data.id);
      setData(updated);
      dispatch(fetchCartThunk() as any);
    } catch (e: any) {
      setError(e?.message || 'Ошибка подтверждения');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSaveMeta() {
    if (!data) return;
    setMetaSaving(true);
    setError(null);
    try {
      const updated = await updateCalculation(data.id, { location: data.location, person: data.person } as any);
      setData(updated);
    } catch (e: any) {
      setError(e?.message || 'Не удалось сохранить');
    } finally {
      setMetaSaving(false);
    }
  }

  async function onSaveItem(serviceId: number) {
    if (!data) return;
    const item = data.items.find((it) => it.service.month_id === serviceId);
    if (!item) return;
    setSavingItemId(serviceId);
    setError(null);
    try {
      const draft = draftMap[serviceId] || { sum_precipitation: '', avg_temp: '', comment: '' };
      const sum_prec = parseNumberInput(draft.sum_precipitation);
      const avg_temp = parseNumberInput(draft.avg_temp);
      const payload: Partial<{ sum_precipitation: number; avg_temp: number; comment: string }> = {
        comment: draft.comment ?? '',
      };
      if (sum_prec != null) payload.sum_precipitation = sum_prec;
      if (avg_temp != null) payload.avg_temp = avg_temp;
      const saved = await updateItem(data.id, serviceId, payload);
      setData({
        ...data,
        items: data.items.map((it) => (it.service.month_id === serviceId ? saved : it)),
      });
      // синхронизируем локальный драфт с сохранёнными значениями
      setDraftMap((prev) => ({
        ...prev,
        [serviceId]: {
          // Оставляем числа такими, как ввёл пользователь; комментарий берём с сервера
          sum_precipitation: prev[serviceId]?.sum_precipitation ?? (typeof saved.sum_precipitation === 'number' ? String(saved.sum_precipitation) : ''),
          avg_temp: prev[serviceId]?.avg_temp ?? (typeof saved.avg_temp === 'number' ? String(saved.avg_temp) : ''),
          comment: saved.comment || '',
        },
      }));
    } catch (e: any) {
      setError(e?.message || 'Не удалось сохранить позицию');
    } finally {
      setSavingItemId(null);
    }
  }

  async function onDeleteCalculation() {
    if (!data) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCalculation(data.id);
      dispatch(fetchCartThunk() as any);
      navigate('/months');
    } catch (e: any) {
      setDeleting(false);
      setError(e?.message || 'Не удалось удалить заявку');
    }
  }

  return (
    <>
      <Breadcrumbs />
      <section className="ay-app-head">
        <h1 className="ay-app-title">Заявка #{data.id}</h1>
        <div className="ay-app-subtitle">Позиций: {data.items.length}</div>
        {data.items.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Form.Label>
              Локация
              <Form.Select
                className="ay-input-lg"
                value={data.location}
                onChange={(e) => onMetaChange('location', e.target.value)}
                disabled={data.status !== 'draft'}
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
                disabled={data.status !== 'draft'}
              >
                <option value="ivanov">Иванов И.И.</option>
                <option value="petrov">Петров П.П.</option>
                <option value="sidorov">Сидоров С.С.</option>
              </Form.Select>
            </Form.Label>
            {data.status === 'draft' && (
              <button className="ay-btn ay-btn-sm" onClick={onSaveMeta} disabled={metaSaving}>
                {metaSaving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            )}
          </div>
        )}
      </section>

      {data.items.length > 0 && (
        <div className="ay-app-header">
          <div className="ay-app-thumb-spacer" />
          <div className="ay-app-row ay-app-row-header">
            <div className="ay-app-cell-name">Месяц</div>
            <div className="ay-app-cell-main">Описание</div>
            <div className="ay-app-cell-precip"><span>Осадки</span></div>
            <div className="ay-app-cell-temp"><span>Температура</span></div>
            <div className="ay-app-cell-comment"><span>Комментарий</span></div>
          </div>
        </div>
      )}

      <div className="ay-app-list">
        {data.items.length === 0 ? (
          <p className="muted">В заявке нет позиций.</p>
        ) : (
          data.items.map((p) => (
            <div key={p.service.month_id} className="ay-app-item-wrap">
              <div className="ay-app-item">
                <img className="ay-app-thumb" src={p.service.image_url} alt={p.service.month_name} />
                <div className="ay-app-row">
                  <div className="ay-app-cell-name">{p.service.month_name}</div>
                  <div className="ay-app-cell-main">{p.service.main_value}</div>
                  <div className="ay-app-cell-precip">
                    <Form.Control
                      className="ay-input-lg ay-app-input"
                      type="text"
                      inputMode="decimal"
                      value={draftMap[p.service.month_id]?.sum_precipitation ?? (typeof p.sum_precipitation === 'number' ? String(p.sum_precipitation) : '')}
                      onChange={(e) => setDraftField(p.service.month_id, 'sum_precipitation', e.target.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      disabled={data.status !== 'draft'}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="ay-app-cell-temp">
                    <Form.Control
                      className="ay-input-lg ay-app-input"
                      type="text"
                      inputMode="decimal"
                      value={draftMap[p.service.month_id]?.avg_temp ?? (typeof p.avg_temp === 'number' ? String(p.avg_temp) : '')}
                      onChange={(e) => setDraftField(p.service.month_id, 'avg_temp', e.target.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      disabled={data.status !== 'draft'}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="ay-app-cell-comment">
                    <Form.Control
                      as="textarea"
                      className="ay-textarea"
                      value={draftMap[p.service.month_id]?.comment ?? (p.comment || '')}
                      onChange={(e) => setDraftField(p.service.month_id, 'comment', e.target.value)}
                      disabled={data.status !== 'draft'}
                    />
                  </div>
                </div>
              </div>
              {data.status === 'draft' && (
                <div className="ay-app-actions-right">
                  <button
                    className="ay-btn ay-btn-sm"
                    onClick={() => onSaveItem(p.service.month_id)}
                    disabled={savingItemId === p.service.month_id}
                  >
                    {savingItemId === p.service.month_id ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                  <button
                    className="ay-btn ay-btn-sm"
                    onClick={() => onDelete(p.service.month_id)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {data.status === 'draft' && (
        <div className="ay-actions">
          <button className="ay-btn" onClick={onDeleteCalculation} disabled={deleting}>
            {deleting ? 'Удаляем...' : 'Удалить заявку'}
          </button>
          <button className="ay-btn" onClick={onSubmitDraft} disabled={submitting}>
            {submitting ? 'Отправляем...' : 'Подтвердить заявку'}
          </button>
        </div>
      )}

      {data.status === 'finished' && data.result_value != null && (
        <div className="ay-app-result">Урожайность: {data.result_value} ц/га</div>
      )}
    </>
  );
}


