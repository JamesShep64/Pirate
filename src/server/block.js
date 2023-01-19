const Vector = require('./vector');
const { PLAYER_SIZE,BLOCK_SIZE } = require('../shared/constants');
const Constants = require('../shared/constants');
const Polygon = require('./polygon');
class Block extends Polygon{
  constructor(id, x, y,length,height) {
    super([new Vector(-length/2,-height/2), new Vector(length/2,-height/2), new Vector(length/2,height/2), new Vector(-length/2,height/2)]);
    this.colPoly = new Polygon([new Vector(0, height/2), new Vector(length/2, 0), new Vector(0, -height/2), new Vector(-length/2, 0)])  
    //IDENTIFICATION
    this.id = id;
    //MOVEMENT
    this.pos = new Vector(x,y);
    this.friction = new Vector(0,0);
    this.gvel = new Vector(0,0);
    this.gravity = new Vector(0,.5);
    this.netVelocity = new Vector(0,0);
    this.displace = new Vector(0,0);
    this.friction = new Vector(0,0);
    this.isCol = false;
    this.floor = [0];
    //PLAYER INTERACTION
    this.beingHeld = false;
    this.holder;
    this.wasJustHeld = false;
    //ONTOP
    this.hasTop = {};
    this.onTop = false;
    this.holdVec = new Vector(0,0);
    //COLLISION
    this.radius = Math.sqrt((length/2) * (length/2) + (height/2) * (height/2));
    this.gotPushed = false;
    this.repeats1 = [0,1];
    this.repeats2 = [2,3];
  }    
  
  update(dt) {
    //GRAVITY
    this.gvel.x += dt * this.gravity.x;
    this.gvel.y += dt * this.gravity.y;
    if(this.gvel.y > 900){
      this.gvel.y = 900;
    }

    //APPLY VELOCITIES
    this.netVelocity.x = this.gvel.x + this.friction.x;
    this.netVelocity.y = this.gvel.y + this.friction.y;
    if(!this.beingHeld){
      this.pos.x += dt * this.netVelocity.x;
      this.pos.y += dt * this.netVelocity.y;
    }
  }
  
  updateDisplace(){
    if(!this.beingHeld){
      this.pos.x += this.displace.x;
      this.pos.y += this.displace.y;
    }
    else{
      this.holdVec.add(this.displace);
      this.pos.x = this.holder.pos.x + this.holdVec.x;
      this.pos.y = this.holder.pos.y + this.holdVec.y;
    }
    this.displace.x = 0;
    this.displace.y = 0;
  }

  applyFriction(vec){
    this.friction.x = vec.x;
    this.friction.y = vec.y;
  }

  turnGravity(b){
    if(b && !this.beingHeld){
      this.gravity.y = 80;
    }
    else{
      this.gravity.y = 0;
      this.gvel.x = 0;
      this.gvel.y = 0;
    }
  }
  
  rotate(angle){
    super.rotate(angle);
    this.colPoly.rotate(angle);
  }

  rotateTo(angle){
    super.rotateTo(angle);
    this.colPoly.rotateTo(angle);
  }

  get realPoints(){
    var real = [];
    for(var i = 0; i<4; i++){
      real.push(new Vector(this.points[i].x + this.pos.x, this.points[i].y + this.pos.y));
    }
    return real;
  }

  distanceTo(player){
  return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
  }
  
  withinRect(other,width,height){
    if(other.pos.x < this.pos.x + width && other.pos.x > this.pos.x - width && other.pos.y < this.pos.y + height && other.pos.y > this.pos.y - height)
      return true;
    return false;
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
module.exports = Block;
  
  