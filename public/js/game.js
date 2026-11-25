// ============================================================
// LKS Cyber Security Simulator — GAME ENGINE
// Main game logic, scoring, challenge management
// ============================================================

class GameEngine {
  constructor() {
    // Player state
    this.playerName = localStorage.getItem('lks_player_name') || 'Player';
    this.role       = localStorage.getItem('lks_player_role') || 'red';
    this.startTime  = parseInt(localStorage.getItem('lks_start_time')) || Date.now();

    // Challenge state
    this.challenges    = this.role === 'red' ? RED_CHALLENGES : BLUE_CHALLENGES;
    this.currentIndex  = 0;
    this.solvedIds     = new Set();
    this.hintUsed      = new Set();
    this.attempts      = {}; // {challengeId: count}

    // Scoring
    this.score     = 0;
    this.maxScore  = this.challenges.reduce((s, c) => s + c.points + c.timeBonus, 0);

    // Terminal
    this.terminal = null;

    // Timer
    this.timerInterval = null;

    // Redirect if no session
    if (!localStorage.getItem('lks_player_name')) {
      window.location.href = '/';
    }
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  init(terminalContainerId, terminalInputId) {
    this.terminal = new Terminal(terminalContainerId, terminalInputId, this.role);
    this.terminal.onCommand = (cmd) => this.handleCommand(cmd);
    this.terminal.onClear = () => this._printWelcomeBrief();

    this._updateUI();
    this._renderChallengeList();
    this._startTimer();
    this._printWelcome();
    this._loadChallenge(0);

    this.terminal.focus();
  }

  // ─────────────────────────────────────────────
  // COMMAND HANDLER
  // ─────────────────────────────────────────────
  handleCommand(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':     this._cmdHelp(); break;
      case 'clear':    this.terminal.clear(); this._printWelcomeBrief(); break;
      case 'score':    this._cmdScore(); break;
      case 'challenges':
      case 'list':     this._cmdListChallenges(); break;
      case 'select':   this._cmdSelect(args); break;
      case 'info':     this._cmdInfo(); break;
      case 'hint':     this._cmdHint(); break;
      case 'submit':   this._cmdSubmit(args); break;
      case 'whoami':   this._cmdWhoami(); break;
      case 'next':     this._cmdNext(); break;
      case 'exit':
      case 'quit':     this._cmdExit(); break;
      default:
        this.terminal.printError(`Command '${cmd}' tidak dikenal. Ketik 'help' untuk bantuan.`);
    }
  }

  // ─────────────────────────────────────────────
  // COMMANDS
  // ─────────────────────────────────────────────
  _cmdHelp() {
    const isRed = this.role === 'red';
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.printInfo('  PERINTAH TERSEDIA');
    this.terminal.printSeparator('─', '#30363d');
    const cmds = [
      ['help',           'Tampilkan daftar perintah'],
      ['challenges',     'Lihat semua challenge'],
      ['select <no>',    'Pilih challenge berdasarkan nomor'],
      ['info',           'Lihat detail challenge aktif'],
      ['hint',           'Dapatkan hint (-50 poin)'],
      ['submit <jawaban>','Submit jawaban challenge'],
      ['score',          'Lihat skor dan progress'],
      ['whoami',         'Info pemain'],
      ['next',           'Lanjut ke challenge berikutnya'],
      ['clear',          'Bersihkan terminal'],
      ['exit',           'Kembali ke halaman utama'],
    ];
    cmds.forEach(([c, d]) => {
      this.terminal.printHTML(
        `<span style="color:#58a6ff;font-family:monospace">  ${c.padEnd(20)}</span><span style="color:#8b949e">${d}</span>`
      );
    });
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print('');
  }

