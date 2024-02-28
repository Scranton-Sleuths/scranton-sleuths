const colyseus = require('colyseus');
const { LobbyState } = require('./schema/LobbyState');

exports.Lobby = class extends colyseus.Room {
  maxClients = 6;

  onCreate (options) {
    this.setState(new LobbyState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message.
      //
    });

  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    console.log(`${this.clients.length} players in lobby.`);
    if (this.clients.length == this.maxClients) { // If all players join, move them to the game room.
        this.broadcast("switchRoom", "MyRoom"); // Replace "MyRoom" with the game room name when it is made
    }
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
    console.log(`${this.clients.length} players in lobby.`);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
