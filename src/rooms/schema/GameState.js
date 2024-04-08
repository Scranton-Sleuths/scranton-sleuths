const schema = require('@colyseus/schema');
var Player = require('../../game/Player');
var Location = require('../../game/Location');

class GameState extends schema.Schema {
  constructor(){
    super();
    this.clientPlayers = new schema.MapSchema();
    this.board = new schema.MapSchema();
  }
}

schema.defineTypes(GameState, {
    numPlayers: "number",
    clientPlayers: { map: Player },
    board: { map: Location}
});

schema.defineTypes(Location, {
  x: "number",
  y: "number",
  name: "string",
  type: "string",
  adjacentLocations: "string"
});

exports.GameState = GameState;