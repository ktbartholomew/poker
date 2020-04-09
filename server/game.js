const Card = require('./card');

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

    this.players = options.players;
    this.pile = options.pile;
    this.money = options.money;
    this.deck = options.deck;
    this.dealer = options.dealer;
    this.turn = options.turn;
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
