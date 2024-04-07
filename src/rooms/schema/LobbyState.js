const schema = require('@colyseus/schema');
var Player = require('../../game/Player');

class LobbyState extends schema.Schema {
  constructor(){
    super();
    this.roomName = "Lobby";
    this.numPlayers = 0;
    this.clientPlayers = new schema.MapSchema();
  }
}

schema.defineTypes(Player, {
    test: "string",
    currentLocation: "string"
});

schema.defineTypes(LobbyState, {
    roomName: "string",
    numPlayers: "number",
    clientPlayers: { map: Player }
});

exports.LobbyState = LobbyState;