import { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { axiosInstance } from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginThunk } from '../store/authSlice';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axiosInstance.post('/user/', { email, password });
      // Автовход после регистрации
      const res = await dispatch(loginThunk({ email, password }) as any);
      if ((res as any).meta.requestStatus === 'fulfilled') {
        navigate('/months');
      } else {
        navigate('/login');
      }
    } catch (e: any) {
      const message = e?.response?.data?.detail || e?.message || 'Ошибка регистрации';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Breadcrumbs />
      <div className="container" style={{ maxWidth: 480 }}>
        <h1>Регистрация</h1>
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
            {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </>
  );
}


