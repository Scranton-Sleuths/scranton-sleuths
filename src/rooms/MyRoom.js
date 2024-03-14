const colyseus = require('colyseus');
const { MyRoomState } = require('./schema/MyRoomState');
var Game = require("../game/Game");

exports.MyRoom = class extends colyseus.Room {
  maxClients = 4;

  onCreate (options) {
    this.setState(new MyRoomState());

    var game = new Game();

    this.onMessage("startGame", (client, message) => {
      game.init(4);
    });

  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
