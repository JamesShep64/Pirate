const socket = require('socket.io-client/lib/socket');
const Vector = require('./vector');
const Constants = require('../shared/constants');
const Block = require('./block');
const Cursor = require('./cursor');
const blockCollision = require('./blockCollision');
const PirateShip = require('./pirateShip');
const PlayerObject = require('./playerObject');
const blockBlockCollision = require('./blockBlockCollision');
const blockShipCollision = require('./blockShipCollision');
const Planet = require('./planet');
const Cannon = require('./cannon');
const CannonBall = require('./cannonBall');
const trapDoorCollision = require('./trapDoorCollision');
const { BLOCK_SIZE, PLAYER_SIZE } = require('../shared/constants');
const playerLadderCollision = require('./playerLadderCollision');
const shipPlanetCollision = require('./shipPlanetCollision');
const cannonBallShipCollision = require('./cannonBallShipCollision');
const cannonBallPlanetCollision = require('./cannonBallPlanetCollision');
const shipShipCollision = require('./shipShipCollision');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.cursors = {};
    this.ships = [];
    this.planets = [];
    this.blocks = {};
    this.blockID = 'a';
    this.allCannonBalls = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;
    
    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new PlayerObject(socket.id, username, x, y,PLAYER_SIZE, PLAYER_SIZE);

  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  addShip(socket){
    this.ships.push(new PirateShip(this.players[socket.id].pos.x+50,this.players[socket.id].pos.y+50,'gallion'));
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
    this.ships.forEach(ship=>{
      if(Math.sqrt((x - ship.pos.x) * (x - ship.pos.x) + (y - ship.pos.y) * (y - ship.pos.y)) < ship.radius){
        c.selected = ship;
      }
      else{
        c.selected = null;
      }

    });
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;
    console.log(dt);


    // Update each player
    Object.keys(this.players).forEach(playerID => {
      const player = this.players[playerID];
     player.update(dt);
    });
    //update Ships
    this.ships.forEach(ship =>{  
      ship.update(dt);
    });
    //update cannonBalls
    this.ships.forEach(ship =>{
      for(var i = 0; i < ship.cannonBalls.length; i++){
        ship.cannonBalls[i].update(60/1000);
      }
    });
    // update each block
    Object.keys(this.blocks).forEach(id => {
      this.blocks[id].update(dt);
    });

    this.ships.forEach(ship =>{
      //ship planet collision
      for(var i = 0; i < this.planets.length; i++){
        var happened = shipPlanetCollision(ship, this.planets[i]);
        if(happened){
          var {push} = happened;
          ship.displace.add(push);
        }
      }
  
    
      //player ship Collision
      Object.keys(this.players).forEach(id => {
      var {push,vec2, i,happened} = blockShipCollision(this.players[id],ship);
      if(happened){  
        if(vec2){
          this.players[id].rotateTo(ship.direction);
          this.players[id].setMove(vec2);
          this.players[id].applyFriction(ship.netVelocity);
          this.players[id].turnGravity(false);
          ship.hasPlayers[id] = this.players[id]; 
          this.players[id].isCol = true;
          this.players[id].didCol = true;
          }
          this.players[id].displace.add(push);
        }
          //push after collision
      else{
        delete ship.hasPlayers[id];
      }
  
      //player trap door Collision
      var happened = trapDoorCollision(this.players[id],ship.trapDoor);
      if(happened){
        var {push,vec2} = happened;
        if(vec2){
          this.players[id].rotateTo(ship.direction);
          this.players[id].setMove(vec2);
          this.players[id].applyFriction(ship.netVelocity);
          this.players[id].turnGravity(false);
          ship.hasPlayers[id] = this.players[id]; 
          this.players[id].isCol = true;
          this.players[id].didCol = true;
        }
        this.players[id].displace.add(push);
      }
  
      //player platform Collision
      if(!this.players[id].movedOnLadder){
        var happened = trapDoorCollision(this.players[id],ship.platform);
        if(happened){  
          var {push, vec2} = happened;
          if(vec2){
            this.players[id].setMove(new Vector(ship.points[1].x - ship.points[0].x, ship.points[1].y - ship.points[0].y).unit());
            this.players[id].applyFriction(ship.netVelocity);
            this.players[id].rotateTo(ship.direction);
            this.players[id].turnGravity(false);
            ship.hasPlayers[id] = this.players[id];
            this.players[id].isCol = true;
            this.players[id].didCol = true;          
          }
          this.players[id].displace.add(push);
        }
      }
      
  
      //player Cannon interaction
      if(this.players[id].isGrabing && (!ship.cannon1.holder != this.players[id] && (this.players[id].holding == ship.cannon1 || !this.players[id].holding)))
          ship.cannon1.move(this.players[id]);
  
        if(this.players[id].isTrying && (!ship.cannon1.user != this.players[id] && (this.players[id].using == ship.cannon1 || !this.players[id].using)))
          ship.cannon1.use(this.players[id]);
  
        if(this.players[id].isTrying && (!ship.cannonLower1.user != this.players[id] && (this.players[id].using == ship.cannonLower1 || !this.players[id].using)))
        ship.cannonLower1.use(this.players[id]);
  
        if(this.players[id].isTrying && (!ship.cannonLower2.user != this.players[id] && (this.players[id].using == ship.cannonLower2 || !this.players[id].using)))
        ship.cannonLower2.use(this.players[id]);
  
        if(this.players[id].isTrying && (!ship.cannonLower2.user != this.players[id] && (this.players[id].using == ship.cannonLower2 || !this.players[id].using)))
        ship.cannonLower2.use(this.players[id]);
        
        if(this.players[id].isTrying && (!ship.telescope.user != this.players[id] && (this.players[id].using == ship.cannonLower2 || !this.players[id].using)))
        ship.telescope.use(this.players[id]);
  
        if(this.players[id].isTrying && ((this.players[id].pos.x - (ship.pos.x + ship.button.x)) * (this.players[id].pos.x - (ship.pos.x + ship.button.x)) + 
        (this.players[id].pos.y - (ship.pos.y + ship.button.y)) * (this.players[id].pos.y - (ship.pos.y + ship.button.y))) < ((ship.buttonRadius + this.players[id].radius) * (ship.buttonRadius + this.players[id].radius))/2){
          if(ship.trapDoor.isOpen){
            ship.trapDoor.closing = true;
          }
          if(ship.trapDoor.isClosed){
            ship.trapDoor.opening = true;
  
          }
        }
      //this.players[id] ladder interaction
      var happened = playerLadderCollision(this.players[id],ship.ladder);
      if(happened){  
          this.players[id].setMove(new Vector(ship.points[1].x - ship.points[0].x, ship.points[1].y - ship.points[0].y).unit());
          this.players[id].applyFriction(ship.ladder.ship.netVelocity,true);
          this.players[id].rotateTo(ship.ladder.ship.direction);
          this.players[id].onLadder = true;
          this.players[id].didOnLadder = true;
          ship.hasPlayers[id] = this.players[id]; 
        }
        else{
          var happened = playerLadderCollision(this.players[id],ship.mast);
          if(happened){  
            this.players[id].setMove(new Vector(ship.points[1].x - ship.points[0].x, ship.points[1].y - ship.points[0].y).unit());
            this.players[id].applyFriction(ship.ladder.ship.netVelocity,true);
            this.players[id].rotateTo(ship.ladder.ship.direction);
            this.players[id].onLadder = true;
            this.players[id].didOnLadder = true;
            ship.hasPlayers[id] = this.players[id]; 
            }
        }
      });
  
      //block Ship Collision
      Object.keys(this.blocks).forEach(id =>{
        var {push,vec2,happened} = blockShipCollision(this.blocks[id],ship);
        if(happened){  
          if(vec2){
            this.blocks[id].rotateTo(ship.direction);
            this.blocks[id].applyFriction(ship.netVelocity);
            this.blocks[id].turnGravity(false);
            ship.hasBlocks[id] = this.blocks[id]; 
            this.blocks[id].isCol = true;
            //push after collision
          }
          this.blocks[id].displace.add(push);
        }
        else{
          this.blocks[id].turnGravity(true);
          this.blocks[id].isCol = false;
          delete ship.hasBlocks[id];
        }
      });
  
      //block trap door collision
      Object.keys(this.blocks).forEach(id =>{
        var happened = trapDoorCollision(this.blocks[id],ship.trapDoor);
        if(happened){
          var {push,vec2} = happened;
          if(vec2){
            this.blocks[id].rotateTo(ship.direction);
            this.blocks[id].applyFriction(ship.netVelocity);
            this.blocks[id].turnGravity(false);
            ship.hasBlocks[id] = this.blocks[id]; 
            this.blocks[id].isCol = true;
            }
            this.blocks[id].displace.add(push);
        }
      });
  
      //cannon ball ship collision
      for(var i = 0; i < ship.cannonBalls.length;i++){
        this.ships.forEach(otherShip =>{
          if(ship.cannonBalls[i]){
            var collision = cannonBallShipCollision(ship.cannonBalls[i],otherShip);
            if(collision){
              ship.cannonBalls[i].explode();
              ship.cannonBalls.splice(i,1);
              otherShip.takeDamage(collision.u, collision.j);
            }
          }
        });
      }
  
      //cannon ball planet collisions
      for(var i = 0; i < ship.cannonBalls.length;i++){
        planets.forEach(planet =>{
          if(ship.cannonBalls[i]){
            if(cannonBallPlanetCollision(ship.cannonBalls[i],planet)){
              ship.cannonBalls[i].explode();
              ship.cannonBalls.splice(i,1);
            }
          }
        });
      }
          //graple planet collision
      if(ship.grapple && !ship.grapple.gotHooked){
        for(var i = 0; i<planets.length; i++){
          if(ship.grapple.distanceTo(planets[i]) < 100){
            ship.grapple.hook(planets[i]);
            ship.orbit();
          }
        }
      }
  
      //grapple ship collision
      if(ship.grapple && !ship.grapple.gotHooked){
        ships.forEach(otherShip =>{
          if(ship.grapple && !ship.grapple.gotHooked){
            if(shipPlanetCollision(otherShip,ship.grapple)){
              ship.grapple.detach();
            }
          }
        });
      }
  
      //ship ship collision
      for(var i = 0; i < this.ships.length; i++){
        var happened = shipShipCollision(ship, this.ships[i]);
        if(happened){
          var {push} = happened;
          ship.displace.add(new Vector(push.x/2, push.y/2));
          this.ships[i].displace.add(new Vector(-push.x/2, -push.y/2));
        }
      }
    });
  
    //PLAYER COLLISION FIX
    Object.keys(this.players).forEach(id =>{
      if(!this.players[id].didCol){
        this.players[id].isCol = false;
      }
      this.players[id].didCol = false;
    
      if(!this.players[id].didOnLadder){
        this.players[id].onLadder = false;
      }
      this.players[id].didOnLadder = false;
    });

    //player block collision
    Object.keys(this.players).forEach(id =>{
      Object.keys(this.blocks).forEach(id2 =>{
        if(this.blocks[id2] != this.players[id]){
          var happened = blockCollision(this.players[id],this.blocks[id2]);
          if(happened){  
            color = 'red';
            var {push, vec2} = happened;
            if(vec2){
              this.players[id].setMove(vec2);
              this.players[id].applyFriction(this.blocks[id2].netVelocity);
              this.players[id].rotateTo(this.blocks[id2].direction);
              this.players[id].turnGravity(false);
              this.players[id].onTop = true;
              this.blocks[id2].hasTop[id] = this.players[id];
            }
            else{
              delete this.blocks[id2].hasTop[id];
              if(this.players[id].isGrabing && !this.players[id].isHolding){
                this.players[id].grab(this.blocks[id2]);
              }
            }
            if(this.blocks[id2].wasJustHeld){
              push.x *= -1;
              push.y *= -1;
              this.blocks[id2].displace.add(push);
            }
            else{this.players[id].displace.add(push)};
          }
          else{
            this.blocks[id2].wasJustHeld = false;
            color = 'black';
            delete this.blocks[id2].hasTop[id];
          }
        }
      });
    });

    //block block Collision
    var comboCol = {};
    Object.keys(this.blocks).forEach(id => {
      comboCol[id] = [];
      blocks[id].gotPushed = false;
    });

    Object.keys(this.blocks).forEach(id =>{
      Object.keys(this.blocks).forEach(id2 =>{
        var v = false;
        if(this.blocks[id] != this.blocks[id2] && comboCol[id2].indexOf(id) == -1){
            var swaped = false;
          
          if(this.blocks[id].beingHeld){
            [id, id2] = [id2, id]; swaped = true;
          }
          else{
            if(this.blocks[id].gotPushed){
              [id, id2] = [id2, id]; swaped = true;
            }
            var happened = blockBlockCollision(this.blocks[id2],this.blocks[id]);
            if(happened)
              var {push, vec2} = happened;
            if(vec2){
              v = true;
              [id, id2] = [id2, id]; swaped = true;
            }
          }
          if(!v){
            var happened = blockBlockCollision(this.blocks[id],this.blocks[id2]);
          }
          if(happened){  
            var {push,vec2} = happened;
            if(vec2 && this.blocks[id2].isCol){
              this.blocks[id].applyFriction(blocks[id2].netVelocity);
              this.blocks[id].rotateTo(blocks[id2].direction);
              this.blocks[id].turnGravity(false);
              this.blocks[id].onTop = true;
              this.blocks[id].isCol = true;
              this.blocks[id2].hasTop[id] = this.blocks[id];
            }
            else{delete this.blocks[id2].hasTop[id];}
            this.blocks[id].displace.add(push);
            this.blocks[id].gotPushed = true;
          }
          else{
            delete this.blocks[id2].hasTop[id];
          }

          if(swaped){[id, id2] = [id2, id];}
          comboCol[id].push(id2);
        }
      });
    });
    //update Displacments
    Object.keys(this.players).forEach(id =>{
      this.players[id].updateDisplace();
    });
    this.ships.forEach(ship =>{
      ship.updateDisplace();
    });
    Object.keys(this.blocks).forEach(id =>{
      this.blocks[id].updateDisplace();
    });


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

  //1789
  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
  
    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      blocks: Object.keys(this.blocks).map(id => this.blocks[id].serializeForUpdate()),
      ships: this.ships.map(ship =>ship.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
