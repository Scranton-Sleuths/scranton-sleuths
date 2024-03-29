const schema = require('@colyseus/schema');
var Player = require('../../game/Player');

class GameState extends schema.Schema {
  constructor(){
    super();
    this.numPlayers = 6;
  }
}

schema.defineTypes(GameState, {
    numPlayers: "int",
    clientPlayers: { map: Player }
});

exports.GameState = GameState;