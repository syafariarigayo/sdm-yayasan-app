-- ============================================
-- DATABASE SCHEMA: sdm_yayasan
-- Jalankan file ini di phpMyAdmin atau MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS sdm_yayasan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sdm_yayasan;

-- ===== TABEL UNITS =====
CREATE TABLE IF NOT EXISTS units (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  nama_unit VARCHAR(100) NOT NULL
);

INSERT INTO units (nama_unit) VALUES
  ('Yayasan'), ('SMP'), ('SD'), ('TK')
ON DUPLICATE KEY UPDATE nama_unit = VALUES(nama_unit);

-- ===== TABEL USERS (untuk login) =====
CREATE TABLE IF NOT EXISTS users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  nama       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,  -- bcrypt hash
  role       ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== TABEL SDM =====
CREATE TABLE IF NOT EXISTS sdm (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  nama           VARCHAR(100) NOT NULL,
  jabatan        VARCHAR(100),
  nip            VARCHAR(50),
  jenis_kelamin  ENUM('Laki-laki', 'Perempuan'),
  tanggal_lahir  DATE,
  alamat         TEXT,
  no_hp          VARCHAR(20),
  email          VARCHAR(100),
  unit_id        INT,
  file_pdf       VARCHAR(255),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

-- ============================================
-- SETELAH BUAT SCHEMA, DAFTARKAN ADMIN LEWAT:
-- POST /auth/register
-- Body: { "nama": "Admin", "email": "admin@sdm.com", "password": "12345", "role": "admin" }
-- ============================================
