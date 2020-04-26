const Card = require('./card');

/**
 * @typedef {Object} Player
 * @property {string} sessionid
 * @property {Array<Card>} cards
 *
 */

/**
 * @typedef {Object} PublicGame a Game as presented to a user, with secret info redacted
 * @property {Array<Player>} players
 * @property {number} deck the number of cards remaining in the deck
 * @property {number} money the amount of money on the table
 * @property {number} dealer the index of the player who is the current dealer
 * @property {number} turn the index of the player whose turn it is to play
 * @property {boolean} locked whether the game is locked (has already begun)
 */

const BUY_IN = 200;

const blankGame = () => {
  return {
    players: [],
    pile: [],
    money: 0,
    deck: newDeck(),
    dealer: -1,
    turn: 0,
    locked: false
  };
};

class Game {
  constructor(options) {
    options = options || blankGame();

    /** @type {Array<Player>} */
    this.players = options.players;

    /** @type {Array<Card>} */
    this.pile = options.pile;

    /** @type {number} */
    this.money = options.money;

    /** @type {Array<Card>} */
    this.deck = options.deck;

    /** @type {number} */
    this.dealer = options.dealer;

    /** @type {number} */
    this.turn = options.turn;

    /** @type {boolean} */
    this.locked = options.locked;
  }

  drawCard() {
    return this.deck.shift();
  }

  turnCard() {
    this.pile.push({ card: this.drawCard(), show: true });
    this.turn = this.nextActivePlayer(this.dealer + 1, this.players);
  }
  cardsRemaining() {
    return this.deck.length;
  }

  addPlayer(player) {
    if (this.locked) {
      throw new Error('game is locked');
    }

    this.players.push({ ...player, cards: [], money: BUY_IN, bet: 0 });
  }

  showCards() {
    this.players.forEach((p) => {
      p.cards.forEach((c) => {
        c.show = true;
      });
    });
  }

  collectBets() {
    this.players.forEach((p) => {
      this.money += p.bet;
      p.bet = 0;
    });
  }

  giveMoney(player) {
    this.players[player].money += this.money;
    this.money = 0;
  }

  adjustBankroll(players) {
    if (players.length !== this.players.length) {
      throw new Error(
        'provided list of players does not match number of players in the game'
      );
    }

    players.forEach((p, idx) => {
      this.players[idx].money = parseInt(p.money) || 0;
    });
  }

  nextActivePlayer(current, players) {
    const p = players[current % players.length];
    if (p.money !== 0 && p.cards.length !== 0) {
      return current % players.length;
    }

    return this.nextActivePlayer((current + 1) % players.length, players);
  }

  takeTurn(player, bet, fold) {
    if (fold === true) {
      this.players[player].cards = [];
      this.turn = this.nextActivePlayer(this.turn + 1, this.players);
      return;
    }

    if (!Number.isInteger(bet) || bet < 0) {
      throw new Error('bet must be an integer');
    }

    if (this.players[player].cards.length !== 2) {
      throw new Error('player is not holding two cards');
    }

    if (this.players[player].money < bet) {
      throw new Error('player does not have enough money to bet');
    }

    this.players[player].money -= bet;
    this.players[player].bet += bet;

    this.turn = this.nextActivePlayer(this.turn + 1, this.players);
  }

  deal() {
    this.locked = true;
    this.deck = newDeck();
    this.pile = [];
    this.money = 0;
    this.players.forEach((p) => {
      p.cards = [];
    });

    for (let i = 0; i < 2; i++) {
      this.players.forEach((p, j) => {
        if (p.money > 0) {
          this.players[j].cards.push({ card: this.drawCard(), show: false });
        }
      });
    }

    // this.nextActivePlayer requires the players to have cards first
    this.dealer = this.nextActivePlayer(this.dealer + 1, this.players);
    this.turn = this.nextActivePlayer(this.dealer + 1, this.players);
  }

  /**
   *
   * @param {number} playerIndex The index of the player to format the game for
   * @returns {PublicGame} the game, with sensitive info redacted
   */
  forPlayer(playerIndex) {
    const publicGame = {
      players: [],
      deck: this.deck.length,
      pile: [...this.pile],
      money: this.money,
      dealer: this.dealer,
      turn: this.turn,
      locked: this.locked
    };

    publicGame.players = this.players.map((p, idx) => {
      if (idx !== playerIndex) {
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

    return publicGame;
  }

  /**
   * @returns {string} JSON-serialized game
   */
  toJSON() {
    return JSON.stringify({ ...this });
  }
}

const shuffle = (array) => {
  const a = [...array];
  var currentIndex = a.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = a[currentIndex];
    a[currentIndex] = a[randomIndex];
    a[randomIndex] = temporaryValue;
  }

  return a;
};

const newDeck = () => {
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const suits = [1, 2, 3, 4];

  const orderedDeck = [];
  suits.forEach((s) => {
    ranks.forEach((r) => {
      orderedDeck.push(new Card(r, s));
    });
  });

  return shuffle(orderedDeck);
};

module.exports = Game;
