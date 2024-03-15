const colyseus = require('colyseus');
var Card = require("./Card");
var Player = require("./Player");


// If we want this to be the state, which might be a good choice, then this class should extend schema.Schema. Need to import that if so.
// Also, we would then need to defineTypes() of the values we want exported as part of the state
class Game {

  playerNames = ["Michael Scott", "Dwight Schrutte", "Jim Halpert", "Pam Beesly", "Angela Martin", "Andy Bernard"];
  weaponNames = ["Stapler", "Mug", "Scissors", "Dwight's Nunchucks", "Pencil", "Calculator"];
  roomNames = ["Conference Room", "Michael's Office", "Bathroom", "Kitchen", "Break Room", "Warehouse", "Annex", "Reception", "Jim's Office"];

  constructor() {

    this.playerCards = [];
    this.weaponCards = [];
    this.roomCards = [];

    this.totalCards = 6 + 6 + 9;
    this.clientPlayers = []; // Consider using MapSchema, which is part of Colyseus, to store the clients https://docs.colyseus.io/state/schema/#mapschema

    console.log("Creating card objects!");

    this.create_all_cards();

    this.isGameOver = false;
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
  init(playerCount) {
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

    // Create client players
    for(var ii = 0; ii < playerCount; ii++) {
      this.clientPlayers.push(new Player());
    }

    // Deal cards
    var playerIdx = 0;
    for(var ii = 0; ii < this.totalCards - 3; ii++) {
      if(playerIdx == 4) {
        playerIdx = 0;
      }

      this.clientPlayers[playerIdx].give_card(shuffledCards[ii]);
      
      playerIdx++;
    }
  }
}

module.exports = Game;