import { Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setQ, reset } from '../store/filtersSlice';

export function Filters() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const qFromStore = useSelector((s: RootState) => s.filters.q);
  const [q, setQLocal] = useState<string>(params.get('q') || qFromStore || '');
  const navigate = useNavigate();

  useEffect(() => {
    const newQ = params.get('q') || '';
    setQLocal(newQ);
    if (newQ !== qFromStore) dispatch(setQ(newQ));
  }, [params, qFromStore, dispatch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setQ(q));
    const search = new URLSearchParams();
    if (q) search.set('q', q);
    navigate({ pathname: '/months', search: search.toString() });
  };

  const onReset = () => {
    setQLocal('');
    dispatch(reset());
    navigate({ pathname: '/months', search: '' });
  };

  return (
    <Form onSubmit={onSubmit} className="ay-search-form">
      <Form.Control
        className="ay-input-sm"
        type="text"
        placeholder="Поиск по наименованию"
        value={q}
        onChange={(e) => setQLocal(e.target.value)}
      />
      <Button type="submit" className="ay-btn-sm">Найти</Button>
      {q && (
        <Button type="button" className="ay-btn-sm" onClick={onReset}>
          Сбросить
        </Button>
      )}
    </Form>
  );
}


