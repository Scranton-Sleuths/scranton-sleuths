const colyseus = require('colyseus');

class Game {

  constructor(playerFirst, answerPlayer, answerWeapon, answerRoom) {
    this.playerTurn = playerFirst;
    this.isGameOver = false;
    this.answerPlayer = answerPlayer;
    this.answerWeapon = answerWeapon;
    this.answerRoom = answerRoom;

    init();

    console.log("Initialized game!");
  }

  init() {
    console.log("Starting init!");
  }
}

module.exports = Game;