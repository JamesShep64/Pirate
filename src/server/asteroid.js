const Constants = require("../shared/constants");
const Vector =  require("./vector");


class Asteroid{
    constructor(id,start,line,t){
        this.dir;
        this.id = id;
        this.line = line;
        this.start = new Vector(start.x,start.y);
        this.radius = Math.round(25 + Math.random() * 10);
        this.t = t;
        this.pos = new Vector(0,0);
        this.netVelocity = new Vector(0,0);
        if(Math.random() < .5)
            this.clock = -1;
        else
            this.clock = 1;
        this.pos.x = this.start.x + this.line.x * this.t;
        this.pos.y = this.start.y + this.line.y * this.t;
        this.mag = this.line.magnatude();
        this.direction = Math.random() * 2 * Constants.PI;
        if(Math.random() < .5){this.turn = -1;}
        else{this.turn = 1;}
    }
    update(dt){
        if(this.t > 1 || this.t < 0){
            this.turn *= -1;
        }
        this.t +=  (this.turn * 2)/this.mag;
        this.netVelocity.x = (this.start.x +  this.t * this.line.x - this.pos.x)/(dt*Constants.VELOCITY_MULTIPLIER);
        this.netVelocity.y = (this.start.y +  this.t * this.line.y - this.pos.y)/(dt*Constants.VELOCITY_MULTIPLIER);
        this.pos.x += this.netVelocity.x * dt*Constants.VELOCITY_MULTIPLIER;
        this.pos.y += this.netVelocity.y * dt*Constants.VELOCITY_MULTIPLIER;
        this.direction += this.clock * dt;
        this.direction %= 2 * Constants.PI;
    }
    serializeForUpdate(){
        return{
            id : this.id,
            x : this.pos.x,
            y : this.pos.y,
            radius : this.radius,
            direction : this.direction,
        }
    }
}

module.exports = Asteroid;