const colyseus = require('colyseus');
const schema = require('@colyseus/schema');

class Card extends schema.Schema {

  constructor(type, name){
    super();
    this.type = type;
    this.name = name;
  }
}

module.exports = Card;