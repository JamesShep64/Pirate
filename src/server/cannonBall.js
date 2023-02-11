
const Vector = require('./vector');
const Polygon = require('./polygon');
const Constants = require('../shared/constants');

class CannonBall extends Polygon{
    constructor(id,x,y,vec, power,ship,type){
        super([new Vector(0,-20), new Vector(20,0), new Vector(0,20), new Vector(-20,0)]);
        this.pos = new Vector(x, y);
        this.id = id;
        this.power = power;
        this.radius = 20;
        //movement
        this.gvel = new Vector(0,0);
        this.gravity = new Vector(0,10);
        this.netVelocity = new Vector(0,0);
        this.shootVel = new Vector(vec.x * power, vec.y * power);
        this.shipVel = new Vector(ship.netVelocity.x,ship.netVelocity.y);
        this.shootMult = 1;
        //type
        this.type = type;
    }

    update(dt){        
        //APPLY GRAVITY
        this.gvel.x += dt * this.gravity.x * 5;
        this.gvel.y += dt * this.gravity.y * 5;
        if(this.gvel.magnatude() > 300){
        this.gvel.y = 300;
        }

        //APPLY VELOCITIES
        this.netVelocity.x = this.gvel.x + this.shootVel.x * this.shootMult + this.shipVel.x;
        this.netVelocity.y = this.gvel.y + this.shootVel.y * this.shootMult + this.shipVel.y;
        this.pos.x += dt * this.netVelocity.x * Constants.VELOCITY_MULTIPLIER;
        this.pos.y += dt * this.netVelocity.y * Constants.VELOCITY_MULTIPLIER;
    }

    explode(){
        delete this;
    }

    distanceTo(player){
        return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
    }

    withinRect(other,width,height){
        if(other.pos.x < this.pos.x + width && other.pos.x > this.pos.x - width && other.pos.y < this.pos.y + height && other.pos.y > this.pos.y - height)
          return true;
        return false;
    }  

    get realPoints(){
        var real = [];
        for(var i = 0; i<4; i++){
          real.push(new Vector(this.points[i].x + this.pos.x, this.points[i].y + this.pos.y));
        }
        return real;
    }

    serializeForUpdate(){
        return{
            id : this.id,
            x : this.pos.x,
            y : this.pos.y,
            type: this.type,
        }
    }
}
module.exports = CannonBall;