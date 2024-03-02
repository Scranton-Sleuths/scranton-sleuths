const schema = require('@colyseus/schema');

class GameState extends schema.Schema {
  constructor(){
    super();
    this.playerTurn = "Player1";
    this.isGameOver = false;
    this.answerPlayer = "Dwight";
    this.answerWeapon = "";
    this.answerRoom = "";
    
  }
}

schema.defineTypes(GameState, {
  mySynchronizedProperty: "string",
});

exports.GameState = GameState;