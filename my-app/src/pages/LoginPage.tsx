import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { loginThunk } from '../store/authSlice';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await dispatch(loginThunk({ email, password }) as any);
    if ((res as any).meta.requestStatus === 'fulfilled') {
      navigate('/months');
    }
  }

  return (
    <>
      <Breadcrumbs />
      <div className="container" style={{ maxWidth: 480 }}>
        <h1>Вход</h1>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Пароль</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </>
  );
}


