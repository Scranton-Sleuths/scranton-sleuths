const colyseus = require('colyseus');
const schema = require('@colyseus/schema');

class Player extends schema.Schema{

    constructor(name, x, y){
      super();
      this.cards = [];
      this.name = name;
      this.test = "hellooooo";
      this.currentLocation = "";
      this.startX = x;
      this.startY = y;
    }

    // Deal a card to this player
    give_card(card) {
      this.cards.push(card);
    }
}

module.exports = Player;