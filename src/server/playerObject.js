
const Vector = require('./vector');
const Polygon = require('./polygon');
const CONSTANTS = require('../shared/constants');

class PlayerObject extends Polygon{
  constructor(id, username, x, y,length,height) {
    super([new Vector(0,-height/2), new Vector(length/2,0), new Vector(0,height/2), new Vector(-length/2,0)]);
    //IDNETIFICATION
    this.id = id;
    this.username = username;
    //MOVEMENT
    this.pos = new Vector(x,y);
    this.gvel = new Vector(0,0);
    this.gravity = new Vector(0,.5);
    this.netVelocity = new Vector(0,0);
    this.rightMove = new Vector(1,0);
    this.leftMove = new Vector(-1,0);
    this.upMove = new Vector(0,-1);
    this.downMove = new Vector(0,1);
    this.displace = new Vector(0,0);
    this.horizMove = new Vector(0,0);
    this.vertMove = new Vector(0,0);
    this.jump = new Vector(0,1);
    this.friction = new Vector(0,0);
    this.jumpVel = new Vector(0,0);
    this.movingRight = false;
    this.movingLeft = false;
    this.movingUp = false;
    this.movingDown = false;
    this.setMove(new Vector(1,0));

    //ITEM INTERACTION
      //Grabbing
    this.isHolding = false;
    this.isGrabing = false;
    this.holding;
      //Using
    this.isTrying = false;
    this.isUsing = false;
    this.using;
    //ONTOP
    this.hasTop = {};
    this.onTop = false;
    //collision
    this.radius = Math.sqrt((length/2) * (length/2) + (height/2) * (height/2));
    this.repeats1 = [0,1];
    this.repeats2 = [2,3];
    this.isCol = false;
    this.didCol = false;
    //ladder
    this.onLadder = false;
    this.movedOnLadder = false;
    this.didOnLadder = false;
    //telescope
    this.eyes = new Vector(x,y);
    this.onTelescope = false;
  }
    update(dt) {
      //drop items
      if((!this.isGrabing && this.isHolding)){
        this.drop();
      }

      if(this.holding && (this.distanceTo(this.holding) > this.radius + this.holding.radius + 10)){
        this.drop();
      }

      if(this.holding && this.holding.constructor.name == 'Block' && (this.distanceTo(this.holding) < this.radius + this.holding.radius - 10)){
        this.drop();
      }
    
      if((!this.isTrying && this.isUsing)){
        this.stopUsing();
      }

      if(this.using && this.distanceTo(this.using) > this.radius + this.using.radius + 10){
        this.stopUsing();
      }

      //JUMP
      if(Math.abs(this.jumpVel.x) >= .11){
        this.jumpVel.y += this.jumpVel.y > 0 ? -.1 : 1;
      }
      else{
        this.jumpVel.x = 0;
      }
      if(Math.abs(this.jumpVel.y) >= .11){
        this.jumpVel.y += this.jumpVel.y > 0 ? -.1 : 1;      }
      else{
        this.jumpVel.y = 0;
      }
      //check vert move
      if(!this.onLadder && !this.onTelescope){
        this.vertMove.x = 0;
        this.vertMove.y = 0;
      }

      //GRAVITY
      if(!this.col){
        this.turnGravity(true);
      }
      this.gvel.x += dt * this.gravity.x;
      this.gvel.y += dt * this.gravity.y;
      if(this.gvel.y > 200){
        this.gvel.y = 200;
      }

      //ladder Movment    
      if(!this.onLadder){this.movedOnLadder = false};  
      if(this.movedOnLadder){
        this.jumpVel.x = 0;
        this.jumpVel.y = 0;
        this.turnGravity(false);
      }
      //APPLY VELOCITIES
      this.netVelocity.x = 0;
      this.netVelocity.y = 0;
      if(!this.onTelescope){
        this.netVelocity.x += this.horizMove.x + this.vertMove.x;
        this.netVelocity.y += this.horizMove.y + this.vertMove.y;
      }

      this.netVelocity.x += this.gvel.x + this.friction.x + this.jumpVel.x;
      this.netVelocity.y += this.gvel.y + this.friction.y + this.jumpVel.y;
      this.pos.x += dt * this.netVelocity.x;
      this.pos.y += dt * this.netVelocity.y;

      //move eyes if on telescope
      if(!this.onTelescope){
        this.eyes.x = this.pos.x;
        this.eyes.y = this.pos.y;
      }
      else{
        if(Math.abs(this.eyes.x - this.pos.x) + Math.abs(this.eyes.y - this.pos.y) < 1000){
          this.netVelocity.x += this.horizMove.x + this.vertMove.x;
          this.netVelocity.y += this.horizMove.y + this.vertMove.y;
        }
        this.eyes.x += dt * this.netVelocity.x;
        this.eyes.y += dt * this.netVelocity.y;
      }
    }

     updateDisplace(){
      this.pos.x += this.displace.x;
      this.pos.y += this.displace.y;
      this.eyes.x += this.displace.x;
      this.eyes.y += this.displace.y;
      this.displace.x = 0;
      this.displace.y = 0;
    }
      
