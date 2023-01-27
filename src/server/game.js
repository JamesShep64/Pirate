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
const { BLOCK_SIZE, PLAYER_SIZE, MAP_HEIGHT } = require('../shared/constants');
const playerLadderCollision = require('./playerLadderCollision');
const shipPlanetCollision = require('./shipPlanetCollision');
const cannonBallShipCollision = require('./cannonBallShipCollision');
const cannonBallPlanetCollision = require('./cannonBallPlanetCollision');
const shipShipCollision = require('./shipShipCollision');
const withinRect = require('./withinRect');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.cursors = {};
    this.ships = [];
    this.planets = [];
    this.blocks = {};
    this.blockID = 1;
    this.teamID = 1;
    this.seenCannonBalls = [];
    this.seenGrapples = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = true;
    this.colors =['red','blue','green','orange'];

    this.createMap();
    setInterval(this.update.bind(this), 1000 / 30);
  }

  addCrew(lobby){
     const generatePosition = () => {
      const x = Constants.MAP_WIDTH * (Math.random());
      const y = Constants.MAP_HEIGHT * (Math.random());
      this.planets.forEach(planet =>{
        if(withinRect(x,y,planet,280,280)){
          generatePosition();
        }
      });
      this.ships.forEach(planet =>{
        if(withinRect(x,y,planet,440,440)){
          generatePosition();
        }
      });
      return {x,y};
    }
    const {x,y} = generatePosition();
    this.ships.push(new PirateShip(x,y+50,'gallion',this.teamID.toString(),"rgb("+((Math.random() * 255) - 50).toString()+","+((Math.random() * 255) - 50).toString()+','+((Math.random() * 255) - 50).toString()+')',lobby.creator,this));
    lobby.ship = this.ships[this.ships.length-1];
    if(x > Constants.MAP_WIDTH/2){
      this.ships[this.ships.length-1].turn = -1;
    }
    this.blocks[this.blockID.toString()] = new Block(this.blockID.toString(),x + 40,y-10,Constants.BLOCK_SIZE,Constants.BLOCK_SIZE);
    this.blockID++;
    this.blocks[this.blockID.toString()] = new Block(this.blockID.toString(),x - 40,y-10,Constants.BLOCK_SIZE,Constants.BLOCK_SIZE);
    this.blockID++;
    this.blocks[this.blockID.toString()] = new Block(this.blockID.toString(),x + 80,y-10,Constants.BLOCK_SIZE,Constants.BLOCK_SIZE);
    this.blockID++;
    this.teamID++;

    Object.keys(lobby.crew).forEach(id =>{
    this.sockets[id] = lobby.sockets[id];
    this.players[id] = new PlayerObject(id, lobby.crew[id], x, y,PLAYER_SIZE, PLAYER_SIZE,this.ships[this.ships.length-1],this.colors[lobby.colorI]);
    lobby.sockets[id].emit(Constants.MSG_TYPES.CREATOR_JOINED_GAME);
    lobby.colorI++;
  });
  }
  addStragler(socket,username,lobby){
    this.sockets[socket.id] = socket;
    this.players[socket.id] = new PlayerObject(socket.id, username, 0, 0,PLAYER_SIZE, PLAYER_SIZE,lobby.ship,this.colors[lobby.colorI]);
    this.players[socket.id].spawn();
    lobby.colorI++;
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  removeCrew(lobby){
    Object.keys(lobby.crew).forEach(id =>{
      delete this.sockets[id];
      delete this.players[id];
    });
    for(var i = 0;i<this.ships.length;i++){
      if(this.ships[i] == lobby.shipID){
        this.ships.splice(i,1);
      }
    }
  }

  handlePress(socket,key){
    if(this.players[socket.id]){
      this.players[socket.id].handlePress(key);
    }
  }

  handleRelease(socket,key){
    if(this.players[socket.id]){
      this.players[socket.id].handleRelease(key);
    }
  }



  createMap(){
    for(var x =-400; x < Constants.MAP_WIDTH + 900; x+=900){
      for(var y = -400; y < Constants.MAP_HEIGHT + 1000; y+=900){
        var xPos = (.5 - Math.random()) * 600 + x;
        var yPos = (.5 - Math.random()) * 600 + y;
        this.planets.push(new Planet(xPos,yPos));
      }
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;


    // Update each player
    Object.keys(this.players).forEach(playerID => {
      const player = this.players[playerID];
      if(player.pos.x < 0 || player.pos.x > Constants.MAP_WIDTH || player.pos.y < 0 || player.pos.y > MAP_HEIGHT){
        player.outOfBounds = true;
      }
      else{
        player.outOfBounds = false;
        player.outOfBoundsTimer = 0;
      }
     player.update(dt);
    });
    //update Ships
    this.ships.forEach(ship =>{ 
      if(ship.pos.x < 0 || ship.pos.x > Constants.MAP_WIDTH || ship.pos.y < 0 || ship.pos.y > MAP_HEIGHT){
        ship.outOfBounds = true;
      }
      else{
        ship.outOfBounds = false;
        ship.outOfBoundsTimer = 0;
      }
      ship.ships = this.ships;
      ship.update(dt);
    });
    
    // update each block
    Object.keys(this.blocks).forEach(id => {
      if(this.blocks[id].pos.x < 0 || this.blocks[id].pos.x > Constants.MAP_WIDTH || this.blocks[id].pos.y < 0 || this.blocks[id].pos.y > MAP_HEIGHT){
        this.blocks[id].outOfBounds = true;
      }
      else{
        this.blocks[id].outOfBounds = false;
        this.blocks[id].outOfBoundsTimer = 0;
      }
      this.blocks[id].update(dt);
    });
    
    Object.values(this.players).filter(player => !player.dead,).forEach(player => {
    //player block Collision
    Object.keys(this.blocks).forEach(id =>{
      var happened = blockCollision(player,this.blocks[id]);
      if(happened){  
        if(this.blocks[id].holder == player){
          player.drop();
        }
        var {push, vec2} = happened;
        if(vec2){
          player.setMove(vec2);
          player.applyFriction(this.blocks[id].netVelocity);
          player.rotateTo(this.blocks[id].direction);
          player.turnGravity(false);
          player.onTop = true;
          this.blocks[id].hasTop[player.id] = player;
          player.isCol = true;
          player.didCol = true;
        }
        else{
          if(this.blocks[id].hasTop[player.id]){
            player.onTop = false;
            delete this.blocks[id].hasTop[player.id];
          }
          if(player.isGrabing && !player.isHolding && !(this.blocks[id].holder != null && this.blocks[id].holder != player)){
            player.grab(this.blocks[id]);
          }
        }
        player.displace.add(push);
      }
      else{
        this.blocks[id].wasJustHeld = false;
        if(this.blocks[id].hasTop[player.id]){
          player.onTop = false;
          delete this.blocks[id].hasTop[player.id];
        }
      }
    });

    this.ships.filter(player => !player.dead,).forEach(ship =>{
      //player ship Collision
      var {push,vec2, i,happened} = blockShipCollision(player,ship);
      if(happened){  
        if(vec2){
          player.rotateTo(ship.direction);
          player.setMove(vec2);
          player.applyFriction(ship.netVelocity);
          player.turnGravity(false);
          ship.hasPlayers[player.id] = player; 
          player.isCol = true;
          player.didCol = true;
          player.withinShip = true;
          player.shipWithin = ship;
          }
          player.displace.add(push);
        }
          //push after collision
      else{
        delete ship.hasPlayers[player.id];
      }

      //player Cannon interaction
      if(player.isGrabing && (!ship.cannon1.holder != player && (player.holding == ship.cannon1 || !player.holding)))
      ship.cannon1.move(player);

      if(player.isTrying && (!ship.cannon1.user != player && (player.using == ship.cannon1 || !player.using)))
        ship.cannon1.use(player);

      if(player.isTrying && (!ship.cannonLower1.user != player && (player.using == ship.cannonLower1 || !player.using)))
      ship.cannonLower1.use(player);

      if(player.isTrying && (!ship.cannonLower2.user != player && (player.using == ship.cannonLower2 || !player.using)))
      ship.cannonLower2.use(player);

      if(player.isTrying && (!ship.cannonLower2.user != player && (player.using == ship.cannonLower2 || !player.using)))
      ship.cannonLower2.use(player);
      
      if(player.isTrying && (!ship.telescope.user != player && (player.using == ship.cannonLower2 || !player.using)))
      ship.telescope.use(player);

      if(player.isTrying && ((player.pos.x - (ship.pos.x + ship.button.x)) * (player.pos.x - (ship.pos.x + ship.button.x)) + 
      (player.pos.y - (ship.pos.y + ship.button.y)) * (player.pos.y - (ship.pos.y + ship.button.y))) < ((ship.buttonRadius + player.radius) * (ship.buttonRadius + player.radius))/2){
        if(ship.trapDoor.isOpen){
          ship.trapDoor.closing = true;
        }
        if(ship.trapDoor.isClosed){
          ship.trapDoor.opening = true;

        }
      }
  
      //player trap door Collision
      var happened = trapDoorCollision(player,ship.trapDoor);
      if(happened){
        var {push,vec2} = happened;
        if(vec2){
          player.rotateTo(ship.direction);
          player.setMove(vec2);
          player.applyFriction(ship.netVelocity);
          player.turnGravity(false);
          ship.hasPlayers[player.id] = player; 
          player.isCol = true;
          player.didCol = true;
          player.withinShip = true;
          player.shipWithin = ship;  
        }
        player.displace.add(push);
      }
  
      //player platform Collision
      if(!player.movedOnLadder){
        var happened = trapDoorCollision(player,ship.platform);
        if(happened){  
          var {push, vec2} = happened;
          if(vec2){
            player.setMove(new Vector(ship.points[1].x - ship.points[0].x, ship.points[1].y - ship.points[0].y).unit());
            player.applyFriction(ship.netVelocity);
            player.rotateTo(ship.direction);
            player.turnGravity(false);
            ship.hasPlayers[player.id] = player;
            player.isCol = true;
            player.didCol = true; 
            player.withinShip = true;
            player.shipWithin = ship;           
          }
          player.displace.add(push);
        }
      }
      
      if(player.shipWithin == ship && player.distanceTo(ship) < ship.radius){
        player.didWithinShip = true;
      }
  
      //player ladder interaction
      var happened = playerLadderCollision(player,ship.ladder);
      if(happened){  
          player.setMove(new Vector(ship.points[1].x - ship.points[0].x, ship.points[1].y - ship.points[0].y).unit());
          player.applyFriction(ship.ladder.ship.netVelocity,true);
          player.rotateTo(ship.ladder.ship.direction);
          player.onLadder = true;
          player.didOnLadder = true;
          ship.hasPlayers[player.id] = player; 
        }
        else{
          var happened = playerLadderCollision(player,ship.mast);
          if(happened){  
            player.setMove(new Vector(ship.points[1].x - ship.points[0].x, ship.points[1].y - ship.points[0].y).unit());
            player.applyFriction(ship.ladder.ship.netVelocity,true);
            player.rotateTo(ship.ladder.ship.direction);
            player.onLadder = true;
            player.didOnLadder = true;
            ship.hasPlayers[player.id] = player; 
            }
        }
    });
      //PLAYER LADDER FIX
      if(!player.didOnLadder){
        player.onLadder = false;
      }
      player.didOnLadder = false;

      //player within ship fix
      if(!player.didWithinShip){
        player.withinShip = false;
        player.shipWithin = null;
        player.setMove(new Vector(1,0));
        player.rotateTo(0);
      }
      player.didWithinShip = false;




      //PLAYER COLLISION FIX
      if(!player.didCol){
        player.isCol = false;
      }
      player.didCol = false;

      //player planet collision
      this.planets.forEach(planet =>{
        var happened = blockCollision(player,planet);
        if(happened){
          var {push} = happened;
          player.displace.add(push);
        }
      });
    });
    this.ships.filter(player => !player.dead,).forEach(ship =>{
      //ship planet collision
      if(!ship.inOrbit){
        for(var i = 0; i < this.planets.length; i++){
          var happened = shipPlanetCollision(ship, this.planets[i]);
          if(happened){
            var {push} = happened;
            ship.displace.add(push);
          }
        }
      }
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
      Object.keys(this.blocks).forEach(id =>{
        this.planets.forEach(planet =>{
          var happened = blockCollision(this.blocks[id],planet);
          if(happened){
            var {push} = happened;
            this.blocks[id].displace.add(push);
          }
        });
      });
  
      //cannon ball ship collision
      Object.keys(ship.cannonBalls).forEach(id =>{
        this.ships.filter(player => !player.dead,).forEach(otherShip =>{
          if(ship.cannonBalls[id]){
            var collision = cannonBallShipCollision(ship.cannonBalls[id],otherShip);
            if(collision){
              delete ship.cannonBalls[id];
              otherShip.takeDamage(collision.u, collision.j);
            }
          }
        });
      });
  
      //cannon ball planet collisions
      Object.keys(ship.cannonBalls).forEach(id =>{
        this.planets.forEach(planet =>{
          if(ship.cannonBalls[id]){
            if(cannonBallPlanetCollision(ship.cannonBalls[id],planet)){
              delete ship.cannonBalls[id];
            }
          }
        });
      });
      
      //graple planet collision
      if(ship.grapple && !ship.grapple.gotHooked){
        for(var i = 0; i<this.planets.length; i++){
          if(ship.grapple){
            if(ship.grapple.distanceTo(this.planets[i]) < 100){
              ship.grapple.hook(this.planets[i]);
              ship.orbit();
            }
          }
          else{
            break;
          }
        }
      }
  
      //grapple ship collision
      if(ship.grapple && !ship.grapple.gotHooked){
        this.ships.filter(player => !player.dead,).forEach(otherShip =>{
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
    //block block Collision
  var comboCol = {};
  Object.keys(this.blocks).forEach(id => {
    comboCol[id] = [];
    this.blocks[id].gotPushed = false;
  });

    Object.keys(this.blocks).forEach(id =>{
    Object.keys(this.blocks).forEach(id2 =>{
      var v = false;
      if(this.blocks[id] != this.blocks[id2] && comboCol[id2].indexOf(id) == -1){
          var swaped = false;
        
        if(this.blocks[id2].beingHeld){
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
            this.blocks[id].applyFriction(this.blocks[id2].netVelocity);
            this.blocks[id].rotateTo(this.blocks[id2].direction);
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
    Object.values(this.players).filter(player => !player.dead,).forEach(player =>{
      player.updateDisplace();
    });
    this.ships.filter(player => !player.dead,).forEach(ship =>{
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
      this.shouldSendUpdate = true;
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
      p => p !== player && player.withinVisionRect(p,1800,1800),
    );

    const nearbyBlocks = Object.values(this.blocks).filter(
      p =>  player.withinVisionRect(p,1800,1800),
    );

    const nearbyShips = this.ships.filter(ship=>
      player.withinVisionRect(ship,1800,1800) && !ship.dead,
    );
  
    const nearbyPlanets = this.planets.filter(ship=>
      player.withinVisionRect(ship,1800,1800),
    );

    var nearbyCannonBalls = [];
    this.ships.forEach(ship =>{
      Object.values(ship.cannonBalls).forEach(ball=>{ 
        if(player.withinVisionRect(ball,1800,1800)){
          nearbyCannonBalls.push(ball);
        }
      });
    });
    var nearbyGrapples = [];
    this.ships.forEach(ship=>{
      if(ship.grapple && player.withinVisionRect(ship,1800,1800))
      nearbyGrapples.push(ship.grapple);
    });
    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      blocks: nearbyBlocks.map(block=> block.serializeForUpdate()),
      ships: nearbyShips.map(ship =>ship.serializeForUpdate()),
      planets: nearbyPlanets.map(p => p.serializeForUpdate()),
      cannonBalls : nearbyCannonBalls.map(ball => ball.serializeForUpdate()),
      grapples : nearbyGrapples.map(g => g.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