  _cmdScore() {
    const ch = this.challenges;
    const solved = this.solvedIds.size;
    const pct = Math.round((solved / ch.length) * 100);
    const elapsed = this._getElapsed();

    this.terminal.printSeparator('═', '#3fb950');
    this.terminal.printSuccess(`  SCOREBOARD — ${this.playerName}`);
    this.terminal.printSeparator('═', '#3fb950');
    this.terminal.print(`  Skor      : ${this.score} / ${this.maxScore} poin`, '#e6edf3');
    this.terminal.print(`  Progress  : ${solved} / ${ch.length} challenge (${pct}%)`, '#e6edf3');
    this.terminal.print(`  Waktu     : ${elapsed}`, '#e6edf3');
    this.terminal.print(`  Tim       : ${this.role === 'red' ? '⚔️  RED TEAM' : '🛡️  BLUE TEAM'}`, '#e6edf3');
    this.terminal.printSeparator('═', '#3fb950');
    this.terminal.print('');
  }

  _cmdListChallenges() {
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.printInfo('  DAFTAR CHALLENGE');
    this.terminal.printSeparator('─', '#30363d');
    this.challenges.forEach((ch, i) => {
      const isSolved = this.solvedIds.has(ch.id);
      const isActive = i === this.currentIndex;
      const status = isSolved ? '✅' : (isActive ? '▶ ' : '  ');
      const statusColor = isSolved ? '#3fb950' : (isActive ? '#d29922' : '#8b949e');
      const diffColor = { Easy: '#3fb950', Medium: '#d29922', Hard: '#f85149' }[ch.difficulty];
      this.terminal.printHTML(
        `<span style="color:${statusColor}">${status} ${String(i+1).padStart(2,'0')}. ${ch.icon} ${ch.title.padEnd(35)}</span>` +
        `<span style="color:${diffColor}">[${ch.difficulty}]</span>` +
        `<span style="color:#8b949e"> ${ch.points}pts</span>`
      );
    });
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.printSystem(`  Gunakan 'select <no>' untuk berpindah challenge`);
    this.terminal.print('');
  }

  _cmdSelect(arg) {
    const n = parseInt(arg);
    if (isNaN(n) || n < 1 || n > this.challenges.length) {
      this.terminal.printError(`Nomor challenge tidak valid. Gunakan 1-${this.challenges.length}`);
      return;
    }
    this.currentIndex = n - 1;
    this._renderChallengeList();
    this._loadChallenge(this.currentIndex);
  }

  _cmdInfo() {
    this._printChallengeDetail(this.challenges[this.currentIndex]);
  }

  _cmdHint() {
    const ch = this.challenges[this.currentIndex];
    if (this.solvedIds.has(ch.id)) {
      this.terminal.printWarning('Challenge ini sudah selesai!');
      return;
    }
    if (this.hintUsed.has(ch.id)) {
      this.terminal.printWarning('Hint sudah digunakan untuk challenge ini!');
      this.terminal.printSystem(`HINT: ${ch.hint}`);
      return;
    }
    this.hintUsed.add(ch.id);
    this.score = Math.max(0, this.score - 50);
    this._updateUI();
    this.terminal.printWarning('⚠️  HINT DIGUNAKAN — -50 poin');
    this.terminal.printSeparator('─', '#d29922');
    this.terminal.printHTML(`<span style="color:#e3b341">💡 HINT: ${ch.hint}</span>`);
    this.terminal.printSeparator('─', '#d29922');
    this.terminal.print('');
  }

  _cmdSubmit(answer) {
    if (!answer) {
      this.terminal.printError('Jawaban tidak boleh kosong. Contoh: submit <jawaban>');
      return;
    }
    const ch = this.challenges[this.currentIndex];
    if (this.solvedIds.has(ch.id)) {
      this.terminal.printWarning('✅ Challenge ini sudah kamu selesaikan!');
      this.terminal.printSystem("Ketik 'next' atau 'select <no>' untuk lanjut.");
      return;
    }

    // Track attempts
    if (!this.attempts[ch.id]) this.attempts[ch.id] = 0;
    this.attempts[ch.id]++;

    // Validate answer
    const normalized = answer.trim().toLowerCase();
    const isCorrect = ch.answers.some(a => a.toLowerCase() === normalized);

    if (isCorrect) {
      this._onChallengeSuccess(ch);
    } else {
      this._onChallengeFail(ch, answer);
    }
  }

