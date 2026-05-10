import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* LEFT PANEL */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logo}>S</div>
          <h1 className={styles.heroTitle}>SDM Yayasan</h1>
          <p className={styles.heroSub}>
            Sistem Manajemen Sumber Daya Manusia<br />yang terintegrasi dan efisien.
          </p>
          <div className={styles.stats}>
            {[['4', 'Unit'], ['∞', 'SDM'], ['100%', 'Aman']].map(([val, label]) => (
              <div key={label} className={styles.stat}>
                <span className={styles.statVal}>{val}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.right}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Selamat Datang</h2>
            <p className={styles.cardSub}>Masuk ke akun Anda</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="admin@sdm.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
