const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
const ArraySchema = schema.ArraySchema;

class Player extends schema.Schema{

    constructor(name, x, y){
      super();
      this.cards = new ArraySchema();
      this.name = name;
      this.test = "hellooooo";
      this.currentLocation = "";
      this.startX = x;
      this.startY = y;
    }
}

module.exports = Player;