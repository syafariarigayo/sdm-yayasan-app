const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sdmFile = 'sdm.json';
const upload = multer({ dest: 'uploads/' }); // folder untuk file PDF

// ===== LOGIN =====
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
  const user = users.find(u => u.username === username && u.password === password);
  if(user) res.json({ success:true, message:'Login berhasil' });
  else res.json({ success:false, message:'Username atau password salah' });
});

app.get('/login', (req,res)=> res.send('Endpoint login hanya bisa diakses via POST.'));

// ===== CRUD SDM =====

// GET semua SDM
app.get('/sdm', (req,res)=>{
  const sdm = JSON.parse(fs.readFileSync(sdmFile,'utf-8'));
  res.json(sdm);
});

// POST tambah SDM dengan PDF
app.post('/sdm', upload.single('file_pdf'), (req,res)=>{
  const sdm = JSON.parse(fs.readFileSync(sdmFile,'utf-8'));
  const newData = {
    id: sdm.length+1,
    ...req.body,
    file_pdf: req.file ? req.file.filename : null
  };
  sdm.push(newData);
  fs.writeFileSync(sdmFile, JSON.stringify(sdm,null,2));
  res.json(newData);
});

// PUT edit SDM dengan PDF
app.put('/sdm/:id', upload.single('file_pdf'), (req,res)=>{
  const sdm = JSON.parse(fs.readFileSync(sdmFile,'utf-8'));
  const id = parseInt(req.params.id);
  const index = sdm.findIndex(item=>item.id===id);
  if(index===-1) return res.status(404).json({message:'Data tidak ditemukan'});

  // Jika upload file baru, hapus file lama
  if(req.file && sdm[index].file_pdf){
    const oldFile = path.join(__dirname,'uploads',sdm[index].file_pdf);
    if(fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  sdm[index] = {
    id,
    ...req.body,
    file_pdf: req.file ? req.file.filename : sdm[index].file_pdf
  };
  fs.writeFileSync(sdmFile, JSON.stringify(sdm,null,2));
  res.json(sdm[index]);
});

// DELETE SDM
app.delete('/sdm/:id', (req,res)=>{
  const sdm = JSON.parse(fs.readFileSync(sdmFile,'utf-8'));
  const id = parseInt(req.params.id);
  const index = sdm.findIndex(item=>item.id===id);
  if(index===-1) return res.status(404).json({message:'Data tidak ditemukan'});

  // Hapus file PDF jika ada
  if(sdm[index].file_pdf){
    const filePath = path.join(__dirname,'uploads',sdm[index].file_pdf);
    if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  const deleted = sdm.splice(index,1);
  fs.writeFileSync(sdmFile, JSON.stringify(sdm,null,2));
  res.json(deleted[0]);
});

// ===== START SERVER =====
app.listen(PORT, ()=> console.log(`Server berjalan di http://localhost:${PORT}`));
