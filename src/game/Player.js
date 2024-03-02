const colyseus = require('colyseus');

exports.Player = class extends colyseus.Game {
    constructor(){
      super();
      this.cards = ["Card1", "Card2", "Card3"];
    }
}