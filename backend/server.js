const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const sdmRoutes  = require('./routes/sdm');

app.use('/auth', authRoutes);
app.use('/sdm',  sdmRoutes);

// ===== HEALTH CHECK =====
app.get('/', (req, res) => {
  res.json({ message: 'Server SDM Yayasan berjalan ✅' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
