
const Vector = require('./vector');
const Polygon = require('./polygon');

class Planet extends Polygon{
    constructor(x,y){
        super([new Vector(0, -60), new Vector(60, 0), new Vector(0, 60), new Vector(-60,0)]);
        this.pos = new Vector(x,y);
        this.radius = 60;
        this.repeats1 = [2,3];
        this.repeats2 = [0,1];
        this.floor = [];
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
            points : this.points,
        }
    }
}
module.exports = Planet;