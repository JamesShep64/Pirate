
const Vector = require('./vector');
const Polygon = require('./polygon');
class Platform extends Polygon{
    constructor(ship,points){
        super(points);
        this.collisionZeros = [new Vector(48,-153), new Vector(77,-153), new Vector(77,-152), new Vector(48,-152)];
        this.ship = ship;
        this.pos = ship.pos;
        this.floor = [2];
        this.repeats1 = [];
        this.repeats2 = [];
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
            x : this.pos.x,
            y : this.pos.y,
            points : this.points
        };
    }
}
module.exports = Platform;