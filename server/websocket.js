const EventEmitter = require('events');
const WebSocket = require('ws');
const cookie = require('cookie');
const logger = require('./logger');
const games = require('./storage/games');

class GameWatcher extends EventEmitter {
  constructor(gameId) {
    super();
    /** @type {number} */
    this.watchInterval = setInterval(() => {
      if (this.listenerCount('update') === 0) {
        return;
      }

      logger.debug('reading game ' + gameId, {
        listenerCount: this.listenerCount('update')
      });
      games.read(gameId).then((game) => {
        this.emit('update', game);
      });
    }, 1000);
  }
}

/** @type {Object.<number,GameWatcher>} */
const watchers = {};

setInterval(() => {
  for (const key in watchers) {
    // eslint-disable-next-line no-prototype-builtins
    if (watchers.hasOwnProperty(key)) {
      const element = watchers[key];

      if (element.listenerCount('update') === 0) {
        logger.info('cleaning up GameWatcher ' + key);
        clearInterval(element);
        delete watchers[key];
      }
    }
  }
}, 30000);

const watchGame = (gameId, ws, playerIndex) => {
  if (!watchers[gameId]) {
    watchers[gameId] = new GameWatcher(gameId);
  }

  let lastUpdate = '';
  const listener = (game) => {
    const newUpdate = JSON.stringify(game.forPlayer(playerIndex));
    if (lastUpdate !== newUpdate) {
      ws.send(newUpdate);
      lastUpdate = newUpdate;
    }
  };
  watchers[gameId].addListener('update', listener);
  ws.on('close', () => {
    watchers[gameId].removeListener('update', listener);
  });
};

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws, request) => {
    const { sessionid } = cookie.parse(request.headers.cookie);
    let gameId;

    try {
      [, gameId] = request.url.match(/\/games\/([0-9]+?)\/ws$/);
    } catch (e) {
      logger.info('unable to parse gameId from request URL ', request.url);
      ws.close();
      return;
    }

    if (!gameId) {
      ws.close();
      return;
    }

    games
      .read(gameId)
      .then((game) => {
        const playerIndex = game.players.findIndex(
          (p) => p.sessionid === sessionid
        );
        if (playerIndex === -1) {
          ws.close();
        }

        watchGame(gameId, ws, playerIndex);
      })
      .catch((e) => {
        logger.warn(e.message, { stack: e.stack });
        ws.close();
      });
  });
};
