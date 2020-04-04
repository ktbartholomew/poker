const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const cookieparser = require('cookie-parser');
const cloneDeep = require('lodash/cloneDeep');
const Game = require('./server/game');

const app = express();
app.use(cookieparser());
const games = {};

app.use((req, res, next) => {
  if (!req.cookies || !req.cookies.sessionid) {
    res.cookie('sessionid', crypto.randomBytes(32).toString('hex'), {
      path: '/',
      httpOnly: true
    });
  }

  next();
});

app.use('/api/games/:gameId', (req, res, next) => {
  const game = games[req.params.gameId];

  if (!game) {
    res.status(404);
    res.end();
    return;
  }

  if (
    game.players.filter((p) => {
      return p.sessionid === req.cookies.sessionid;
    }).length === 0 &&
    game.locked
  ) {
    res.status(403);
    res.end();
    return;
  }

  return next();
});

app.post('/api/games', (req, res) => {
  const gameId = Math.floor(100000 + Math.random() * 899999);
  games[gameId] = new Game();

  res.set('location', `/api/games/${gameId}`);
  res.status(201);
  res.end();
});

app.post('/api/games/:gameId/join', bodyParser.json(), (req, res) => {
  if (!req.body || !req.body.name || typeof req.body.name !== 'string') {
    res.status(400);
    res.end();
    return;
  }

  games[req.params.gameId].addPlayer({
    name: req.body.name,
    sessionid: req.cookies.sessionid
  });

  res.status(202);
  res.end();
});

app.post('/api/games/:gameId/deal', (req, res) => {
  const game = games[req.params.gameId];
  if (req.cookies.sessionid !== game.players[0].sessionid) {
    res.status(403);
    res.end();
    return;
  }

  game.deal();
  res.status(202);
  res.end();
});

app.post('/api/games/:gameId/draw', (req, res) => {
  const game = games[req.params.gameId];
  if (req.cookies.sessionid !== game.players[0].sessionid) {
    res.status(403);
    res.end();
    return;
  }

  game.turnCard();
  res.status(202);
  res.end();
});

app.post('/api/games/:gameId/showCards', (req, res) => {
  const game = games[req.params.gameId];
  if (req.cookies.sessionid !== game.players[0].sessionid) {
    res.status(403);
    res.end();
    return;
  }

  game.showCards();
  res.status(202);
  res.end();
});

app.post('/api/games/:gameId/fold', (req, res) => {
  const game = games[req.params.gameId];

  const playerIndex = game.players.findIndex((p) => {
    return p.sessionid === req.cookies.sessionid;
  });

  const peopleWithCards = game.players.filter((p) => {
    return p.cards.length > 0;
  }).length;

  if (peopleWithCards <= 1) {
    res.status(400);
    res.end();
    return;
  }

  game.players[playerIndex].cards = [];

  res.status(202);
  res.end();
});

app.post('/api/games/:gameId/bet', bodyParser.json(), (req, res) => {
  const game = games[req.params.gameId];
  const { amount } = req.body;

  if (!Number.isInteger(amount) || amount <= 0) {
    res.status(400);
    res.end();
    return;
  }

  const player = game.players.find((p) => {
    return p.sessionid === req.cookies.sessionid;
  });

  if (player.cards.length !== 2) {
    res.status(400);
    res.end();
    return;
  }

  if (player.money < amount) {
    res.status(400);
    res.end();
    return;
  }

  player.money -= amount;
  game.money += amount;

  res.status(202);
  res.end();
});

app.post('/api/games/:gameId/giveMoney', bodyParser.json(), (req, res) => {
  const { player, amount } = req.body;
  const game = games[req.params.gameId];

  if (req.cookies.sessionid !== game.players[0].sessionid) {
    res.status(403);
    res.end();
    return;
  }

  if (
    !Number.isInteger(amount) ||
    amount <= 0 ||
    !game.players[player] ||
    game.players[player].cards.length === 0
  ) {
    res.status(400);
    res.end();
    return;
  }

  game.giveMoney(player, amount);
  res.status(202);
  res.end();
  return;
});

app.get('/api/games/:gameId', (req, res) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!games.hasOwnProperty(req.params.gameId)) {
    res.status(404);
    res.end();
    return;
  }

  const game = cloneDeep(games[req.params.gameId]);

  game.players = game.players.map((p) => {
    if (p.sessionid !== req.cookies.sessionid) {
      return {
        name: p.name,
        cards: p.cards.map((c) => {
          return c.show ? c : null;
        }),
        money: p.money,
        me: false
      };
    }

    return {
      name: p.name,
      cards: p.cards,
      money: p.money,
      me: true
    };
  });

  game.deck = game.deck.length;

  res.set('content-type', 'application/json');
  res.send(JSON.stringify(game, null, 2));
});

app.use(express.static('dist'));

app.use((req, res) => {
  if (!res.headersSent) {
    res.sendFile(__dirname + '/dist/index.html');
  }
});

app.listen(3000, () => {
  console.log('listening on :3000');
});
