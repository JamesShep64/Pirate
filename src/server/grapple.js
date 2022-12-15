
const Vector = require('./vector');
const CannonBall = require('./cannonBall');


class Grapple extends CannonBall{
    constructor(x, y, vec, ship, cannon){
        super(x,y,vec,null, 80,ship);
        this.exists = true;
        this.timer = 0;
        this.cannon = cannon;
        this.gotHooked = false;
        this.planet;
        this.inOrbit;
        this.start = new Vector(0,0);
        this.forwardMove = new Vector(0,0);
        this.ship = ship;
    }

    update(dt){
        if(!this.gotHooked){
            super.update(dt);
            this.timer += dt;
            if(this.timer > 12){
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
        delete this;
    }

    distanceTo(player){
        return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
    }
}
module.exports = Grapple;