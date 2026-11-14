// RileyOS: desktop windows, phone home screen, clock, terminal, plain mode.
(function () {
  var desktop = document.getElementById('desktop');
  var root = document.documentElement;
  var z = 10;
  var win = function (name) { return document.getElementById('w-' + name); };

  // ---- Windows ----
  function clamp(w) {
    var maxX = Math.max(0, desktop.clientWidth - w.offsetWidth - 8);
    var maxY = Math.max(0, desktop.clientHeight - 40);
    w.style.left = Math.min(Math.max(0, parseFloat(w.style.left) || 0), maxX) + 'px';
    w.style.top = Math.min(Math.max(0, parseFloat(w.style.top) || 0), maxY) + 'px';
  }
  function focus(w) { w.style.zIndex = ++z; }
  function isPhone() { return root.classList.contains('phone'); }
  // On a phone only one app is open at a time; About stays on the home screen as a widget.
  function closeApps() {
    document.querySelectorAll('.window').forEach(function (w) { w.hidden = w.id !== 'w-about'; });
  }
  function open(name) {
    var w = win(name);
    if (!w) return false;
    if (isPhone()) closeApps();
    w.hidden = false;
    if (!isPhone()) clamp(w);
    focus(w);
    if (name === 'trash') Ach.unlock('diver');
    if (name === 'terminal' && !root.classList.contains('plain') && !isPhone()) input.focus({ preventScroll: true });
    if (root.classList.contains('plain')) w.scrollIntoView({ behavior: 'smooth' });
    return true;
  }

  document.querySelectorAll('.window').forEach(function (w) {
    w.style.left = w.dataset.x + 'px';
    w.style.top = w.dataset.y + 'px';
    w.addEventListener('pointerdown', function () { focus(w); });
    w.querySelector('.close').addEventListener('click', function () { w.hidden = true; });

    var bar = w.querySelector('.titlebar');
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.close') || root.classList.contains('plain') || isPhone()) return;
      var dx = e.clientX - w.offsetLeft, dy = e.clientY - w.offsetTop, moved = false;
      bar.setPointerCapture(e.pointerId);
      function move(ev) {
        moved = true;
        w.style.left = ev.clientX - dx + 'px';
        w.style.top = ev.clientY - dy + 'px';
        clamp(w);
      }
      function up() {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', up);
        if (moved) Ach.unlock('mover');
      }
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.window:not([hidden])').forEach(clamp);
  });
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { open(b.dataset.open); });
  });

  // ---- Plain mode (also the phone layout) ----
  var modeBtn = document.getElementById('mode');
  function setPlain(on) {
    root.classList.toggle('plain', on);
    modeBtn.textContent = on ? 'Desktop version' : 'Plain version';
    if (!on) document.querySelectorAll('.window:not([hidden])').forEach(clamp);
  }
  modeBtn.addEventListener('click', function () { setPlain(!root.classList.contains('plain')); });
  document.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { setPlain(true); });
  });

  // ---- Phone mode ----
  var narrow = window.matchMedia('(max-width: 720px)');
  function setPhone() {
    root.classList.toggle('phone', narrow.matches);
    if (narrow.matches) { setPlain(false); closeApps(); }
    else document.querySelectorAll('.window:not([hidden])').forEach(clamp);
  }
  narrow.addEventListener('change', setPhone);
  setPhone();

  // ---- Clock ----
  var clock = document.getElementById('clock');
  function tick() {
    var d = new Date();
    clock.textContent =
      d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  tick();
  setInterval(tick, 10000);

  // ---- Achievements ----
  var achBtn = document.getElementById('ach-count');
  var achList = document.getElementById('ach-list');
  function renderAch() {
    achBtn.textContent = 'Achievements ' + Ach.count() + '/' + Ach.total;
    achList.textContent = '';
    Object.keys(Ach.list).forEach(function (id) {
      var li = document.createElement('li');
      var got = Ach.has(id);
      if (!got) li.className = 'locked';
      var box = document.createElement('span');
      box.className = 'box';
      box.textContent = got ? '[x]' : '[ ]';
      var text = document.createElement('span');
      text.textContent = got ? Ach.list[id][0] + ': ' + Ach.list[id][1] : '???';
      li.append(box, text);
      achList.appendChild(li);
    });
  }
  document.addEventListener('achievement', renderAch);
  renderAch();
  setTimeout(function () { Ach.unlock('boot'); }, 1200);

  // ---- Terminal ----
  var term = document.getElementById('term');
  var log = document.getElementById('term-log');
  var form = document.getElementById('term-form');
  var input = document.getElementById('term-input');
  var apps = ['projects', 'now', 'lab', 'guestbook', 'trash', 'achievements', 'about'];

  function print(text, cls) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = text;
    log.appendChild(d);
  }
  var commands = {
    help: function () { return 'ls   cd <dir>   cat <file>   open <app>   whoami   date   clear   plain'; },
    ls: function () { return 'games/  projects/  lab/  guestbook/  now.txt  about.txt'; },
    whoami: function () { return 'guest. Riley is the other one.'; },
    date: function () { return new Date().toString(); },
    clear: function () { log.textContent = ''; },
    plain: function () { setPlain(true); },
    sudo: function () { return 'Nice try.'; },
    secret: function () { Ach.unlock('curious'); return 'You found it. There are more.'; },
    cd: function (arg) {
      var dir = (arg || '').replace(/\/$/, '');
      if (dir === 'games') { location.href = '/games/'; return 'Loading arcade...'; }
      if (apps.indexOf(dir) >= 0) { open(dir); return; }
      return 'cd: no such directory: ' + (arg || '');
    },
    open: function (arg) {
      if (arg === 'games') return commands.cd('games');
      return open(arg) ? undefined : 'open: no such app: ' + (arg || '');
    },
    cat: function (arg) {
      if (arg === 'now.txt') return document.getElementById('now-text').textContent;
      if (arg === 'about.txt') return win('about').querySelector('p').textContent;
      return 'cat: ' + (arg || '') + ': no such file';
    },
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var line = input.value.trim();
    input.value = '';
    print('guest@rileycohn.com ~ % ' + line);
    if (line) {
      var parts = line.split(/\s+/);
      var fn = commands[parts[0].toLowerCase()];
      var out = fn ? fn(parts[1]) : 'command not found: ' + parts[0] + '. Try help.';
      if (out) print(out, 'out');
      Ach.unlock('hacker');
    }
    term.scrollTop = term.scrollHeight;
  });
  term.addEventListener('click', function () {
    if (!String(getSelection())) input.focus({ preventScroll: true });
  });
})();
