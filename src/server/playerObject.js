const Vector = require('./vector');
const { PLAYER_SIZE,BLOCK_SIZE } = require('../shared/constants');
const Constants = require('../shared/constants');
const Polygon = require('./polygon');

class PlayerObject extends Polygon{
  constructor(id, username, x, y,length,height) {
    super([new Vector(-length/2,-height/2), new Vector(length/2,-height/2), new Vector(length/2,height/2), new Vector(-length/2,height/2)]);
    this.id = id;
    this.username = username;

    this.pos = new Vector(x,y);
    this.vel = new Vector(0,0);
    this.rightMove = new Vector(1,0);
    this.leftMove = new Vector(-1,0);
    this.upMove = new Vector(0,-1);
    this.downMove = new Vector(0,1);
    this.displace = new Vector(0,0);
    this.horizMove = new Vector(0,0);
    this.vertMove = new Vector(0,0);
    this.movingRight = false;
    this.movingLeft = false;
    this.movingUp = false;
    this.movingDown = false;
    this.isCol = false;
    this.setMove(new Vector(1,0));
  }
  
    TEMPstop(){
      this.vel.y = 0;
    }

    update(dt) {
      this.pos.x += dt * this.vel.x;
      this.pos.y += dt * this.vel.y;
      this.pos.x += dt * this.horizMove.x;
      this.pos.y += dt * this.horizMove.y;
      this.pos.x += dt * this.vertMove.x;
      this.pos.y += dt * this.vertMove.y;
     }
     updateDisplace(){
      this.pos.x += this.displace.x;
      this.pos.y += this.displace.y;
      this.displace.x = 0;
      this.displace.y = 0;
    }
  
  
     setMove(vec){ 
      this.rightMove = new Vector(vec.x * 250, vec.y * 250);
      this.leftMove = new Vector(vec.x * -250, vec.y * -250);
      this.downMove = new Vector(vec.y * -250, vec.x * 250);
      this.upMove = new Vector(vec.y * 250, vec.x * -250);
    }
    
  get realPoints(){
    var real = [];
    for(var i = 0; i<4; i++){
      real.push(new Vector(this.points[i].x + this.pos.x, this.points[i].y + this.pos.y));
    }
    return real;
  }

  handlePress(key){
    if(key == 'a'){
      this.moveLeft();
    }

    if(key == 'd'){
      this.moveRight();
    }

    if(key == 'w'){
      this.moveUp();
    }

    if(key == 's'){
      this.moveDown();
    }

    if(key == 'q'){
      this.rotate(.1);
    }
  }

  handleRelease(key){
    if(key == 'a'){
      this.stopLeft();
    }

    if(key == 'd'){
      this.stopRight();
    }

    if(key == 'w'){
      this.stopUp();
    }

    if(key == 's'){
      this.stopDown();
    }
  }
  moveLeft(){
    if(!this.movingLeft){
      this.horizMove.x = this.leftMove.x;
      this.horizMove.y = this.leftMove.y;
    }
      this.movingLeft = true;
  }
 
  moveRight(){
    if(!this.movingRight){
      this.horizMove.x = this.rightMove.x;
      this.horizMove.y = this.rightMove.y;    
    }
    this.movingRight = true;
  }

  moveUp(){
    if(!this.movingUp){ 
      this.vertMove.x = this.upMove.x;
      this.vertMove.y = this.upMove.y;    
    }
      this.movingUp = true;
  }
 
  moveDown(){
    if(!this.movingDown){
      this.vertMove.x = this.downMove.x;
      this.vertMove.y = this.downMove.y;      
    }
    this.movingDown = true;
  }
  
  stopRight(){
    this.horizMove.x = 0; this.horizMove.y = 0;
    this.movingRight = false;
    }

  stopLeft(){
    this.horizMove.x = 0; this.horizMove.y = 0;
    this.movingLeft = false;
    }

  stopUp(){
    this.vertMove.x = 0; this.vertMove.y = 0;
    this.movingUp = false;
  }

stopDown(){
  this.vertMove.x = 0; this.vertMove.y = 0;
  this.movingDown = false;
  }

distanceTo(player){
  return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
}
serializeForUpdate() {
  return {
    id: this.id,
    x : this.pos.x,
    y : this.pos.y,
    col : this.isCol,
    points: this.points
  };
}
}

module.exports = PlayerObject;
