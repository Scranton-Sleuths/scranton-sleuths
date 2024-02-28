const colyseus = require('colyseus');
const { LobbyState } = require('./schema/LobbyState');

exports.Lobby = class extends colyseus.Room {
  maxClients = 6;

  onCreate (options) {
    this.setState(new LobbyState());

    this.onMessage("startGame", (client, message) => { //If we get a message to manually start the game from any client
      // Tell all clients to switch rooms
      this.broadcast("switchRoom", "MyRoom"); // Replace "MyRoom" with the game room name when it is made
      console.log(message);
    });

  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    console.log(`${this.clients.length} players in lobby.`);
    if (this.clients.length == this.maxClients) { // If all players join, move them to the game room.
        this.broadcast("switchRoom", "MyRoom"); // Replace "MyRoom" with the game room name when it is made
        // This is telling the clients to switch rooms, to the room "MyRoom". The logic behind this will have to be implemented.
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
