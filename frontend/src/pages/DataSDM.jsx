import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './DataSDM.module.css';

const UNITS = [
  { id: 1, label: 'Yayasan' },
  { id: 2, label: 'SMP' },
  { id: 3, label: 'SD' },
  { id: 4, label: 'TK' },
];

const EMPTY = {
  nama:'', jabatan:'', nip:'', jenis_kelamin:'Laki-laki',
  tanggal_lahir:'', alamat:'', no_hp:'', email:'', unit_id: 1
};

export default function DataSDM() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/sdm').then(r => { setList(r.data); setLoading(false); })
       .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openAdd = () => {
    setForm(EMPTY); setEditId(null); setPdfFile(null); setModal(true);
  };

  const openEdit = sdm => {
    setForm({
      nama: sdm.nama || '', jabatan: sdm.jabatan || '',
      nip: sdm.nip || '', jenis_kelamin: sdm.jenis_kelamin || 'Laki-laki',
      tanggal_lahir: sdm.tanggal_lahir?.slice(0,10) || '',
      alamat: sdm.alamat || '', no_hp: sdm.no_hp || '',
      email: sdm.email || '', unit_id: sdm.unit_id || 1
    });
    setEditId(sdm.id); setPdfFile(null); setModal(true);
  };

  const closeModal = () => { setModal(false); setEditId(null); setPdfFile(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (pdfFile) fd.append('file_pdf', pdfFile);

      if (editId) await api.put(`/sdm/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else        await api.post('/sdm', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      showToast(editId ? 'Data berhasil diperbarui ✅' : 'Data berhasil ditambahkan ✅');
      closeModal(); load();
    } catch (err) {
      showToast('Gagal menyimpan data ❌');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await api.delete(`/sdm/${id}`);
      showToast('Data berhasil dihapus ✅');
      load();
    } catch { showToast('Gagal menghapus data ❌'); }
    setConfirm(null);
  };

  const filtered = list.filter(s =>
    s.nama?.toLowerCase().includes(search.toLowerCase()) ||
    s.jabatan?.toLowerCase().includes(search.toLowerCase()) ||
    s.nama_unit?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* TOAST */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Data SDM</h1>
          <p className={styles.pageSub}>Kelola data Sumber Daya Manusia</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ Tambah SDM</button>
      </div>

      {/* SEARCH & TABLE */}
      <div className={styles.tableBox}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="🔍  Cari nama, jabatan, unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className={styles.count}>{filtered.length} data</span>
        </div>

        {loading ? (
          <div className={styles.loading}>Memuat data...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th><th>Nama</th><th>Jabatan</th><th>Unit</th>
                  <th>Gender</th><th>Email</th><th>PDF</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className={styles.num}>{i + 1}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>{s.nama?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className={styles.nameText}>{s.nama}</div>
                          {s.nip && <div className={styles.nipText}>NIP: {s.nip}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{s.jabatan || '-'}</td>
                    <td><span className={styles.badge}>{s.nama_unit || '-'}</span></td>
                    <td>
                      <span className={`${styles.gender} ${s.jenis_kelamin === 'Perempuan' ? styles.genderP : styles.genderL}`}>
                        {s.jenis_kelamin || '-'}
                      </span>
                    </td>
                    <td>{s.email || '-'}</td>
                    <td>
                      {s.file_pdf
                        ? <a href={`/uploads/${s.file_pdf}`} target="_blank" rel="noreferrer" className={styles.pdfLink}>📄 Lihat</a>
                        : <span className={styles.noPdf}>-</span>
                      }
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => openEdit(s)}>✏️</button>
                        <button className={styles.delBtn}  onClick={() => setConfirm(s.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className={styles.empty}>
                    {search ? 'Data tidak ditemukan' : 'Belum ada data SDM'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM DELETE */}
      {confirm && (
        <div className={styles.overlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>🗑️</div>
            <h3>Hapus Data?</h3>
            <p>Data yang dihapus tidak bisa dikembalikan.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={() => setConfirm(null)}>Batal</button>
              <button className={styles.confirmDelBtn} onClick={() => handleDelete(confirm)}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editId ? 'Edit Data SDM' : 'Tambah Data SDM'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Nama <span className={styles.req}>*</span></label>
                  <input value={form.nama} onChange={e => setForm(f=>({...f,nama:e.target.value}))} required placeholder="Nama lengkap" />
                </div>
                <div className={styles.field}>
                  <label>NIP</label>
                  <input value={form.nip} onChange={e => setForm(f=>({...f,nip:e.target.value}))} placeholder="Nomor Induk Pegawai" />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Jabatan</label>
                  <input value={form.jabatan} onChange={e => setForm(f=>({...f,jabatan:e.target.value}))} placeholder="Jabatan" />
                </div>
                <div className={styles.field}>
                  <label>Unit</label>
                  <select value={form.unit_id} onChange={e => setForm(f=>({...f,unit_id:e.target.value}))}>
                    {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Jenis Kelamin</label>
                  <select value={form.jenis_kelamin} onChange={e => setForm(f=>({...f,jenis_kelamin:e.target.value}))}>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Tanggal Lahir</label>
                  <input type="date" value={form.tanggal_lahir} onChange={e => setForm(f=>({...f,tanggal_lahir:e.target.value}))} />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>No. HP</label>
                  <input value={form.no_hp} onChange={e => setForm(f=>({...f,no_hp:e.target.value}))} placeholder="08xx-xxxx-xxxx" />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="email@example.com" />
                </div>
              </div>

              <div className={styles.field}>
                <label>Alamat</label>
                <textarea value={form.alamat} onChange={e => setForm(f=>({...f,alamat:e.target.value}))} placeholder="Alamat lengkap" rows={3} />
              </div>

              <div className={styles.field}>
                <label>Upload PDF {editId && '(kosongkan jika tidak diganti)'}</label>
                <div className={styles.fileWrap}>
                  <input type="file" accept="application/pdf" id="pdfInput"
                    onChange={e => setPdfFile(e.target.files[0])} style={{display:'none'}} />
                  <label htmlFor="pdfInput" className={styles.fileLabel}>
                    {pdfFile ? `📄 ${pdfFile.name}` : '📂 Pilih file PDF'}
                  </label>
                </div>
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Batal</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Tambah Data')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