  _cmdWhoami() {
    const icon = this.role === 'red' ? '⚔️' : '🛡️';
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.printInfo('  PLAYER INFO');
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print(`  Nama    : ${this.playerName}`, '#e6edf3');
    this.terminal.print(`  Tim     : ${icon} ${this.role === 'red' ? 'RED TEAM (Attacker)' : 'BLUE TEAM (Defender)'}`, '#e6edf3');
    this.terminal.print(`  Sesi    : ${this._getElapsed()}`, '#e6edf3');
    this.terminal.print(`  Progress: ${this.solvedIds.size}/${this.challenges.length} challenge`, '#e6edf3');
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print('');
  }

  _cmdNext() {
    if (this.currentIndex < this.challenges.length - 1) {
      this.currentIndex++;
      this._renderChallengeList();
      this._loadChallenge(this.currentIndex);
    } else {
      this.terminal.printWarning('Sudah di challenge terakhir! Gunakan select <no> untuk berpindah.');
    }
  }

  _cmdExit() {
    this.terminal.printWarning('Kembali ke halaman utama...');
    setTimeout(() => { window.location.href = '/'; }, 1000);
  }

  // ─────────────────────────────────────────────
  // CHALLENGE LOGIC
  // ─────────────────────────────────────────────
  _loadChallenge(index) {
    const ch = this.challenges[index];
    const isSolved = this.solvedIds.has(ch.id);

    this.terminal.print('');
    this.terminal.printSeparator('═', this.role === 'red' ? '#f85149' : '#58a6ff');
    this.terminal.printHTML(
      `<span style="color:${this.role === 'red' ? '#f85149' : '#58a6ff'}">` +
      `  ${ch.icon} CHALLENGE ${index+1}/${this.challenges.length}: ${ch.title.toUpperCase()}` +
      `</span>`
    );
    this.terminal.printSeparator('═', this.role === 'red' ? '#f85149' : '#58a6ff');

    if (isSolved) {
      this.terminal.printSuccess('  ✅ CHALLENGE SUDAH DISELESAIKAN!');
      this.terminal.printSystem("  Ketik 'next' untuk challenge berikutnya.");
    } else {
      this.terminal.printSystem(`  Kategori  : ${ch.category}`);
      this.terminal.printSystem(`  Kesulitan : ${ch.difficulty}  |  Poin : ${ch.points} (+${ch.timeBonus} bonus waktu)`);
    }
    this.terminal.print('');
    this.terminal.printSystem("  Ketik 'info' untuk detail lengkap challenge.");
    this.terminal.printSystem("  Ketik 'hint' untuk petunjuk (-50 poin).");
    this.terminal.printSystem("  Ketik 'submit <jawaban>' untuk submit.");
    this.terminal.print('');

    // Update sidebar
    this._renderChallengeList();
    this._updateChallengePanel(ch, isSolved);
  }

  _printChallengeDetail(ch) {
    this.terminal.print('');
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.printHTML(`<span style="color:#e3b341">  ${ch.icon} ${ch.title}</span>`);
    this.terminal.printSeparator('─', '#30363d');
    // Print description line by line
    ch.description.split('\n').forEach(line => {
      if (line.includes('[') && line.includes(']')) {
        this.terminal.printHTML(`<span style="color:#58a6ff">${line}</span>`);
      } else if (line.trim().startsWith('$') || line.trim().startsWith('#')) {
        this.terminal.printHTML(`<span style="color:#3fb950">${line}</span>`);
      } else {
        this.terminal.print(line, '#c9d1d9');
      }
    });
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print('');
  }

