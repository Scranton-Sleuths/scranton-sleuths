const colyseus = require('colyseus');
const { CardState } = require('./schema/CardState');

class Card {

  constructor(type, name){
    this.type = type;
    this.name = name;
  }
}
