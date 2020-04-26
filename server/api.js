const crypto = require('crypto');
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
  if (
    !req.body ||
    !req.body.name ||
    typeof req.body.name !== 'string' ||
    req.body.name.length > 20
  ) {
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

router.get('/games/:gameId/joinToken', (req, res) => {
  const { gameId } = req.params;
  games.read(gameId).then((game) => {
    if (req.cookies.sessionid !== game.players[0].sessionid) {
      res.status(403);
      res.end();
      return;
    }

    res.status(200);
    res.send({ joinToken: crypto.randomBytes(4).toString('hex') });
    return;
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

      if (game.pile.length >= 5) {
        res.status(400);
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

router.post('/games/:gameId/turns', bodyParser.json(), (req, res) => {
  const { gameId } = req.params;

  games
    .read(gameId)
    .then((game) => {
      const playerIndex = game.players.findIndex(
        ({ sessionid }) => sessionid === req.cookies.sessionid
      );
      if (playerIndex === -1) {
        res.status(403);
        res.end();
        return;
      }

      game.takeTurn(playerIndex, req.body.bet || 0, req.body.fold || false);

      return games.write(gameId, game);
    })
    .then(() => {
      if (res.headersSent) {
        return;
      }

      res.status(202);
      res.end();
      return;
    })
    .catch((e) => {
      logger.warn(e.message, { stack: e.stack });
      res.status(400);
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
      if (res.headersSent) {
        return;
      }

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
      if (res.headersSent) {
        return;
      }

      res.status(202);
      res.end();
    });
});

router.post('/games/:gameId/bankroll', bodyParser.json(), (req, res) => {
  const { gameId } = req.params;

  games
    .read(gameId)
    .then((game) => {
      if (req.cookies.sessionid !== game.players[0].sessionid) {
        res.status(403);
        res.end();
        return;
      }

      game.adjustBankroll(req.body);
      return games.write(gameId, game);
    })
    .then(() => {
      if (res.headersSent) {
        return;
      }

      res.status(202);
      res.end();
    });
});

router.get('/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  games.read(gameId).then((game) => {
    const playerIndex = game.players.findIndex(
      (p) => p.sessionid === req.cookies.sessionid
    );

    if (playerIndex === -1 && game.locked) {
      res.status(403);
      res.end();
      return;
    }

    res.set('content-type', 'application/json');
    res.send(JSON.stringify(game.forPlayer(playerIndex)));
  });
});

module.exports = router;
