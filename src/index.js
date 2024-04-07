// Import rooms
const { Lobby } = require("./rooms/Lobby");
const { Game } = require("./rooms/Game");


// Server stuff
const express = require("express");
const http = require("http");
const core  = require("@colyseus/core");
const WebSocketTransport  = require("@colyseus/ws-transport");
const configRoutes = require('./routes');

const app = express();
configRoutes(app);
const server = http.createServer(app); // create the http server manually


const gameServer = new core.Server({
  transport: new WebSocketTransport.WebSocketTransport({
    server // provide the custom server for `WebSocketTransport`
  })
});

// Define rooms
gameServer.define('lobby', Lobby);
gameServer.define('game', Game);

// Opens server
gameServer.listen(process.env.PORT || 3000)
