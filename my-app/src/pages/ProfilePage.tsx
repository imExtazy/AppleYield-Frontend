import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { changePasswordThunk, fetchMeThunk, updateMeThunk } from '../store/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s: RootState) => s.auth);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) dispatch(fetchMeThunk() as any);
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    const res = await dispatch(updateMeThunk({ email, first_name: firstName, last_name: lastName }) as any);
    if ((res as any).meta.requestStatus === 'fulfilled') {
      setSuccessMsg('Профиль обновлён');
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    const res = await dispatch(changePasswordThunk({ old_password: oldPassword, new_password: newPassword }) as any);
    if ((res as any).meta.requestStatus === 'fulfilled') {
      setSuccessMsg('Пароль изменён');
      setOldPassword('');
      setNewPassword('');
    }
  }

  return (
    <>
      <Breadcrumbs />
      <div className="container" style={{ maxWidth: 640 }}>
        <h1>Личный кабинет</h1>
        {error && <p className="text-danger">{error}</p>}
        {successMsg && <p className="text-success">{successMsg}</p>}
        <form onSubmit={onSaveProfile} className="mb-4">
          <h3>Профиль</h3>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Имя</label>
            <input className="form-control" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Фамилия</label>
            <input className="form-control" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>

        <form onSubmit={onChangePassword}>
          <h3>Смена пароля</h3>
          <div className="mb-3">
            <label className="form-label">Старый пароль</label>
            <input className="form-control" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Новый пароль</label>
            <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button className="btn btn-secondary" type="submit" disabled={loading}>
            {loading ? 'Отправляем...' : 'Сменить пароль'}
          </button>
        </form>
      </div>
    </>
  );
}


