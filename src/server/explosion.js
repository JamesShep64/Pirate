const Vector = require('./vector');
const Constants = require('../shared/constants');
class Explosion{
    constructor(id,x,y,power,surface,point,ship){
        this.pos = new Vector(x,y);
        this.id = id;
        this.radius = 10 + power/15;
        this.timer = 0;
        this.exist = true;
        this.hitboxExist = 0;
        this.ship = ship;
        this.surface = surface;
        this.netVelocity = new Vector(ship.netVelocity.x, ship.netVelocity.y);
        this.point = point;
    }

    update(dt){
        this.pos.x += dt * this.netVelocity.x * Constants.VELOCITY_MULTIPLIER;
        this.pos.y += dt * this.netVelocity.y * Constants.VELOCITY_MULTIPLIER;
        this.hitboxExist++;
        this.timer += dt * 5;
        if(this.timer > 5){
            delete this.ship.explosions[this.id];
        }
    }

    serializeForUpdate(){
        return{
            x : this.pos.x,
            y : this.pos.y,
            radius : this.radius,
            hitBoxExist : this.hitboxExist,
            timer : this.timer,
            id : this.id,
        }
    }
}

module.exports = Explosion;