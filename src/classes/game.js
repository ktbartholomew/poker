class Game {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  money() {
    return this.data.money || 0;
  }

  players() {
    return this.data.players || [];
  }

  pile() {
    return this.data.pile || [];
  }

  dealer() {
    return this.data.dealer;
  }

  me() {
    return this.data.players.filter(({ me }) => me)[0];
  }

  isStarted() {
    return this.data.locked;
  }

  isOwner() {
    let meIndex = -1;

    this.data.players.forEach((p, idx) => {
      if (p.me) {
        meIndex = idx;
      }
    });

    return meIndex === 0;
  }
}

export default Game;
