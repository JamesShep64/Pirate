const Constants = require('../shared/constants');

class PlayerObject {
  constructor(id, username,x, y, x_velocity, y_velocity,direction) {
    this.username = username;
    this.score = 0;
    this.x_velocity = x_velocity;
    this.y_velocity = y_velocity;
    this.x = x;
    this.y = y;
    this.id = id;
    this.direction = direction;
    this.movingLeft = false;
    this.movingRight = false;

  }
    TEMPstop(){
      this.y_velocity = 0;
    }
    moveLeft(){
      if(!this.movingRight){
        this.x_velocity = -500;
      }
      else{
        this.x_velocity = 0;
      }
        this.movingLeft = true;
    }
   
    moveRight(){
      if(!this.movingLeft){
        this.x_velocity = 500;
      }
      else{
        this.x_velocity = 0;
      }
      this.movingRight = true;
    }
    
    moveUp(){
        this.y_velocity -= 1000;
    }

    stopRight(){
        this.x_velocity = 0;
        this.movingRight = false;
    }

    stopLeft(){
        this.x_velocity  = 0;
        this.movingLeft = false;
    }
  // Move the player, update score per second
    update(dt) {
    let gravity = 1000;
    if(this.y_velocity < 1000){
    this.y_velocity += gravity * dt;
    }
    this.x += dt * this.x_velocity;
    this.y += dt * this.y_velocity;
    // Update score

    this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    return null;
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

 

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y:this.y,
      direction: this.direction,
      hp: this.hp,
    };
  }
}

module.exports = PlayerObject;
