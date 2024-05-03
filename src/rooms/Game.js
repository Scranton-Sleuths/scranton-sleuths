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
  roomXY = ["160,150", "450,150", "750,150", "160,325", "450,325", "750,325", "160,500", "450,500", "750,500"];
  playerStart = ["600,70", "10,208", "850,213", "10,383", "263,580", "560,580"]
  hallways = ["Conference Room_Michael's Office", "Michael's Office_Bathroom",
    "Conference Room_Kitchen", "Michael's Office_Break Room", "Bathroom_Warehouse",
    "Kitchen_Break Room", "Break Room_Warehouse",
    "Kitchen_Annex", "Break Room_Reception", "Warehouse_Jim's Office",
    "Annex_Reception", "Reception_Jim's Office"];
  hallwayXY = ["305,150", "600,150",
    "110,238", "400,238", "700,238",
    "255,325", "550,325",
    "110,413", "400,413", "700,413",
    "255,500", "550,500"]

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
    this.turnOrder = [];
    this.currentTurnPlayer = 0;
    this.movedOnTurn = false;

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
      this.broadcast("drawboard", ""); // Let all other clients know to draw the board
    });

    this.onMessage("endTurn", (client, message) => {
      if (client.sessionId == this.turnOrder[this.currentTurnPlayer]) {
        // this player ended their turn
        this.startNextTurn();
      }
    });
    
    this.onMessage("accusation", (client, message) => {
      console.log("Accusation received!");
      this.processAccusation(client, message);
    });

    this.onMessage("suggestion", (client, message) => {
      console.log("Suggestion received!");
      this.processSuggestion(client, message);
    });
  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    let x = parseInt(this.playerStart[this.currentNumPlayers].split(',')[0]);
    let y = parseInt(this.playerStart[this.currentNumPlayers].split(',')[1]);
    const player = new Player(this.playerNames[this.currentNumPlayers], x, y);

    // Michael scott should be the first player to go.
    if(this.playerNames[this.currentNumPlayers] == "Michael Scott") {
      this.turnOrder.push(client.sessionId);
    }
    
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

  startNextTurn() {
    let sessionId;
    // find the next player in the turn order that's still active
    do {
      this.currentTurnPlayer = (this.currentTurnPlayer + 1) % this.numPlayers;
      sessionId = this.turnOrder[this.currentTurnPlayer];
    } while (!this.state.clientPlayers[sessionId].isActive);
    
    let message = {id: sessionId, name: this.state.clientPlayers[sessionId].name}
    this.broadcast("newTurn", message); 
    this.movedOnTurn = false;
  }

  // TODO: Process a move request by a player
  processMove(client, room) {
    if (client.sessionId != this.turnOrder[this.currentTurnPlayer]) {
      return; // it's not their turn!
    }
    else if (this.movedOnTurn == true) {
      return; // they already moved!
    }
    console.log("Move message from", client.sessionId, room);
    // See if it is possible for the client to move to the room
    // If it is, update that client's position IN THE STATE

    // TODO: Check if it is the players turn
    const player = this.state.clientPlayers.get(client.sessionId);

    // Secret hallways
    const secret = {
      "Conference Room": "Jim's Office",
      "Jim's Office": "Conference Room",
      "Bathroom": "Annex",
      "Annex": "Bathroom"
    };

    // Initial player move
    if (player.currentLocation === "") {
      const firstMoveLocations = {
        "Michael Scott": "Michael's Office_Bathroom",
        "Dwight Schrutte": "Conference Room_Kitchen",
        "Jim Halpert": "Bathroom_Warehouse",
        "Pam Beesly": "Kitchen_Annex",
        "Angela Martin": "Annex_Reception",
        "Andy Bernard": "Reception_Jim's Office"
      }
      const requiredRoom = firstMoveLocations[player.name];
      if (requiredRoom === room) {
          player.currentLocation = room;
          this.movedOnTurn = true;
      } 
    }
    else if (player.currentLocation in secret && secret[player.currentLocation] == room) { // Secret hallways
      player.currentLocation = room;
      this.movedOnTurn = true;
    }
    // If the player chooses a room that has the current room name in it,
    // Then we can make the move
    else{
      // Hallway to room
      if(player.currentLocation.includes("_")){
        if(player.currentLocation.includes(room)){
          player.currentLocation = room;
          this.movedOnTurn = true;
        }
      }
      else{
        // Room to hallway
        // TODO Check if hallway has a player in it.
        if(room.includes(player.currentLocation)){
          player.currentLocation = room;
          this.movedOnTurn = true;
        }
      }
    }
  
    // If valid move:
    // player.currentLocation = room; // This line correctly updates the player in the state
    // The client will automatically see this change
  }

  processAccusation(client, accusation) {
    if (client.sessionId != this.turnOrder[this.currentTurnPlayer]) {
      return; // it's not their turn!
    }

    const player = this.state.clientPlayers.get(client.sessionId);
    console.log("Accusation from", player.name);
    console.log("Person:",accusation.person, "Place:", accusation.place, "Weapon:", accusation.weapon);
    //console.log("correct answer is");
    //console.log("Person:",this.answerPlayer, "Place:", this.answerRoom, "Weapon:", this.answerWeapon);
    let correctAccusation = {
      id: client.sessionId,
      accuser: player.name,
      person: this.answerPlayer.name,
      place: this.answerRoom.name,
      weapon: this.answerWeapon.name
    };
    if (accusation.person == this.answerPlayer.name && accusation.place == this.answerRoom.name && accusation.weapon == this.answerWeapon.name) {
      console.log("Accusation is Correct!");
      this.isGameOver = true;
      this.broadcast("correctAccusation", correctAccusation); // Let everyone know that the player guessed correctly.
    }
    else {
      console.log("Accusation is incorrect.", player.name, "has been eliminated from the game.");
      player.isActive = false;
      client.send("wrongAccusation", correctAccusation);
    }
  }

  processSuggestion(client, suggestion){
    // TODO If it is the current players turn

    const player = this.state.clientPlayers.get(client.sessionId);
    

    if(!player.currentLocation.includes("_") && player.currentLocation === suggestion.place && player.name != suggestion.person){
      const suggestionMade = {
        accuser: player.name,
        person: suggestion.person,
        place: suggestion.place,
        weapon: suggestion.weapon
      }
      let suggestedPlayer;
      for (const playerObj of this.state.clientPlayers.values()) {
        if (playerObj.name === suggestion.person) {
            suggestedPlayer = playerObj;
        }
      }

      if(suggestedPlayer){
        this.broadcast("suggestionMade", suggestionMade); 
        suggestedPlayer.currentLocation = player.currentLocation;
      }
  }

    // TODO:
    // Go around and ask players if they have a card to show to prove 
    // Suggestion wrong

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

  // Shuffle an array
  shuffle(arr) {
    var shuffledArr = [];

    for(var ii = arr.length - 1; ii >= 0; ii--) {
      var idx = Math.floor(Math.random() * (ii + 1));
      shuffledArr[ii] = arr[idx];
      arr.splice(idx, 1);
    }

    return shuffledArr;
  }

  // Randomize the turn order for Players
  randomize_turn_order() {
    var unshuffled_turns = []

    this.state.clientPlayers.forEach((value, key) => {
      if(value.name != "Michael Scott") {
        unshuffled_turns.push(key);
      } 
    });

    var shuffled_turns = this.shuffle(unshuffled_turns);

    for(var ii = 0; ii < this.numPlayers - 1; ii++)
    {
      this.turnOrder.push(shuffled_turns[ii]);
    }

    this.currentTurnPlayer = this.numPlayers - 1;
    this.startNextTurn(); 
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

    // Send cards to client
    this.clients.forEach((client) => {
      var curr_player = this.state.clientPlayers.get(client.sessionId);

      var js_card_array = [];
      curr_player.cards.forEach((card) => {
        js_card_array.push(card.name);
      });

      var card_json = JSON.stringify({ ...js_card_array })
      client.send("dealCards", card_json);
    });

    // Fill empty player spots with NPCs on the board
    let npc_counter = this.numPlayers;
    while(npc_counter < 6)
    {
      let x = parseInt(this.playerStart[npc_counter].split(',')[0]);
      let y = parseInt(this.playerStart[npc_counter].split(',')[1]);
      const player = new Player(this.playerNames[npc_counter], x, y);
      player.isActive = false;
      this.state.clientPlayers.set(npc_counter, player);

      npc_counter++;
    }

    // Randomize turn order
    this.randomize_turn_order();
  }
}