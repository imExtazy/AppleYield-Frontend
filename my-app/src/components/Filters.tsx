import { Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Filters() {
  const [params] = useSearchParams();
  const [q, setQ] = useState<string>(params.get('q') || '');
  const navigate = useNavigate();

  useEffect(() => {
    setQ(params.get('q') || '');
  }, [params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const search = new URLSearchParams();
    if (q) search.set('q', q);
    navigate({ pathname: '/', search: search.toString() });
  };

  return (
    <Form onSubmit={onSubmit} className="ay-search-form">
      <Form.Control
        className="ay-input-sm"
        type="text"
        placeholder="Поиск по наименованию"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button type="submit" className="ay-btn-sm">Найти</Button>
    </Form>
  );
}


