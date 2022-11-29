const Vector = require('./vector');
const { PLAYER_SIZE,BLOCK_SIZE } = require('../shared/constants');
const Constants = require('../shared/constants');
const Polygon = require('./polygon');
class Block extends Polygon{
    constructor(id, x, y,length,height) {
      super([new Vector(-length/2,-height/2), new Vector(length/2,-height/2), new Vector(length/2,height/2), new Vector(-length/2,height/2)]);
      this.id = id;
      this.pos = new Vector(x,y);
      this.vel = new Vector(0,0);
      this.center = new Vector(0,0);
      this.displace = new Vector(0,0);   
    }
  
    update(dt) {
      this.pos.x += this.displace.x;
      this.pos.y += this.displace.y;
      this.pos.x += dt * this.vel.x;
      this.pos.y += dt * this.vel.y;
      this.displace.x = 0;
      this.displace.y = 0;
     }
  
  
    setVelocity(vel) {
      this.vel = vel;
    }
    
    serializeForUpdate() {
      return {
        id: this.id,
        x: this.pos.x,
        y: this.pos.y
      };
    }
  get direction(){
    return this.dir;
  }

  set direction(direction){
    this.dir = direction;
    if(this.dir >= 2){
      this.dir %= 2;
    }
  }

  get realPoints(){
    var real = [];
    for(var i = 0; i<4; i++){
      real.push(new Vector(this.points[i].x + this.pos.x, this.points[i].y + this.pos.y));
    }
    return real;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x : this.pos.x,
      y : this.pos.y,
      points: this.points
    };
  }
}
module.exports = Block;
  
  