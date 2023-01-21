
const Vector = require('./vector');
const CannonBall = require('./cannonBall');


class Grapple extends CannonBall{
    constructor(id,x, y, vec, ship, cannon){
        super(x,y,vec, 80,ship);
        this.id = id;
        this.exists = true;
        this.timer = 0;
        this.cannon = cannon;
        this.gotHooked = false;
        this.planet;
        this.inOrbit;
        this.start = new Vector(0,0);
        this.forwardMove = new Vector(0,0);
        this.ship = ship;
        this.shootMult = 1.5;
    }

    update(dt){
        if(!this.gotHooked){
            super.update(dt);
            this.timer += dt;
            if(this.timer > 1.5){
                this.exists = false;
                delete this;
            }
        }
    }

    hook(planet){
        this.pos = planet.pos;
        this.planet = planet;
        this.gotHooked = true;
        this.ship.planet = planet;
    }

    detach(){
        this.gotHooked = false;
        this.ship.inOrbit = false;
        this.ship.grapple = null;
        this.ship.planet = null;
        this.planet = null;
        this.ship.justGrappled = true;
        this.ship.rotOGCounter = 0;
        this.ship.continueGrapple = false;
        delete this;
    }

    distanceTo(player){
        return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
    }
    serializeForUpdate(){
        return{
            id : this.id,
            x : this.pos.x,
            y : this.pos.y,
            xEnd : this.cannon.pos.x,
            yEnd : this.cannon.pos.y,
        }
    }
}
module.exports = Grapple;