    setMove(vec){ 
      this.rightMove.x = vec.x * 150; this.rightMove.y = vec.y * 150;
      this.leftMove.x = vec.x * -150; this.leftMove.y = vec.y * -150;
      this.downMove.x = vec.y * -150; this.downMove.y = vec.x * 150;
      this.upMove.x = vec.y * 150; this.upMove.y = vec.x * -150;
      this.jump = this.upMove.unit();
   }

  applyFriction(vec,dont){
    this.friction.x = vec.x;
    this.friction.y = vec.y;
    if(!dont){
      this.jumpVel.x = 0;
      this.jumpVel.y = 0;
    }
  }

  turnGravity(b){
    if(b){
      this.gravity.y = 10;
    }
    else{
      this.gravity.y = 0;
      this.gvel.x = 0;
      this.gvel.y = 0;
    }
  }

  grab(item){
    this.holding = item;
    this.isHolding = true;
    this.hasTop[item.id] = item;
    item.beingHeld = true;
    item.holder = this;
    item.holdVec = new Vector(item.pos.x - this.pos.x, item.pos.y - this.pos.y);
    item.turnGravity(false);
    item.wasJustHeld = true;
  }

  use(item){
    this.using = item;
    this.isUsing = true;
    item.beingUsed = true;
    item.user = this;
  }

  drop(){
    this.isHolding = false;
    this.holding.beingHeld = false;
    this.holding.holder = null;
    this.holding = null;
    if(this.holding)
      delete this.hasTop[this.holding.id];
  }

  stopUsing(){
    this.isUsing = false;
    this.using.beingUsed = false;
    this.using.user = null;
    this.using = null;
    this.onTelescope = false;
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
      if(!this.isUsing || this.onTelescope)
        this.moveLeft();
      else if(this.isUsing){
        if(this.using.side == -1){
          this.using.rotateBarell(-.05);
        }
        if(this.using.side == 1){
          this.using.rotateBarell(.05);
        }
        else{
          this.using.rotateBarell(-.05);
        }
      }
    }

    if(key == 'd'){
      if(!this.isUsing || this.onTelescope)
        this.moveRight();
        else if(this.isUsing){
          if(this.using.side == -1){
            this.using.rotateBarell(.05);
          }
          if(this.using.side == 1){
          this.using.rotateBarell(-.05);
          }  
          else{
            this.using.rotateBarell(.05);
          }     
        }
    }

    if(key == 'q'){
      this.isGrabing = true;
    }

    if(key == 'e'){
      this.isTrying = true;
    }

    if(key == ' '){
      if(!this.isUsing)
        this.doJump();
      if(this.isUsing && !this.onTelescope)
      {
        this.using.isLoading = true;
      }
    }

    if(key == 'k'){
      if(this.isUsing  && !this.onTelescope)
        this.using.shootGrapple();
    }

    if(key == 'w'){
      this.moveUp();
    }

    if(key == 's'){
      this.moveDown();
    }
  }

  handleRelease(key){
    if(key == 'a'){
      if(!this.isUsing || this.onTelescope)
        this.stopLeft();
    }

    if(key == 'q'){
      this.isGrabing = false;
    }

    if(key == 'e'){
      this.isTrying = false;
    }

    if(key == 'd'){
      if(!this.isUsing || this.onTelescope)
        this.stopRight();
    }

    if(key == 'w'){
        this.stopUp();
    }

    if(key == 's'){
        this.stopDown();
    }

    if(key == ' '){
      if(this.isUsing && !this.onTelescope)
      {
        this.using.fireCannonBall();
      }
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
  
  stopRight(){
    this.horizMove.x = 0; this.horizMove.y = 0;
    this.movingRight = false;
    }

  stopLeft(){
    this.horizMove.x = 0; this.horizMove.y = 0;
    this.movingLeft = false;
    }

  doJump(){
    if(this.isCol || this.onTop || this.movedOnLadder){
      this.movedOnLadder = false;
      if(this.movedOnLadder){
        this.jumpVel.x = this.jump.x * 85;
        this.jumpVel.y = this.jump.y * 85;  
      }
      else{
        this.jumpVel.x = this.jump.x * 55;
        this.jumpVel.y = this.jump.y * 55;
      }
    }
  }

  moveDown(){
    if((this.onLadder && !this.isCol) || this.onTelescope){
      if(!this.movingDown){
        this.movedOnLadder = true;
        this.vertMove.x = this.downMove.x;
        this.vertMove.y = this.downMove.y;      
      }
      this.movingDown = true;
    }
    else{this.stopDown();}
  }

  moveUp(){
    if(this.onLadder || this.onTelescope){
      if(!this.movingUp){ 
        if(this.onLadder)
          this.movedOnLadder = true;
        this.vertMove.x = this.upMove.x;
        this.vertMove.y = this.upMove.y;    
      }
      this.movingUp = true;
    }
    else{this.stopUp();}
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
    eyes : this.eyes,
    id: this.id,
    x : this.pos.x,
    y : this.pos.y,
    col : this.isCol,
    points: this.points
  };
}
}
module.exports = PlayerObject;

