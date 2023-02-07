const Constants = require("../shared/constants");
const Vector =  require("./vector");


class Asteroid{
    constructor(id,start,line){
        this.id = id;
        this.line = line;
        this.start = new Vector(start.x,start.y);
        this.radius = Math.round(18 + Math.random() * 15);
        this.t = 0;
        this.pos = new Vector(0,0);
        this.netVelocity = new Vector(0,0);
        this.pos.x = this.start.x + this.line.x * this.t;
        this.pos.y = this.start.y + this.line.y * this.t;
        this.mag = this.line.magnatude();
        if(Math.random() < .5){this.turn = -1;}
        else{this.turn = 1;}
    }
    generateT(ts){
        this.t = Math.round(Math.random() * 1000)/1000;
        for(var other in ts){
            if(this.t + .020 > other && this.t - .020 < other){
                this.generateT(ts);
            }
        }
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

    }
    serializeForUpdate(){
        return{
            id : this.id,
            x : this.pos.x,
            y : this.pos.y,
            radius : this.radius,
        }
    }
}

module.exports = Asteroid;