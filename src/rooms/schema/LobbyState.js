const schema = require('@colyseus/schema');

class LobbyState extends schema.Schema {
  constructor(){
    super();
    this.roomName = "Lobby";
    this.numPlayers = 0;
  }
}

schema.defineTypes(LobbyState, {
    roomName: "string",
    numPlayers: "number"
});

exports.LobbyState = LobbyState;