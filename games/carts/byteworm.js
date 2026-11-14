// Byte Worm: eat bytes, grow longer, don't bite yourself or the wall.
Arcade.register({
  id: 'byteworm',
  title: 'Byte Worm',
  color: '#7dff8a',
  blurb: 'Eat bytes. Grow. Don\'t crash.',
  create: function (api) {
    var W = api.W, H = api.H, CELL = 16, TOP = 32, COLS = W / CELL, ROWS = (H - TOP) / CELL, s;
    function food() {
      var f;
      do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
      while (s.body.some(function (b) { return b.x === f.x && b.y === f.y; }));
      return f;
    }
    function reset(playing) {
      s = { body: [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 },
        acc: 0, score: 0, playing: playing, over: false, record: false };
      s.food = food();
    }
    reset(false);
    function turn(x, y) { if (s.dir.x !== -x || s.dir.y !== -y) s.next = { x: x, y: y }; }

    return {
      update: function (dt) {
        if (!s.playing) { if (api.pressed('a')) reset(true); return; }
        if (api.pressed('up')) turn(0, -1);
        if (api.pressed('down')) turn(0, 1);
        if (api.pressed('left')) turn(-1, 0);
        if (api.pressed('right')) turn(1, 0);
        s.acc += dt;
        var step = Math.max(0.06, 0.14 - s.body.length * 0.002);
        if (s.acc < step) return;
        s.acc = 0;
        s.dir = s.next;
        var head = { x: s.body[0].x + s.dir.x, y: s.body[0].y + s.dir.y };
        var ate = head.x === s.food.x && head.y === s.food.y;
        if (!ate) s.body.pop();
        var dead = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
          s.body.some(function (b) { return b.x === head.x && b.y === head.y; });
        if (dead) {
          s.playing = false;
          s.over = true;
          s.record = api.submit(s.score);
          return;
        }
        s.body.unshift(head);
        if (ate) { s.score += 10; s.food = food(); }
      },
      draw: function (g) {
        g.fillStyle = '#07130b';
        g.fillRect(0, 0, W, H);
        g.fillStyle = '#0e2415';
        g.fillRect(0, TOP, W, H - TOP);
        g.fillStyle = '#ffd23f';
        g.fillRect(s.food.x * CELL + 4, TOP + s.food.y * CELL + 4, 8, 8);
        s.body.forEach(function (b, i) {
          g.fillStyle = s.over ? '#ff3b6b' : i ? '#4fc26a' : '#7dff8a';
          g.fillRect(b.x * CELL + 1, TOP + b.y * CELL + 1, CELL - 2, CELL - 2);
        });
        api.text('SCORE ' + s.score, 6, 12, '#f4f1ff', 8, 'left');
        api.text('BEST ' + api.best(), W - 6, 12, '#ffd23f', 8, 'right');
        if (!s.playing) {
          api.text(s.over ? 'GAME OVER' : 'BYTE WORM', W / 2, 90, '#7dff8a', 16);
          if (s.record) api.text('NEW BEST!', W / 2, 118, '#ffd23f');
          api.text('PRESS A TO ' + (s.over ? 'RETRY' : 'START'), W / 2, 140, '#f4f1ff');
        }
      },
    };
  },
});
