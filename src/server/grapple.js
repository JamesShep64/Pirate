
const Vector = require('./vector');
const CannonBall = require('./cannonBall');
const Polygon = require('./polygon');

class Grapple extends CannonBall{
    constructor(id,x, y, vec, ship, cannon){
        super(id,x,y,vec, 80,ship);
        this.exists = true;
        this.timer = 0;
        this.cannon = cannon;
        this.gotHooked = false;
        this.planet;
        this.inOrbit;
        this.start = new Vector(0,0);
        this.forwardMove = new Vector(0,0);
        this.ship = ship;
        this.ropeBox;
        this.shootMult = 1.5;
    }

    update(dt){
        if(!this.gotHooked){
            super.update(dt);
            this.timer += dt;
            if(this.timer > 3){
                this.exists = false;
                delete this;
            }
        }
    }

    hook(planet){
        this.updateRopeBox();
        this.pos = planet.pos;
        this.planet = planet;
        this.gotHooked = true;
        this.ship.planet = planet;
        if(planet.constructor.name == 'Asteroid')
            this.ship.onAsteroid = true;
    }
    updateRopeBox(){
        var now = new Vector(this.ship.turn * (this.ship.points[1].x - this.ship.points[0].x), this.ship.turn * (this.ship.points[1].y - this.ship.points[0].y)).unit();
        this.ropeBox = new Polygon([new Vector(this.cannon.pos.x+now.x*5, this.cannon.pos.y + now.y*5),new Vector(this.cannon.pos.x-now.x*5, this.cannon.pos.y-now.y*5),
        new Vector(this.pos.x-now.x*5, this.pos.y-now.y*5),new Vector(this.pos.x+now.x*5, this.pos.y+now.y*5)]);

    }

    detach(){
        this.ropeBox = null;
        this.gotHooked = false;
        this.ship.inOrbit = false;
        this.ship.grapple = null;
        this.ship.planet = null;
        this.planet = null;
        this.ship.justGrappled = true;
        this.ship.rotOGCounter = 0;
        this.ship.continueGrapple = false;
        this.ship.onAsteroid = false;
    }

    distanceTo(player){
        return Math.sqrt((this.pos.x - player.pos.x) * (this.pos.x - player.pos.x) + (this.pos.y - player.pos.y) * (this.pos.y - player.pos.y));
    }
    withinRect(other,width,height){
        if(other.pos.x < this.pos.x + width && other.pos.x > this.pos.x - width && other.pos.y < this.pos.y + height && other.pos.y > this.pos.y - height)
          return true;
        return false;
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