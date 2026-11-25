// ============================================================
// LKS Cyber Security Simulator — TERMINAL ENGINE
// Handles all terminal display and input processing
// ============================================================

class Terminal {
  constructor(containerId, inputId, role) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.role = role; // 'red' | 'blue'
    this.history = [];
    this.historyIndex = -1;
    this.commandBuffer = '';

    this._setupInput();
  }

  _setupInput() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.history.unshift(cmd);
          this.historyIndex = -1;
          this.commandBuffer = '';
          this._echoCommand(cmd);
          this.input.value = '';
          if (this.onCommand) this.onCommand(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex === -1) this.commandBuffer = this.input.value;
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.input.value = this.commandBuffer;
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this._autocomplete();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        this.clear();
      }
    });

    // Click anywhere on terminal to focus input
    this.container.addEventListener('click', () => this.input.focus());
  }

  _autocomplete() {
    const cmds = ['help', 'clear', 'score', 'challenges', 'select', 'info', 'hint', 'submit', 'whoami', 'exit'];
    const val = this.input.value;
    const match = cmds.find(c => c.startsWith(val));
    if (match) this.input.value = match + ' ';
  }

  _echoCommand(cmd) {
    const promptColor = this.role === 'red' ? '#f85149' : '#58a6ff';
    const promptText = this.role === 'red'
      ? `<span style="color:#3fb950">red-team</span><span style="color:#8b949e">@</span><span style="color:#58a6ff">lks-ctf</span><span style="color:#8b949e">:~$</span>`
      : `<span style="color:#3fb950">blue-team</span><span style="color:#8b949e">@</span><span style="color:#58a6ff">lks-ctf</span><span style="color:#8b949e">:~$</span>`;
    this._appendHTML(`<div class="terminal-output mt-1">${promptText} <span style="color:#e6edf3">${this._escape(cmd)}</span></div>`);
  }

  _escape(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  _appendHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const scrollArea = this.container.querySelector('.terminal-scroll') || this.container;
    scrollArea.appendChild(div.firstChild || div);
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  print(text, color = '#c9d1d9') {
    const lines = text.split('\n');
    lines.forEach(line => {
      const el = document.createElement('div');
      el.className = 'terminal-output';
      el.style.color = color;
      el.textContent = line;
      const scrollArea = this.container.querySelector('.terminal-scroll') || this.container;
      scrollArea.appendChild(el);
    });
    const scrollArea = this.container.querySelector('.terminal-scroll') || this.container;
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  printHTML(html) {
    this._appendHTML(`<div class="terminal-output">${html}</div>`);
  }

  printSeparator(char = '─', color = '#30363d') {
    const line = char.repeat(60);
    this.print(line, color);
  }

  printSuccess(text) {
    this.print(text, '#3fb950');
  }

  printError(text) {
    this.print(text, '#f85149');
  }

  printWarning(text) {
    this.print(text, '#d29922');
  }

  printInfo(text) {
    this.print(text, '#58a6ff');
  }

  printSystem(text) {
    this.print(text, '#8b949e');
  }

  clear() {
    const scrollArea = this.container.querySelector('.terminal-scroll') || this.container;
    scrollArea.innerHTML = '';
    // onClear callback if set
    if (this.onClear) this.onClear();
  }

  focus() {
    this.input.focus();
  }

  typewrite(text, color = '#c9d1d9', delay = 20) {
    return new Promise(resolve => {
      const scrollArea = this.container.querySelector('.terminal-scroll') || this.container;
      const el = document.createElement('div');
      el.className = 'terminal-output';
      el.style.color = color;
      scrollArea.appendChild(el);

      let i = 0;
      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        scrollArea.scrollTop = scrollArea.scrollHeight;
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  }
}
