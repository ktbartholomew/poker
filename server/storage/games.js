const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const Game = require('../game');

class GameStorage {
  constructor(path) {
    this.path = path;
    this.ready = false;

    this.initializeStorage(this.path).then(() => {
      this.ready = true;
    });
  }

  async initializeStorage(path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (!err && stats.isDirectory()) {
          return resolve();
        }

        logger.info('creating storage directory ' + path);
        fs.mkdir(path, (err) => {
          if (err) {
            return reject();
          }

          return resolve();
        });
      });
    });
  }

  async read(gameId) {
    if (!this.ready) {
      return Promise.reject(new Error('GameStorage not ready'));
    }

    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(this.path, gameId + '.json'), (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        try {
          const g = new Game(JSON.parse(data.toString()));
          return resolve(g);
        } catch (e) {
          return reject(e);
        }
      });
    });
  }

  async write(gameId, game) {
    if (!this.ready) {
      return Promise.reject(new Error('GameStorage not ready'));
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.resolve(this.path, gameId + '.json'),
        game.toJSON(),
        (err) => {
          if (err) {
            return reject(err);
          }

          return resolve();
        }
      );
    });
  }
}

const store = new GameStorage(
  process.env.STORAGE_PATH || path.resolve(__dirname, '../../storage')
);

module.exports = store;
