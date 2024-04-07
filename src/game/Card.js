const colyseus = require('colyseus');

class Card {

  constructor(type, name){
    this.type = type;
    this.name = name;
  }
}

module.exports = Card;