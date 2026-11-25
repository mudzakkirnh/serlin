# 🛡️ LKS Cyber Security Simulator

**Simulasi Attack & Defence untuk Lomba LKS Cyber Security**

---

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan server
npm start

# Server berjalan di:
# http://localhost:3000
```

---

## 📁 Struktur Proyek

```
serlin/
├── server.js                    # Express server
├── package.json
└── public/
    ├── index.html               # Landing page (pilih role)
    ├── game.html                # Halaman game terminal
    ├── css/
    │   └── style.css            # Custom styles
    └── js/
        ├── challenges-red.js    # 10 challenge Red Team
        ├── challenges-blue.js   # 10 challenge Blue Team
        ├── terminal.js          # Terminal engine
        └── game.js              # Logic utama & scoring
```

---

## ⚔️ Red Team — 10 Challenges (1750 pts maks)

| # | Judul | Kategori | Difficulty | Poin |
|---|-------|----------|------------|------|
| 1 | SQL Injection: Login Bypass | SQL Injection | Easy | 100 |
| 2 | SQL Injection: Data Extraction | SQL Injection | Medium | 150 |
| 3 | XSS: Reflected Attack | XSS | Easy | 100 |
| 4 | XSS: Stored Attack | XSS | Medium | 150 |
| 5 | Command Injection | Command Injection | Medium | 150 |
| 6 | Path Traversal / LFI | Path Traversal | Medium | 150 |
| 7 | IDOR: Akses Data Lain | IDOR | Easy | 100 |
| 8 | Broken Auth: JWT Algorithm None | Broken Authentication | Hard | 200 |
| 9 | Brute Force: Password Attack | Brute Force | Easy | 100 |
| 10 | LFI: PHP Filter Wrapper | Path Traversal | Hard | 200 |

## 🛡️ Blue Team — 10 Challenges (1600 pts maks)

| # | Judul | Kategori | Difficulty | Poin |
|---|-------|----------|------------|------|
| 1 | Patch SQL Injection: Login | SQL Injection Defense | Easy | 100 |
| 2 | Fix XSS: Output Encoding | XSS Defense | Easy | 100 |
| 3 | Hardening: Security Headers | Server Hardening | Medium | 150 |
| 4 | Log Analysis: Deteksi Intrusi | Intrusion Detection | Hard | 200 |
| 5 | Fix Broken Authentication | Authentication Defense | Medium | 150 |
| 6 | Input Sanitization & Validation | Input Validation | Easy | 100 |
| 7 | Code Review: Temukan Kerentanan | Code Review | Hard | 200 |
| 8 | Fix Command Injection | Command Injection Defense | Medium | 150 |
| 9 | Fix Path Traversal | Path Traversal Defense | Medium | 150 |
| 10 | Fix IDOR: Authorization Check | IDOR Defense | Hard | 200 |

---

## 🎮 Perintah Terminal

| Perintah | Fungsi |
|----------|--------|
| `help` | Tampilkan daftar perintah |
| `challenges` | List semua challenge |
| `select <no>` | Pilih challenge |
| `info` | Detail challenge aktif |
| `hint` | Dapatkan hint (-50 poin) |
| `submit <jawaban>` | Submit jawaban |
| `score` | Lihat skor & progress |
| `whoami` | Info pemain |
| `next` | Challenge berikutnya |
| `clear` | Bersihkan terminal |
| `exit` | Kembali ke halaman utama |

---

## 💡 Sistem Penilaian

- **Base Point**: 100–200 poin per challenge sesuai kesulitan
- **Bonus Waktu**: Hingga +100 poin (berkurang 10 poin per menit)
- **Hint**: -50 poin per penggunaan hint
- **Percobaan**: Tidak terbatas, gratis

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML, Vanilla JS, Tailwind CSS (CDN)
- **Database**: Tidak diperlukan (semua challenge statis)
- **Font**: JetBrains Mono (terminal), Inter (UI)

