const socket = require('socket.io-client/lib/socket');
const Constants = require('../shared/constants');
const Player = require('./playerObject');
const Block = require('./block');
const applyPlayerBlockCollisions = require('./playerBlockCollisions');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.blocks = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
     const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
     const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new Player(socket.id, username, x, y,0,0);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  addShip(socket){
    this.blocks.push(new Block(null,this.players[socket.id].x,this.players[socket.id].y,null,0));
  }

  handlePress(socket,key){
    if(this.players[socket.id]){
      if(key == 'd'){
        this.players[socket.id].moveRight();
      }
      if(key == 'a'){
        this.players[socket.id].moveLeft();
      }
      
      if(key ==" "){
        this.players[socket.id].moveUp();
      }
      
      if(key == "q"){
         this.players[socket.id].TEMPstop();
      }
      
    }
  }

  handleRelease(socket,key){
    if(this.players[socket.id]){
      if(key == 'd'){
        this.players[socket.id].stopRight();
      }

      if(key == 'a'){
        this.players[socket.id].stopLeft();
      }
    }
  }


  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;


    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
     player.update(dt);
    });

    // update each block
    this.blocks.forEach(block => {
      block.update(dt);
    });

    //apply block player collisions
    applyPlayerBlockCollisions(Object.values(this.players),this.blocks);

    

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
  

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      blocks: this.blocks.map(b => b.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
