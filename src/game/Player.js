const colyseus = require('colyseus');
const schema = require('@colyseus/schema');

class Player extends schema.Schema{

    constructor(name){
      super();
      this.cards = [];
      this.name = name;
      this.test = "hellooooo";
      this.currentLocation = "";
    }

    // Deal a card to this player
    give_card(card) {
      this.cards.push(card);
    }
}

module.exports = Player;