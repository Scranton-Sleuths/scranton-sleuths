const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
var Card = require("../game/Card");
var Player = require("../game/Player");
const { GameState } = require('./schema/GameState');
const MapSchema = schema.MapSchema;
var Location = require('../game/Location');

exports.Game = class extends colyseus.Room {

  playerNames = ["Michael Scott", "Dwight Schrutte", "Jim Halpert", "Pam Beesly", "Angela Martin", "Andy Bernard"];
  weaponNames = ["Stapler", "Mug", "Scissors", "Dwight's Nunchucks", "Pencil", "Calculator"];
  roomNames = ["Conference Room", "Michael's Office", "Bathroom", "Kitchen", "Break Room", "Warehouse", "Annex", "Reception", "Jim's Office"];
  roomXY = ["10,100", "300,100", "600,100", "10,275", "300,275", "600,275", "10,450", "300,450", "600,450"];
  playerStart = ["450,70", "10,208", "550,208", "10,383", "168,470", "430,470"]
  hallways = ["Conference Room_Michael's Office", "Michael's Office_Bathroom",
    "Conference Room_Kitchen", "Michael's Office_Break Room", "Bathroom_Warehouse",
    "Kitchen_Break Room", "Break Room_Warehouse",
    "Kitchen_Annex", "Break Room_Reception", "Warehouse_Jim's Office",
    "Annex_Reception", "Reception_Jim's Office"];
  hallwayXY = ["205,100", "500,100",
    "10,188", "300,188", "600,188",
    "155,275", "450,275",
    "10,363", "300,363", "600,363",
    "155,450", "450,450"]

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  onCreate(options) {

    this.setState(new GameState());

    this.playerCards = [];
    this.weaponCards = [];
    this.roomCards = [];

    this.totalCards = 6 + 6 + 9;

    this.numPlayers = 0;
    this.currentNumPlayers = 0;

    this.isGameOver = false;

    console.log("Creating card objects!");

    this.create_all_cards();

    // Create the locations

    // Creat rooms
    // this.roomNames.forEach(room => {
    //     const location = new Location(this.randomNumber(20,500), this.randomNumber(20,500), room, "room", "");
    //     this.state.board.set(room, location);
    // });
    for (let index = 0; index < this.roomNames.length; index++) {
        let x = parseInt(this.roomXY[index].split(',')[0]);
        let y = parseInt(this.roomXY[index].split(',')[1]);
        const location = new Location(x, y, this.roomNames[index], "room", ""); // TODO: Make an array of adjacent locations so we can add it here
        this.state.board.set(this.roomNames[index], location);
    }

    //Create hallways
    for (let index = 0; index < this.hallways.length; index++) {
        let x = parseInt(this.hallwayXY[index].split(',')[0]);
        let y = parseInt(this.hallwayXY[index].split(',')[1]);
        const location = new Location(x, y, this.hallways[index], "hallway", ""); // TODO: Make an array of adjacent locations so we can add it here
        this.state.board.set(this.hallways[index], location);
    }

    // TODO: Add all the onMessage functions here, like when a player clicks on a room. Ex:
        
    this.onMessage("move", (client, message) => {
      this.processMove(client, message);
    }); 
    

    this.onMessage("startGame", (client, message) => {
      this.numPlayers = message;
      console.log("Initializing a game for " + message + " players!");
      this.init();
      this.broadcast("drawboard", "", {except: client}); // Let all other clients know to draw the board
    });
    
    this.onMessage("accusation", (client, message) => {
      console.log("Accusation received!");
      this.processAccusation(client, message);
    });
  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    let x = parseInt(this.playerStart[this.currentNumPlayers].split(',')[0]);
    let y = parseInt(this.playerStart[this.currentNumPlayers].split(',')[1]);
    const player = new Player(this.playerNames[this.currentNumPlayers], x, y);
    this.state.clientPlayers.set(client.sessionId, player);

    this.currentNumPlayers += 1;
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
    this.state.clientPlayers.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  // TODO: Process a move request by a player
  processMove(client, room) {
    console.log("Move message from", client.sessionId, room);
    // See if it is possible for the client to move to the room
    // If it is, update that client's position IN THE STATE

    const player = this.state.clientPlayers.get(client.sessionId);
    // if valid move:
    player.currentLocation = room; // This line correctly updates the player in the state
    // The client will automatically see this change
  }

  processAccusation(client, accusation) {
    const player = this.state.clientPlayers.get(client.sessionId);
    console.log("Accusation from", player.name);
    console.log("Person:",accusation.person, "Place:", accusation.place, "Weapon:", accusation.weapon);
    //console.log("correct answer is");
    //console.log("Person:",this.answerPlayer, "Place:", this.answerRoom, "Weapon:", this.answerWeapon);
    if (accusation.person == this.answerPlayer.name && accusation.place == this.answerRoom.name && accusation.weapon == this.answerWeapon.name) {
      console.log("Accusation is Correct!");
      this.isGameOver = true;
      this.broadcast("correctAccusation", accusation); // Let everyone know that the player guessed correctly.
    }
    else {
      console.log("Accusation is incorrect.", player.name, "has been eliminated from the game.");
      let correctAccusation = {
        person: this.answerPlayer.name,
        place: this.answerRoom.name,
        weapon: this.answerWeapon.name
      };
      player.isActive = false;
      client.send("wrongAccusation", correctAccusation);
    }
  }

  // Create card objects for all players, weapons, and rooms
  create_all_cards() {
    for(var ii = 0; ii < this.playerNames.length; ii++) {
      this.playerCards.push(new Card('player', this.playerNames[ii]));
      this.weaponCards.push(new Card('weapon', this.weaponNames[ii]));
    }

    for(var ii = 0; ii < this.roomNames.length; ii++) {
      this.roomCards.push(new Card('room', this.roomNames[ii]));
    }
  }

  // Shuffle an array of cards
  shuffle(cards) {
    var shuffledCards = [];

    for(var ii = cards.length - 1; ii >= 0; ii--) {
      var idx = Math.floor(Math.random() * (ii + 1));

      shuffledCards[ii] = cards[idx];
      cards.splice(idx, 1);
    }

    return shuffledCards;
  }

  // Initialize the game, deal cards
  init() {
    console.log("Starting Init!");

    // Choose answer cards
    var playerCardAnswerIndex = (Math.floor(Math.random() * this.playerCards.length));
    var weaponCardAnswerIndex = (Math.floor(Math.random() * this.weaponCards.length));
    var roomCardAnswerIndex = (Math.floor(Math.random() * this.roomCards.length));

    this.answerPlayer = this.playerCards[playerCardAnswerIndex];
    this.answerWeapon = this.weaponCards[weaponCardAnswerIndex];
    this.answerRoom = this.roomCards[roomCardAnswerIndex];

    console.log("Answers are: " + this.answerPlayer.name + ", "+ this.answerWeapon.name + ", " + this.answerRoom.name);

    // Shuffle cards
    this.playerCards.splice(playerCardAnswerIndex, 1);
    this.weaponCards.splice(weaponCardAnswerIndex, 1);
    this.roomCards.splice(roomCardAnswerIndex, 1);
    var allCards = this.playerCards.concat(this.weaponCards.concat(this.roomCards));

    var shuffledCards = this.shuffle(allCards);

    var ids = [];
    // Get Player Ids
    this.state.clientPlayers.forEach((value, key) => {
      ids.push(key);
    });

    // Deal cards
    var playerIdx = 0;
    for(var ii = 0; ii < this.totalCards - 3; ii++) {
      if(playerIdx == this.numPlayers) {
        playerIdx = 0;
      }

      this.state.clientPlayers.get(ids[playerIdx]).give_card(shuffledCards[ii]);
      
      playerIdx++;
    }
    this.state.clientPlayers.forEach((player) => { console.log(player.name); console.log(player.cards)})
  }
}