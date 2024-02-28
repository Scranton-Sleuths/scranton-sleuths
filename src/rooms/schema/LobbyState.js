const schema = require('@colyseus/schema');

class LobbyState extends schema.Schema {
  constructor(){
    super();
    this.roomName = "Lobby";
  }
}

schema.defineTypes(LobbyState, {
    roomName: "string",
});

exports.LobbyState = LobbyState;