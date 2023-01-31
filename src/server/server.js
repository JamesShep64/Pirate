const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const Lobby = require('./lobby');
const webpackConfig = require('../../webpack.dev.js');
const { MSG_TYPES } = require('../shared/constants');

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);
var didJoinLobby = false;
var lobbyID;
function createLobbyLink(id){
  app.get('/'+id,(req,res)=>{
    res.redirect('/');
    didJoinLobby = true;
    lobbyID = id;
  });
}
// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  if(didJoinLobby && lobbyID != null){
    if(lobbies[lobbyID]){
      lobbies[lobbyID].addMember(socket);
      didJoinLobby = false;
      socket.emit(Constants.MSG_TYPES.JOINED_LOBBY,{creator : lobbies[lobbyID].creator, id : lobbies[lobbyID].id});
      lobbyID = null;
    }
    else{
      socket.emit(MSG_TYPES.CREATOR_LEFT_GAME,'a');
    }
  }
  console.log('Player connected!', socket.id);
  socket.on(Constants.MSG_TYPES.CREATE_LOBBY,createLobby);
  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.PRESS, handlePress);
  socket.on(Constants.MSG_TYPES.RELEASE, handleRelease);
  socket.on(Constants.MSG_TYPES.JOINED_CREW,joinCrew);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const game = new Game();
var lobbies = {};
function joinGame() {
  game.addCrew(lobbies[this.id]);
}

function createLobby(creator){
  lobbies[creator.socketID] = new Lobby(this,creator.username);
  lobbies[creator.socketID].update();
  createLobbyLink(creator.socketID);
}

function joinCrew(username){
  Object.values(lobbies).forEach(lobby =>{
    Object.keys(lobby.sockets).forEach(id =>{
      if(this.id == id){
        if(lobby.ship){
          game.addStragler(this,username,lobby);
          this.emit(Constants.MSG_TYPES.CREATOR_JOINED_GAME);
        }
        lobby.addCrew(this,username);
        lobby.update();
      }
    });
  });
}
function handlePress(key){
  game.handlePress(this,key);
}
function handleRelease(key){
  game.handleRelease(this,key);
}


function onDisconnect() {
  Object.values(lobbies).every(lobby =>{
      if(this.id == lobby.id){
        if(Object.keys(lobby.crew).length == 1){
          game.removeCrew(lobby);
          Object.values(lobby.sockets).filter(socket => socket.id != this.id,).forEach(socket =>{
            socket.emit(Constants.MSG_TYPES.CREATOR_LEFT_GAME);
          });
          delete lobbies[this.id]; 
          return;
       }
       else{
        var fresh = lobbies[this.id];
        game.removePlayer(this);
        lobby.removeLeader(this);
        delete lobbies[this.id];
        lobbies[fresh.id] = fresh;
        return;
       }
      }
  });
  game.removePlayer(this);
  Object.values(lobbies).forEach(lobby =>{
    Object.keys(lobby.sockets).forEach(id =>{
      if(this.id == id){
        lobby.removeMember(this);
      }
    });
  });
}