  _onChallengeSuccess(ch) {
    const timeElapsed = Date.now() - this.startTime;
    const timeBonus = this.hintUsed.has(ch.id) ? 0 :
      Math.max(0, ch.timeBonus - Math.floor(timeElapsed / 60000) * 10);

    const earned = ch.points + timeBonus;
    this.score += earned;
    this.solvedIds.add(ch.id);

    // Log to server
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player: this.playerName, role: this.role,
        challenge: ch.title, result: 'SUCCESS', score: this.score
      })
    }).catch(() => {});

    // Terminal output
    this.terminal.print('');
    this.terminal.printSeparator('═', '#3fb950');
    ch.successMsg.split('\n').forEach(line => {
      if (line.includes('✅') || line.includes('🎉')) {
        this.terminal.printSuccess(line);
      } else if (line.startsWith('[') && line.endsWith(']')) {
        this.terminal.printHTML(`<span style="color:#58a6ff">${line}</span>`);
      } else if (line.trim()) {
        this.terminal.print(line, '#c9d1d9');
      } else {
        this.terminal.print('');
      }
    });
    this.terminal.printSeparator('─', '#3fb950');
    this.terminal.printSuccess(`  🏆 +${ch.points} poin base  +${timeBonus} bonus waktu  = +${earned} total!`);
    this.terminal.printSuccess(`  💰 Total skor: ${this.score} poin`);
    this.terminal.printSeparator('═', '#3fb950');
    this.terminal.print('');

    if (this.solvedIds.size < this.challenges.length) {
      this.terminal.printSystem(`  ${this.challenges.length - this.solvedIds.size} challenge tersisa. Ketik 'next' atau 'challenges' untuk lanjut.`);
    }

    this._updateUI();
    this._renderChallengeList();
    this._scorePopAnimation(earned);

    // Check victory
    if (this.solvedIds.size === this.challenges.length) {
      setTimeout(() => this._onVictory(), 1500);
    }
  }

  _onChallengeFail(ch, answer) {
    const att = this.attempts[ch.id];
    this.terminal.print('');
    this.terminal.printError(`  ❌ JAWABAN SALAH! (Percobaan ke-${att})`);
    this.terminal.printError(`  Input: ${answer}`);
    if (att >= 3) {
      this.terminal.printWarning(`  💡 Sudah ${att}x salah. Coba ketik 'hint' untuk bantuan.`);
    }
    this.terminal.print('');

    // Log to server
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player: this.playerName, role: this.role,
        challenge: ch.title, result: 'FAIL', score: this.score
      })
    }).catch(() => {});
  }

  // ─────────────────────────────────────────────
  // VICTORY SCREEN
  // ─────────────────────────────────────────────
  _onVictory() {
    clearInterval(this.timerInterval);
    const elapsed = this._getElapsed();

    this.terminal.print('');
    this.terminal.printSeparator('█', this.role === 'red' ? '#f85149' : '#58a6ff');
    this.terminal.printSuccess('');
    this.terminal.printSuccess('  ██╗   ██╗██╗ ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗ ██╗');
    this.terminal.printSuccess('  ██║   ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝ ██║');
    this.terminal.printSuccess('  ██║   ██║██║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝  ██║');
    this.terminal.printSuccess('  ╚██╗ ██╔╝██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝   ╚═╝');
    this.terminal.printSuccess('   ╚████╔╝ ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║    ██╗');
    this.terminal.printSuccess('    ╚═══╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝');
    this.terminal.printSuccess('');
    this.terminal.printSeparator('─', '#3fb950');
    this.terminal.printSuccess(`  🏆 SELAMAT, ${this.playerName.toUpperCase()}!`);
    this.terminal.printSuccess(`  Kamu berhasil menyelesaikan SEMUA ${this.challenges.length} challenge!`);
    this.terminal.print('');
    this.terminal.print(`  Tim        : ${this.role === 'red' ? '⚔️  RED TEAM' : '🛡️  BLUE TEAM'}`, '#e6edf3');
    this.terminal.print(`  Skor Akhir : ${this.score} / ${this.maxScore} poin`, '#e6edf3');
    this.terminal.print(`  Total Waktu: ${elapsed}`, '#e6edf3');
    this.terminal.print(`  Hint Pakai : ${this.hintUsed.size}x (${this.hintUsed.size * 50} poin terpakai)`, '#e6edf3');
    this.terminal.print('');
    this.terminal.printSeparator('█', this.role === 'red' ? '#f85149' : '#58a6ff');

    document.getElementById('victoryModal').classList.remove('hidden');
    document.getElementById('victoryScore').textContent = `${this.score} / ${this.maxScore}`;
    document.getElementById('victoryTime').textContent = elapsed;
    document.getElementById('victoryName').textContent = this.playerName;
    this._launchConfetti();
  }

  // ─────────────────────────────────────────────
  // WELCOME / BANNER
  // ─────────────────────────────────────────────
  _printWelcome() {
    const isRed = this.role === 'red';
    const color  = isRed ? '#f85149' : '#58a6ff';
    const banner = isRed ? [
      '  ██████╗ ███████╗██████╗     ████████╗███████╗ █████╗ ███╗   ███╗',
      '  ██╔══██╗██╔════╝██╔══██╗    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║',
      '  ██████╔╝█████╗  ██║  ██║       ██║   █████╗  ███████║██╔████╔██║',
      '  ██╔══██╗██╔══╝  ██║  ██║       ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║',
      '  ██║  ██║███████╗██████╔╝       ██║   ███████╗██║  ██║██║ ╚═╝ ██║',
      '  ╚═╝  ╚═╝╚══════╝╚═════╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝',
    ] : [
      '  ██████╗ ██╗     ██╗   ██╗███████╗    ████████╗███████╗ █████╗ ███╗   ███╗',
      '  ██╔══██╗██║     ██║   ██║██╔════╝    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║',
      '  ██████╔╝██║     ██║   ██║█████╗         ██║   █████╗  ███████║██╔████╔██║',
      '  ██╔══██╗██║     ██║   ██║██╔══╝         ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║',
      '  ██████╔╝███████╗╚██████╔╝███████╗       ██║   ███████╗██║  ██║██║ ╚═╝ ██║',
      '  ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝',
    ];

    this.terminal.print('');
    banner.forEach(line => this.terminal.print(line, color));
    this.terminal.print('');
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print(`  LKS Cyber Security Simulator | ${isRed ? '⚔️ Attacker Mode' : '🛡️ Defender Mode'}`, '#8b949e');
    this.terminal.print(`  Player: ${this.playerName}  |  Challenges: ${this.challenges.length}  |  Max Score: ${this.maxScore} pts`, '#8b949e');
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print("  Ketik 'help' untuk daftar perintah  |  'challenges' untuk list semua challenge", '#8b949e');
    this.terminal.printSeparator('─', '#30363d');
    this.terminal.print('');
  }

  _printWelcomeBrief() {
    this.terminal.printSystem(`  LKS CTF — ${this.playerName} | ${this.role === 'red' ? '⚔️ Red Team' : '🛡️ Blue Team'} | Skor: ${this.score}`);
    this.terminal.printSystem(`  'help' = perintah | 'challenges' = list challenge`);
    this.terminal.print('');
  }

  // ─────────────────────────────────────────────
  // UI UPDATES
  // ─────────────────────────────────────────────
  _updateUI() {
    const pct = Math.round((this.solvedIds.size / this.challenges.length) * 100);

    // Score
    const scoreEl = document.getElementById('scoreDisplay');
    if (scoreEl) scoreEl.textContent = this.score;

    // Max score
    const maxEl = document.getElementById('maxScoreDisplay');
    if (maxEl) maxEl.textContent = this.maxScore;

    // Progress text
    const progEl = document.getElementById('progressText');
    if (progEl) progEl.textContent = `${this.solvedIds.size} / ${this.challenges.length}`;

    // Progress bar
    const barEl = document.getElementById('progressBar');
    if (barEl) barEl.style.width = `${pct}%`;

    // Progress pct
    const pctEl = document.getElementById('progressPct');
    if (pctEl) pctEl.textContent = `${pct}%`;
  }

  _renderChallengeList() {
    const container = document.getElementById('challengeList');
    if (!container) return;
    container.innerHTML = '';

    this.challenges.forEach((ch, i) => {
      const isSolved = this.solvedIds.has(ch.id);
      const isActive = i === this.currentIndex;
      const diff = { Easy: 'text-green-600 bg-green-50 border-green-200', Medium: 'text-yellow-700 bg-yellow-50 border-yellow-300', Hard: 'text-red-600 bg-red-50 border-red-200' }[ch.difficulty];

      const item = document.createElement('div');
      item.className = `challenge-item p-3 rounded-lg border cursor-pointer transition-all mb-1 ${
        isActive ? (this.role === 'red' ? 'border-l-4 border-red-400 bg-red-50' : 'border-l-4 border-blue-400 bg-blue-50') :
        isSolved ? 'border-l-4 border-green-400 bg-green-50' :
        'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`;
      item.onclick = () => {
        this.currentIndex = i;
        this._renderChallengeList();
        this._loadChallenge(i);
        this.terminal.focus();
      };

      item.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold ${isActive ? (this.role==='red'?'text-red-700':'text-blue-700') : isSolved ? 'text-green-700' : 'text-gray-500'}">${String(i+1).padStart(2,'0')}. ${ch.icon}</span>
          <span class="text-xs px-1.5 py-0.5 rounded border font-medium ${diff}">${ch.difficulty}</span>
        </div>
        <div class="text-xs font-semibold ${isActive ? (this.role==='red'?'text-red-900':'text-blue-900') : isSolved ? 'text-green-900' : 'text-gray-700'} leading-tight mb-1">${ch.title}</div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">${ch.points} pts</span>
          <span class="text-xs">${isSolved ? '✅' : (isActive ? '▶' : '○')}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  _updateChallengePanel(ch, isSolved) {
    const panel = document.getElementById('challengePanel');
    if (!panel) return;

    const diff = { Easy: 'text-green-600 bg-green-50 border border-green-200', Medium: 'text-yellow-700 bg-yellow-50 border border-yellow-200', Hard: 'text-red-600 bg-red-50 border border-red-200' }[ch.difficulty];
    const accentColor = this.role === 'red' ? 'bg-red-600' : 'bg-blue-600';

    panel.innerHTML = `
      <div class="p-4">
        <div class="flex items-start gap-2 mb-3">
          <span class="text-2xl">${ch.icon}</span>
          <div>
            <div class="font-bold text-gray-900 text-sm leading-tight">${ch.title}</div>
            <div class="text-xs text-gray-500">${ch.category}</div>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap mb-4">
          <span class="text-xs px-2 py-0.5 rounded-full font-medium ${diff}">${ch.difficulty}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">${ch.points} pts base</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">+${ch.timeBonus} bonus</span>
        </div>
        ${isSolved ? `
          <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div class="text-green-700 font-semibold text-sm">✅ Selesai!</div>
          </div>
        ` : `
          <div class="space-y-2 text-xs text-gray-500">
            <div class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">submit</span> <span>Submit jawaban</span></div>
            <div class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">info</span> <span>Lihat detail</span></div>
            <div class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">hint</span> <span>Petunjuk (-50 pts)</span></div>
          </div>
        `}
      </div>
    `;
  }

  // ─────────────────────────────────────────────
  // TIMER
  // ─────────────────────────────────────────────
  _startTimer() {
    const update = () => {
      const el = document.getElementById('timerDisplay');
      if (el) el.textContent = this._getElapsed();
    };
    update();
    this.timerInterval = setInterval(update, 1000);
  }

  _getElapsed() {
    const ms = Date.now() - this.startTime;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  // ─────────────────────────────────────────────
  // SCORE POP ANIMATION
  // ─────────────────────────────────────────────
  _scorePopAnimation(pts) {
    const el = document.createElement('div');
    el.className = 'score-pop';
    el.textContent = `+${pts}`;
    el.style.left = `${window.innerWidth - 150}px`;
    el.style.top  = `${window.innerHeight - 200}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // ─────────────────────────────────────────────
  // CONFETTI
  // ─────────────────────────────────────────────
  _launchConfetti() {
    const colors = ['#f85149','#3fb950','#58a6ff','#d29922','#bc8cff','#39d353'];
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = `${Math.random() * 100}vw`;
        el.style.top  = `-20px`;
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        el.style.transform = `rotate(${Math.random() * 360}deg)`;
        el.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
      }, i * 50);
    }
  }
}
