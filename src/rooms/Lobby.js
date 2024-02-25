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
    this.state.numPlayers += 1;
    console.log(`${this.state.numPlayers} players in lobby.`);
    if (this.state.numPlayers == this.maxClients) { // If all players join, move them to the game room.
        this.broadcast("switchRoom", "MyRoom"); // Replace "MyRoom" with the game room name when it is made
        this.state.numPlayers = 0; // No more players in lobby
    }
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
    this.state.numPlayers -= 1;
    console.log(`${this.state.numPlayers} players in lobby.`);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.state.numPlayers = 0;
    console.log(`${this.state.numPlayers} players in lobby.`);
  }

}
