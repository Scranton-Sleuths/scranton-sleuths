const colyseus = require('colyseus');
const { LobbyState } = require('./schema/LobbyState');
const Player = require("../game/Player");

exports.Lobby = class extends colyseus.Room {
  maxClients = 6;

  onCreate (options) {
    this.setState(new LobbyState());

    this.onMessage("start", (client, message) => { //If we get a message to manually start the game from any client
      console.log("Received start message from client!")
      // Tell all clients to switch rooms
      this.broadcast("switchRoom", {room: "game", num_players: this.clients.length});
    });
    this.onMessage("test", (client, message) => { //A test message type
      // Tell all clients to switch rooms
      console.log(`Test message received from ${client.sessionId}: ${message}`);
      this.broadcast("test", `Test message from ${client.sessionId}: ${message}`, {except: client});
    });

  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    console.log(`${this.clients.length} players in lobby.`);
    const player = new Player("Bob");
    this.state.clientPlayers.set(client.sessionId, player);
    this.state.numPlayers++;
    if (this.clients.length == this.maxClients) { // If all players join, move them to the game room.
        this.broadcast("switchRoom", "Game");
        // This is telling the clients to switch rooms, to the room "Game". The logic behind this will have to be implemented.
    }
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
    console.log(`${this.clients.length} players in lobby.`);
    this.state.clientPlayers.delete(client.sessionId);
    this.state.numPlayers--;
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
