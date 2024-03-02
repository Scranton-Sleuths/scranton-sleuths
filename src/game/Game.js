const colyseus = require('colyseus');
const { GameState } = require('./schema/GameState');

exports.Game = class extends colyseus.Game {

  onCreate (options) {
    this.setState(new GameState());

    this.onMessage("initGame", (client, message) => {
      console.log("Initializing the Game!");
    });

  }

}
