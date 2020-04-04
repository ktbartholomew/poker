const express = require('express');
const bodyParser = require('body-parser');
const Game = require('./game');
const games = require('./storage/games');
const logger = require('./logger');

const router = express.Router();

router.use('/games/:gameId', (req, res, next) => {
  games
    .read(req.params.gameId)
    .then((game) => {
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
    })
    .catch((err) => {
      logger.warn(err);
      logger.warn(`game ${req.params.gameId} does not exist`);
      res.status(404);
      res.end();
      return;
    });
});

router.post('/games', (req, res) => {
  const gameId = Math.floor(100000 + Math.random() * 899999);

  games.write(gameId, new Game()).then(() => {
    res.set('location', `/api/games/${gameId}`);
    res.status(201);
    res.end();
  });
});

router.post('/games/:gameId/join', bodyParser.json(), (req, res) => {
  const { gameId } = req.params;
  if (!req.body || !req.body.name || typeof req.body.name !== 'string') {
    res.status(400);
    res.end();
    return;
  }

  games
    .read(gameId)
    .then((game) => {
      game.addPlayer({
        name: req.body.name,
        sessionid: req.cookies.sessionid
      });

      return games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/deal', (req, res) => {
  const { gameId } = req.params;
  games
    .read(gameId)
    .then((game) => {
      if (req.cookies.sessionid !== game.players[0].sessionid) {
        res.status(403);
        res.end();
        return;
      }

      game.deal();
      return games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/draw', (req, res) => {
  const { gameId } = req.params;
  games
    .read(gameId)
    .then((game) => {
      if (req.cookies.sessionid !== game.players[0].sessionid) {
        res.status(403);
        res.end();
        return;
      }

      game.turnCard();
      return games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/showCards', (req, res) => {
  const { gameId } = req.params;
  games
    .read(gameId)
    .then((game) => {
      if (req.cookies.sessionid !== game.players[0].sessionid) {
        res.status(403);
        res.end();
        return;
      }

      game.showCards();
      return games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/fold', (req, res) => {
  const { gameId } = req.params;
  games
    .read(gameId)
    .then((game) => {
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
      games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/bet', bodyParser.json(), (req, res) => {
  const { gameId } = req.params;
  games
    .read(gameId)
    .then((game) => {
      const { amount } = req.body;

      if (!Number.isInteger(amount) || amount < 0) {
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

      // Zero is a special case; the player is resetting their bet, perhaps due
      // to a mistaken earlier bet
      if (amount === 0) {
        player.money += player.bet;
        player.bet = 0;
      } else {
        // All other bets are additive
        player.money -= amount;
        player.bet += amount;
      }

      games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});
router.post('/games/:gameId/collectBets', (req, res) => {
  const { gameId } = req.params;
  games
    .read(gameId)
    .then((game) => {
      if (req.cookies.sessionid !== game.players[0].sessionid) {
        res.status(403);
        res.end();
        return;
      }

      game.collectBets();
      return games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/giveMoney', bodyParser.json(), (req, res) => {
  const { gameId } = req.params;
  const { player } = req.body;
  games
    .read(gameId)
    .then((game) => {
      if (req.cookies.sessionid !== game.players[0].sessionid) {
        res.status(403);
        res.end();
        return;
      }

      if (!game.players[player] || game.players[player].cards.length === 0) {
        res.status(400);
        res.end();
        return;
      }

      game.giveMoney(player);
      return games.write(gameId, game);
    })
    .then(() => {
      res.status(202);
      res.end();
    });
});

router.get('/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  games.read(gameId).then((game) => {
    game.players = game.players.map((p) => {
      if (p.sessionid !== req.cookies.sessionid) {
        return {
          name: p.name,
          cards: p.cards.map((c) => {
            return c.show ? c : null;
          }),
          money: p.money,
          bet: p.bet,
          me: false
        };
      }

      return {
        name: p.name,
        cards: p.cards,
        money: p.money,
        bet: p.bet,
        me: true
      };
    });

    game.deck = game.deck.length;

    res.set('content-type', 'application/json');
    res.send(game.toJSON());
  });
});

module.exports = router;
