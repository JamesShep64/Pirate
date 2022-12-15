

const Vector = require('./vector');
const Polygon = require('./polygon');
const CONSTANTS = require('../shared/constants');

class Telescope{
    constructor(ship,point){
        this.direction = 0;
        this.ship = ship;
        this.radius = 5;
        this.user;
        this.beingUsed = false;
        this.pos = new Vector(0,0);
        this.point = point;
        this.barell = new Polygon([new Vector(0, 0), new Vector(50, -5), new Vector(50, 5)]);
        this.points = this.barell.points;

    }

    update(){
        var perp = new Vector((this.ship.points[1].y - this.ship.points[0].y),-(this.ship.points[1].x - this.ship.points[0].x)).unit();
        this.pos.x = this.point.x + this.ship.pos.x;
        this.pos.y = this.point.y + this.ship.pos.y;
        this.pos.x +=  5 * perp.x;
        this.pos.y += 5 * perp.y;
    }

    use(player){
        if(player.distanceTo(this) < this.radius + player.radius){
            player.stopLeft();
            player.stopRight();
            player.using = this;
            player.isUsing = true;
            player.onTelescope = true;
            this.beingUsed = true;
            this.user = player;
        }
    }
    rotateBarell(angle,cos,sin){
        this.barell.rotate(angle,cos,sin);
    }
    serializeForUpdate(){
        return{
            x : this.pos.x,
            y : this.pos.y,
            points : this.points
        };
    }
}
module.exports = Telescope;