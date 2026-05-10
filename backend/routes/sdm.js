const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const db         = require('../db');
const verifyToken = require('../middleware/auth');

// ===== MULTER CONFIG =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Hanya file PDF yang diizinkan'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // maks 5MB
});

// ===== MAPPING UNIT =====
const unitMap = { 1: 'Yayasan', 2: 'SMP', 3: 'SD', 4: 'TK' };

// ===== GET semua SDM =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, u.nama_unit
      FROM sdm s
      LEFT JOIN units u ON s.unit_id = u.id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data SDM' });
  }
});

// ===== GET SDM by ID =====
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, u.nama_unit
      FROM sdm s
      LEFT JOIN units u ON s.unit_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== POST tambah SDM =====
router.post('/', verifyToken, upload.single('file_pdf'), async (req, res) => {
  const { nama, jabatan, nip, jenis_kelamin, tanggal_lahir, alamat, no_hp, email, unit_id } = req.body;

  if (!nama) return res.status(400).json({ message: 'Nama wajib diisi' });

  try {
    const file_pdf = req.file ? req.file.filename : null;

    const [result] = await db.query(
      `INSERT INTO sdm (nama, jabatan, nip, jenis_kelamin, tanggal_lahir, alamat, no_hp, email, unit_id, file_pdf)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama, jabatan, nip, jenis_kelamin, tanggal_lahir, alamat, no_hp, email, unit_id, file_pdf]
    );

    res.status(201).json({ message: 'Data SDM berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data' });
  }
});

// ===== PUT edit SDM =====
router.put('/:id', verifyToken, upload.single('file_pdf'), async (req, res) => {
  const { nama, jabatan, nip, jenis_kelamin, tanggal_lahir, alamat, no_hp, email, unit_id } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM sdm WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

    let file_pdf = existing[0].file_pdf;

    // Hapus file lama jika ada upload baru
    if (req.file) {
      if (file_pdf) {
        const oldPath = path.join(__dirname, '..', 'uploads', file_pdf);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      file_pdf = req.file.filename;
    }

    await db.query(
      `UPDATE sdm SET nama=?, jabatan=?, nip=?, jenis_kelamin=?, tanggal_lahir=?,
       alamat=?, no_hp=?, email=?, unit_id=?, file_pdf=? WHERE id=?`,
      [nama, jabatan, nip, jenis_kelamin, tanggal_lahir, alamat, no_hp, email, unit_id, file_pdf, req.params.id]
    );

    res.json({ message: 'Data SDM berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data' });
  }
});

// ===== DELETE SDM =====
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM sdm WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

    // Hapus file PDF jika ada
    if (existing[0].file_pdf) {
      const filePath = path.join(__dirname, '..', 'uploads', existing[0].file_pdf);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM sdm WHERE id = ?', [req.params.id]);
    res.json({ message: 'Data SDM berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data' });
  }
});

module.exports = router;
