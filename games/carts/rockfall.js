// Rockfall: dodge the rocks, grab the stars.
Arcade.register({
  id: 'rockfall',
  title: 'Rockfall',
  color: '#ff3b6b',
  blurb: 'Dodge rocks. Grab stars.',
  create: function (api) {
    var W = api.W, H = api.H, FLOOR = H - 16, s;
    function reset(playing) {
      s = { x: W / 2, rocks: [], stars: [], t: 0, score: 0, spawn: 0, playing: playing, over: false, record: false };
    }
    reset(false);
    function hit(o, r) { return Math.abs(o.x - s.x) < r + 5 && Math.abs(o.y - (FLOOR - 6)) < r + 6; }

    return {
      update: function (dt) {
        if (!s.playing) { if (api.pressed('a')) reset(true); return; }
        s.t += dt;
        s.score += dt * 10;
        var dir = (api.input.right ? 1 : 0) - (api.input.left ? 1 : 0);
        s.x = Math.max(6, Math.min(W - 6, s.x + dir * 130 * dt));
        s.spawn -= dt;
        if (s.spawn <= 0) {
          s.spawn = Math.max(0.16, 0.55 - s.t * 0.01);
          s.rocks.push({ x: 8 + Math.random() * (W - 16), y: -10, v: 60 + Math.random() * 60 + s.t * 2, r: 4 + Math.random() * 5 });
          if (Math.random() < 0.18) s.stars.push({ x: 8 + Math.random() * (W - 16), y: -10, v: 55 });
        }
        s.rocks.forEach(function (o) { o.y += o.v * dt; });
        s.stars.forEach(function (o) { o.y += o.v * dt; });
        s.stars = s.stars.filter(function (o) {
          if (hit(o, 4)) { s.score += 50; return false; }
          return o.y < H;
        });
        s.rocks = s.rocks.filter(function (o) { return o.y < H + 10; });
        if (s.rocks.some(function (o) { return hit(o, o.r - 1); })) {
          s.playing = false;
          s.over = true;
          s.record = api.submit(s.score);
        }
      },
      draw: function (g) {
        g.fillStyle = '#120b26';
        g.fillRect(0, 0, W, H);
        g.fillStyle = '#3a2a5c';
        g.fillRect(0, FLOOR, W, H - FLOOR);
        s.rocks.forEach(function (o) {
          g.fillStyle = '#b9b0d9';
          g.fillRect(Math.round(o.x - o.r), Math.round(o.y - o.r), Math.round(o.r * 2), Math.round(o.r * 2));
          g.fillStyle = '#6f6690';
          g.fillRect(Math.round(o.x - o.r), Math.round(o.y), Math.round(o.r * 2), Math.round(o.r));
        });
        s.stars.forEach(function (o) {
          g.fillStyle = '#ffd23f';
          g.fillRect(Math.round(o.x - 1), Math.round(o.y - 4), 2, 8);
          g.fillRect(Math.round(o.x - 4), Math.round(o.y - 1), 8, 2);
        });
        g.fillStyle = s.over ? '#ff3b6b' : '#3bf0ff';
        g.fillRect(Math.round(s.x - 5), FLOOR - 12, 10, 12);
        g.fillStyle = '#07060d';
        g.fillRect(Math.round(s.x - 3), FLOOR - 9, 2, 2);
        g.fillRect(Math.round(s.x + 1), FLOOR - 9, 2, 2);

        api.text('SCORE ' + Math.floor(s.score), 6, 6, '#f4f1ff', 8, 'left');
        api.text('BEST ' + api.best(), W - 6, 6, '#ffd23f', 8, 'right');
        if (!s.playing) {
          api.text(s.over ? 'GAME OVER' : 'ROCKFALL', W / 2, 80, '#ff3b6b', 16);
          if (s.record) api.text('NEW BEST!', W / 2, 108, '#7dff8a');
          api.text('PRESS A TO ' + (s.over ? 'RETRY' : 'START'), W / 2, 130, '#f4f1ff');
          if (!s.over) api.text('LEFT AND RIGHT TO MOVE', W / 2, 150, '#b9b0d9');
        }
      },
    };
  },
});
