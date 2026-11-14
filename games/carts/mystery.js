// Placeholder cartridge for the next game.
Arcade.register({
  id: 'mystery',
  title: '???',
  color: '#b9b0d9',
  blurb: 'Label fell off. Still in the lab.',
  scored: false,
  create: function (api) {
    return {
      update: function () {},
      draw: function (g) {
        for (var y = 0; y < api.H; y += 4) {
          for (var x = 0; x < api.W; x += 4) {
            var v = Math.floor(Math.random() * 70);
            g.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 20) + ')';
            g.fillRect(x, y, 4, 4);
          }
        }
        g.fillStyle = '#07060d';
        g.fillRect(60, 96, 200, 48);
        api.text('COMING SOON', api.W / 2, 112, '#ffd23f', 12);
      },
    };
  },
});
