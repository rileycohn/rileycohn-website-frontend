// Arcade cabinet: runs whichever cartridge is in the slot on a 320x240 screen.
// A cartridge calls Arcade.register({ id, title, color, blurb, create(api) })
// and create() returns { update(dt), draw(g) }.
(function () {
  var W = 320, H = 240;
  var canvas = document.getElementById('screen');
  var g = canvas.getContext('2d');
  var shelf = document.getElementById('carts');
  var slotLabel = document.getElementById('slot-label');
  var eject = document.getElementById('eject');
  var FONT = "'Press Start 2P', monospace";

  var games = {}, current = null, game = null, clock = 0;
  var input = { up: false, down: false, left: false, right: false, a: false };
  var just = {};

  function best(id) {
    try { return +localStorage.getItem('riley.best.' + id) || 0; } catch (e) { return 0; }
  }
  function text(str, x, y, color, size, align) {
    g.font = (size || 8) + 'px ' + FONT;
    g.fillStyle = color || '#f4f1ff';
    g.textAlign = align || 'center';
    g.textBaseline = 'top';
    g.fillText(str, x, y);
  }
  var api = {
    W: W, H: H, input: input, text: text,
    pressed: function (k) { return !!just[k]; },
    best: function () { return best(current); },
    submit: function (score) {
      score = Math.floor(score);
      if (score > best(current)) {
        try { localStorage.setItem('riley.best.' + current, score); } catch (e) {}
        var el = shelf.querySelector('[data-id="' + current + '"] .best');
        if (el) el.textContent = 'Best ' + score;
        return true;
      }
      return false;
    },
  };

  function insert(id) {
    if (current === id) return;
    current = id;
    game = games[id].create(api);
    slotLabel.textContent = games[id].title.toUpperCase();
    eject.disabled = false;
    shelf.querySelectorAll('.cart').forEach(function (c) {
      var on = c.dataset.id === id;
      c.classList.toggle('in', on);
      c.setAttribute('aria-pressed', on);
    });
    canvas.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    Ach.unlock('player');
  }
  function ejectCart() {
    current = game = null;
    slotLabel.textContent = 'NO CARTRIDGE';
    eject.disabled = true;
    shelf.querySelectorAll('.cart').forEach(function (c) {
      c.classList.remove('in');
      c.setAttribute('aria-pressed', false);
    });
  }
  eject.addEventListener('click', ejectCart);

  window.Arcade = {
    register: function (def) {
      games[def.id] = def;
      var b = document.createElement('button');
      b.className = 'cart';
      b.dataset.id = def.id;
      b.style.setProperty('--c', def.color);
      b.setAttribute('aria-pressed', false);
      b.innerHTML = '<span class="grip"></span><span class="sticker"><span class="name"></span>' +
        '<span class="blurb"></span><span class="best"></span></span>';
      b.querySelector('.name').textContent = def.title;
      b.querySelector('.blurb').textContent = def.blurb;
      b.querySelector('.best').textContent = def.scored === false ? '' : 'Best ' + best(def.id);
      b.addEventListener('click', function () { insert(def.id); });
      shelf.appendChild(b);
    },
  };

  // ---- Input ----
  var keys = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', ' ': 'a', Enter: 'a', z: 'a',
  };
  function set(k, on) {
    if (on && !input[k]) just[k] = true;
    input[k] = on;
  }
  document.addEventListener('keydown', function (e) {
    var k = keys[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (!k || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Enter' && e.target.closest('button, a')) return; // let Enter click things
    if (current) {
      set(k, true);
      if (e.key.indexOf('Arrow') === 0 || e.key === ' ') e.preventDefault();
    }
  });
  document.addEventListener('keyup', function (e) {
    var k = keys[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (k) set(k, false);
  });
  document.querySelectorAll('[data-key]').forEach(function (b) {
    var k = b.dataset.key;
    function press(on) { set(k, on); b.classList.toggle('down', on); }
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); press(true); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      b.addEventListener(ev, function () { press(false); });
    });
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  window.addEventListener('blur', function () {
    Object.keys(input).forEach(function (k) { input[k] = false; });
  });

  // ---- Loop ----
  function idle() {
    g.fillStyle = '#07060d';
    g.fillRect(0, 0, W, H);
    for (var i = 0; i < 40; i++) {
      var x = (i * 73) % W, y = (i * 41 + clock * (8 + (i % 5) * 6)) % H;
      g.fillStyle = i % 3 ? '#b9b0d9' : '#3bf0ff';
      g.fillRect(x, y, 2, 2);
    }
    text('RILEY COHN', W / 2, 70, '#ffd23f', 16);
    text('ARCADE', W / 2, 94, '#ff3b6b', 16);
    if (Math.floor(clock * 2) % 2) text('INSERT CARTRIDGE', W / 2, 150, '#f4f1ff', 8);
  }
  function scanlines() {
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (var y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
  }
  var last = 0;
  function frame(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    clock += dt;
    if (game) { game.update(dt); game.draw(g); } else idle();
    scanlines();
    just = {};
    requestAnimationFrame(frame);
  }
  var start = function () { requestAnimationFrame(frame); };
  if (document.fonts && document.fonts.load) {
    document.fonts.load('8px ' + FONT).then(start, start);
  } else start();
})();
