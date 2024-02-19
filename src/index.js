// Import rooms
const { MyRoom } = require("./rooms/MyRoom");

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

// Defien rooms
gameServer.define('my_room', MyRoom);

// Opens server
gameServer.listen(process.env.PORT || 3000)
