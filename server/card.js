class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  toString() {
    let suitString = '';
    let rankString = '';

    switch (this.suit) {
      case 1:
        suitString = '♧';
        break;
      case 2:
        suitString = '♢';
        break;
      case 3:
        suitString = '♡';
        break;
      case 4:
        suitString = '♤';
        break;
    }

    switch (this.rank) {
      case 1:
        rankString = 'A';
        break;
      case 11:
        rankString = 'J';
        break;
      case 12:
        rankString = 'Q';
        break;
      case 13:
        rankString = 'K';
        break;
      default:
        rankString = this.rank.toString();
    }

    return `${rankString}${suitString}`;
  }
}

module.exports = Card;
