const socket = require('socket.io-client/lib/socket');
const Vector = require('./vector');
const Constants = require('../shared/constants');
const Player = require('./playerObject');
const Block = require('./block');
const Cursor = require('./cursor');
const rectCollision = require('./rectCollision');
const pointPolygonCollsion = require('./pointPolygonCollision');
const { BLOCK_SIZE, PLAYER_SIZE } = require('../shared/constants');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.cursors = {};
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
    this.players[socket.id] = new Player(socket.id, username, x, y,PLAYER_SIZE, PLAYER_SIZE);

  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  addShip(socket){
    this.blocks.push(new Block(socket.id,this.players[socket.id].pos.x+50,this.players[socket.id].pos.y+50,BLOCK_SIZE,BLOCK_SIZE));
  }

  addCursor(socket){
    this.cursors[socket.id] = new Cursor(socket.id, 0, 0);
  }
  handlePress(socket,key){
    if(this.players[socket.id]){
      this.players[socket.id].handlePress(key);
    }
    if(this.cursors[socket.id]){
      this.cursors[socket.id].handlePress(key);
    }
  }

  handleRelease(socket,key){
    if(this.players[socket.id]){
      this.players[socket.id].handleRelease(key);
    }
  }

  handleClick(socket,click){
    var c = this.cursors[socket.id];
    c.update(click.x, click.y);
    const x = click.x + this.players[socket.id].pos.x - click.canvasWidth/2;
    const y = click.y + this.players[socket.id].pos.y - click.canvasHeight/2;
    for(var i = 0; i<this.blocks.length;i++){
      if(pointPolygonCollsion(x, y, this.blocks[i], this.blocks[i].pos.x, this.blocks[i].pos.y)){
        c.selected = this.blocks[i];
      }
      else{
        c.selected = null;
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
    // update each Rect
    this.blocks.forEach(block => {
      block.update(dt);
    });

    //collision for players and rectangles
    for(var id in this.sockets){
      for(var i = 0; i < this.blocks.length; i++){
        var col = rectCollision(this.players[id], this.blocks[i]);
        if(col){
          var {push,vec2} = col;
          if(vec2){
          this.players[id].setMove(vec2);
          this.players[id].rotateTo(this.blocks[i].direction);
          }
      //push after collision
          this.players[id].displace.add(push);
          this.players[id].isCol = true;
        }
        else{
          this.players[id].isCol = false;
        }
      }
      Object.keys(this.sockets).forEach(playerID => {
        const player = this.players[playerID];
       player.updateDisplace();
      });
    }

    
  
    

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
