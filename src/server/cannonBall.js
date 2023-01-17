
const Vector = require('./vector');
const Polygon = require('./polygon');

class CannonBall extends Polygon{
    constructor(x,y,vec, power,ship,id){
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
    }

    update(dt){        
        //APPLY GRAVITY
        this.gvel.x += dt * this.gravity.x;
        this.gvel.y += dt * this.gravity.y;
        if(this.gvel.magnatude() > 300){
        this.gvel.y = 300;
        }

        //APPLY VELOCITIES
        this.netVelocity.x = this.gvel.x + this.shootVel.x + this.shipVel.x;
        this.netVelocity.y = this.gvel.y + this.shootVel.y + this.shipVel.y;
        this.pos.x += dt * this.netVelocity.x;
        this.pos.y += dt * this.netVelocity.y;
    }

    explode(){
        delete this;
    }

    distanceTo(player){
        return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
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
            y : this.pos.y
        }
    }
}
module.exports = CannonBall;