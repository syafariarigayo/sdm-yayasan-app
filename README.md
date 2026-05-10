# Backend SDM Yayasan v2.0

## Perubahan dari versi sebelumnya

| Sebelum | Sesudah |
|---|---|
| 3 file server duplikat | 1 file `server.js` yang bersih |
| Data disimpan di JSON file | Data disimpan di MySQL |
| Password plain text | Password di-hash dengan bcrypt |
| Tidak ada autentikasi JWT | JWT aktif di semua endpoint SDM |
| `routes/auth.js` tidak tersambung | Auth route tersambung ke server |

## Struktur File

```
backend/
├── server.js          ← Entry point utama (SATU-SATUNYA server)
├── db.js              ← Koneksi MySQL (pool connection)
├── schema.sql         ← Script buat database & tabel
├── package.json
├── .env
├── middleware/
│   └── auth.js        ← Middleware verifikasi JWT
├── routes/
│   ├── auth.js        ← POST /auth/login & /auth/register
│   └── sdm.js         ← CRUD /sdm (dilindungi JWT)
└── uploads/           ← Folder file PDF (auto dibuat)
```

## Cara Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Buat database MySQL
Buka phpMyAdmin atau MySQL CLI, lalu jalankan:
```bash
mysql -u root -p < schema.sql
```

### 3. Daftarkan user admin pertama
```bash
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "nama": "Admin",
  "email": "admin@sdm.com",
  "password": "12345",
  "role": "admin"
}
```

### 4. Jalankan server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Auth (tidak perlu token)
| Method | URL | Keterangan |
|---|---|---|
| POST | /auth/login | Login, dapat token JWT |
| POST | /auth/register | Daftar user baru |

### SDM (wajib token di header)
Header: `Authorization: Bearer <token>`

| Method | URL | Keterangan |
|---|---|---|
| GET | /sdm | Ambil semua data SDM |
| GET | /sdm/:id | Ambil data SDM by ID |
| POST | /sdm | Tambah data SDM (+ upload PDF) |
| PUT | /sdm/:id | Edit data SDM (+ ganti PDF) |
| DELETE | /sdm/:id | Hapus data SDM + file PDF |

## File yang DIHAPUS dari versi lama
- `index.js` — duplikat server.js
- `index.html` — salah nama, isinya kode Express
- `server.js` lama — diganti yang baru
- `sdm.json` — diganti MySQL
- `users.json` — diganti tabel users di MySQL
