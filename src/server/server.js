const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const Lobby = require('./lobby');
const webpackConfig = require('../../webpack.dev.js');

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
function createLobbyLink(id,socket){
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
  if(didJoinLobby){
    lobbies[lobbyID].addMember(socket);
    didJoinLobby = false;
    socket.emit(Constants.MSG_TYPES.JOINED_LOBBY,{creator : lobbies[lobbyID].creator, id : lobbies[lobbyID].id});
  }
  console.log('Player connected!', socket.id);
  socket.on(Constants.MSG_TYPES.CREATE_LOBBY,createLobby);
  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.PRESS, handlePress);
  socket.on(Constants.MSG_TYPES.RELEASE, handleRelease);
  socket.on(Constants.MSG_TYPES.CLICK, handleClick);
  socket.on(Constants.MSG_TYPES.JOINED_CREW,joinCrew);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const game = new Game();
var lobbies = {};
function joinGame() {
  const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
  const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
  Object.keys(lobbies[this.id].crew).forEach(id =>{
    game.addPlayer(lobbies[this.id].sockets[id],lobbies[this.id].crew[id],x,y);
    lobbies[this.id].sockets[id].emit(Constants.MSG_TYPES.CREATOR_JOINED_GAME);
  });
  game.addShip(this);
  game.addCursor(this);
}

function createLobby(creator){
  lobbies[creator.socketID] = new Lobby(this,creator.username);
  lobbies[creator.socketID].update();
  createLobbyLink(creator.socketID,this);
}

function joinCrew(username){
  Object.values(lobbies).forEach(lobby =>{
    Object.keys(lobby.sockets).forEach(id =>{
      if(this.id == id){
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
function handleClick(click){
  game.handleClick(this,click);
}

function onDisconnect() {
  game.removePlayer(this);
}
