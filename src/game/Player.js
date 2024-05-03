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
      this.isActive = true;
      this.isNPC = false;
    }

    // Deal a card to this player
    give_card(card) {
      this.cards.push(card);
    }
}

module.exports = Player;