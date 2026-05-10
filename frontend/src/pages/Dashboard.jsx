import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';
import styles from './Dashboard.module.css';

const UNIT_COLORS = ['#2563b0','#f59e0b','#10b981','#ef4444'];
const UNITS = ['Yayasan','SMP','SD','TK'];

export default function Dashboard() {
  const [sdmList, setSdmList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sdm').then(r => { setSdmList(r.data); setLoading(false); })
       .catch(() => setLoading(false));
  }, []);

  // Statistik
  const total     = sdmList.length;
  const lakiLaki  = sdmList.filter(s => s.jenis_kelamin === 'Laki-laki').length;
  const perempuan = sdmList.filter(s => s.jenis_kelamin === 'Perempuan').length;
  const unitCount = UNITS.map(u => ({
    name: u,
    total: sdmList.filter(s => s.nama_unit === u).length
  }));
  const genderData = [
    { name: 'Laki-laki', value: lakiLaki },
    { name: 'Perempuan', value: perempuan },
  ];

  const CARDS = [
    { label: 'Total SDM',    value: total,     color: '#2563b0', icon: '👥' },
    { label: 'Laki-laki',   value: lakiLaki,  color: '#3b82d0', icon: '👨' },
    { label: 'Perempuan',   value: perempuan, color: '#f59e0b', icon: '👩' },
    { label: 'Unit Aktif',  value: unitCount.filter(u => u.total > 0).length, color: '#10b981', icon: '🏛️' },
  ];

  if (loading) return <div className={styles.loading}>Memuat data...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSub}>Ringkasan data SDM Yayasan</p>
      </div>

      {/* STAT CARDS */}
      <div className={styles.cards}>
        {CARDS.map((c, i) => (
          <div key={i} className={styles.card} style={{ animationDelay: `${i * .08}s` }}>
            <div className={styles.cardIcon} style={{ background: c.color + '18', color: c.color }}>
              {c.icon}
            </div>
            <div>
              <div className={styles.cardVal}>{c.value}</div>
              <div className={styles.cardLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className={styles.charts}>
        {/* Bar chart per unit */}
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>SDM per Unit</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={unitCount} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 13, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}
              />
              <Bar dataKey="total" radius={[6,6,0,0]}>
                {unitCount.map((_, i) => (
                  <Cell key={i} fill={UNIT_COLORS[i % UNIT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart gender */}
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Komposisi Gender</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={['#2563b0','#f59e0b'][i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABEL RINGKAS */}
      <div className={styles.tableBox}>
        <div className={styles.tableHeader}>
          <h3 className={styles.chartTitle}>SDM Terbaru</h3>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama</th><th>Jabatan</th><th>Unit</th><th>Email</th>
              </tr>
            </thead>
            <tbody>
              {sdmList.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td><b>{s.nama}</b></td>
                  <td>{s.jabatan || '-'}</td>
                  <td><span className={styles.badge}>{s.nama_unit || '-'}</span></td>
                  <td>{s.email || '-'}</td>
                </tr>
              ))}
              {sdmList.length === 0 && (
                <tr><td colSpan={4} className={styles.empty}>Belum ada data SDM</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
