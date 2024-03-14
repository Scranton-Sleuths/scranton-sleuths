const colyseus = require('colyseus');

class Player {

    constructor(){
      this.cards = [];
    }

    // Deal a card to this player
    give_card(card) {
      this.cards.push(card);
    }
}

module.exports = Player;