const WebSocket = require("ws");
const express = require("express");
const app = express();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../../webpack.dev.js');
const compiler = webpack(webpackConfig);
const server = require("http").createServer();
const Constants = require('../shared/constants');
const Game = require('./game');
const Lobby = require('./lobby');


if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

const port = process.env.PORT || 3000;
server.listen(port);
server.on("request", app.use(express.static("public")));
console.log(`Server listening on port ${port}`);

// tell the WebSocket server to use the same HTTP server
const wss = new WebSocket.Server({
  server,
});

//generate socket id
const IDs = [];
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if(IDs.indexOf(result) != -1){
      generateString(length);
    }
    IDs.push(result);
    return result;
}

var didJoinLobby = false;
var lobbyID = null;

function createLobbyLink(id,socket){
  app.get('/'+id,(req,res)=>{
    res.redirect('/');
    didJoinLobby = true;
    lobbyID = id;
  });
}

wss.on("connection", function connection(ws, req) {
  if(didJoinLobby && lobbyID != null){
    if(lobbies[lobbyID]){
      ws.id = generateString(10);
      lobbies[lobbyID].addMember(ws);
      ws.send(JSON.stringify({message : Constants.MSG_TYPES.JOINED_LOBBY,update : {creator : lobbies[lobbyID].creator, id : lobbies[lobbyID].id}}));
      lobbyID = null;
    }
    else{
      ws.send(MSG_TYPES.CREATOR_LEFT_GAME);
    }
  }
  if(!didJoinLobby)
    ws.id = generateString(10);
  didJoinLobby = false;
  ws.onmessage = m =>{
    var e = JSON.parse(m.data);
    if(e.message == Constants.MSG_TYPES.CREATE_LOBBY){
      createLobby(e.username,ws);
    }

    if(e.message == Constants.MSG_TYPES.JOIN_GAME){
      joinGame(ws);
    }

    if(e.message == Constants.MSG_TYPES.PRESS){
      handlePress(e.key,ws);
    }

    if(e.message == Constants.MSG_TYPES.RELEASE){
      handleRelease(e.key,ws);
    }

    if(e.message == Constants.MSG_TYPES.JOINED_CREW){
      joinCrew(e.username,ws);
    }

    if(e.message == 'disconnect'){
      onDisconnect(ws);
    }
  }
});

// Setup the Game
const game = new Game();
var lobbies = {};
function joinGame(ws) {
  game.addCrew(lobbies[ws.id]);
}

const createLobby = (username,s) => {
  lobbies[s.id] = new Lobby(s,username);
  lobbies[s.id].update();
  createLobbyLink(s.id,s);
}

function joinCrew(username,ws){
  Object.values(lobbies).forEach(lobby =>{
    Object.keys(lobby.sockets).forEach(id =>{
      if(ws.id == id){
        if(lobby.ship){
          game.addStragler(ws,username,lobby);
          ws.send(JSON.stringify({mesage : Constants.MSG_TYPES.CREATOR_JOINED_GAME}));
        }
        lobby.addCrew(this,username);
        lobby.update();
      }
    });
  });
}
function handlePress(key,ws){
  game.handlePress(ws,key);
}
function handleRelease(key,ws){
  game.handleRelease(ws,key);
}


function onDisconnect(ws) {
  var creator = false;
  var deleteID;
  Object.values(lobbies).every(lobby =>{
      if(ws.id == lobby.id){
        game.removeCrew(lobby);
        Object.values(lobby.sockets).filter(socket => socket.id != ws.id,).forEach(socket =>{
          
        });
        deleteID = lobby.id;
        creator = true;
        return false;
      }
  });
  if(creator){
    delete lobbies[deleteID]; 
    return;
  }
  game.removePlayer(ws);
  Object.values(lobbies).forEach(lobby =>{
    Object.keys(lobby.sockets).forEach(id =>{
      if(this.id == id){
        lobby.removeMember(ws);
        lobby.update();
      }
    });
  });
}
