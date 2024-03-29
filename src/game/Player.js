const colyseus = require('colyseus');

class Player {

    constructor(name){
      this.cards = [];
      this.name = name;
    }

    // Deal a card to this player
    give_card(card) {
      this.cards.push(card);
    }
}

module.exports = Player;