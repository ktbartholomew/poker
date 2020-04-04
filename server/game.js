const Card = require('./card');

class Game {
  constructor() {
    this.players = [];
    this.pile = [];
    this.money = 0;
    this.deck = newDeck();
    this.dealer = -1;
    this.locked = false;
  }

  drawCard() {
    return this.deck.shift();
  }

  turnCard() {
    this.pile.push({ card: this.drawCard(), show: true });
  }

  cardsRemaining() {
    return this.deck.length;
  }

  addPlayer(player) {
    if (this.locked) {
      throw new Error('game is locked');
    }

    this.players.push({ ...player, cards: [], money: 200 });
  }

  showCards() {
    this.players.forEach((p) => {
      p.cards.forEach((c) => {
        c.show = true;
      });
    });
  }

  giveMoney(player, amount) {
    this.players[player].money += amount;
    this.money = 0;
  }

  deal() {
    this.locked = true;
    this.dealer = this.dealer + 1 < this.players.length ? this.dealer + 1 : 0;
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
