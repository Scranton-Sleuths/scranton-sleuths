const schema = require('@colyseus/schema');
var Player = require('../../game/Player');

class GameState extends schema.Schema {
  constructor(){
    super();
    this.clientPlayers = new schema.MapSchema();
  }
}

schema.defineTypes(GameState, {
    numPlayers: "number",
    clientPlayers: { map: Player }
});

exports.GameState = GameState;