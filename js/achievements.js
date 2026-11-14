// Site-wide achievements, stored in this browser only.
(function () {
  var KEY = 'riley.achievements';
  var LIST = {
    boot: ['First boot', 'Showed up'],
    hacker: ['Hacker', 'Ran a terminal command'],
    curious: ['Curious', 'Found the secret command'],
    diver: ['Dumpster diver', 'Looked in the trash'],
    mover: ['Interior designer', 'Dragged a window'],
    konami: ['Old school', 'Entered the code'],
    player: ['Player one', 'Inserted a cartridge'],
  };
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}

  function toast(name) {
    var el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.textContent = 'Achievement unlocked: ' + name;
    el.style.cssText =
      'position:fixed;right:16px;bottom:16px;z-index:9999;max-width:calc(100% - 32px);' +
      'box-sizing:border-box;padding:12px 16px;background:#f4c95d;color:#1b1b1b;' +
      'border:3px solid #1b1b1b;box-shadow:6px 6px 0 #1b1b1b;' +
      "font:700 13px 'Silkscreen',monospace";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 3500);
  }

  var ids = Object.keys(LIST);
  window.Ach = {
    list: LIST,
    total: ids.length,
    has: function (id) { return !!state[id]; },
    count: function () { return ids.filter(function (id) { return state[id]; }).length; },
    unlock: function (id) {
      if (!LIST[id] || state[id]) return false;
      state[id] = Date.now();
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      toast(LIST[id][0]);
      document.dispatchEvent(new CustomEvent('achievement', { detail: id }));
      return true;
    },
  };

  var code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    pos = e.key === code[pos] ? pos + 1 : e.key === code[0] ? 1 : 0;
    if (pos === code.length) { pos = 0; window.Ach.unlock('konami'); }
  });
})();
