const colyseus = require('colyseus');
const schema = require('@colyseus/schema');

class Location extends schema.Schema{

    constructor(x, y, name, type, adjacentLocations){
      super();
      this.x = x;
      this.y = y;
      this.name = name; // Name of the location, which will be the same as the image file
      this.type = type; // Type of location: [hallway | room]
      this.adjacentLocations = adjacentLocations; // This will be formatted as follows: "room1,room2,room4" etc
    }
}

module.exports = Location;