
const Vector = require('./vector');
const Polygon = require('./polygon');
const Constants = require('../shared/constants');
class Ladder extends Polygon{
    constructor(ship,points){
        super(points);
        this.ship = ship;
        this.pos = ship.pos;
        this.floor = [];
        this.repeats1 = [];
        this.repeats2 = [];
    }

    rotate(angle,cos,sin){
        if(typeof angle == 'number' && cos && angle!=0){
            for(var i = 0; i <this.points.length;i++){
                var x = this.points[i].x;
                var y = this.points[i].y;
                this.points[i].x = x * cos - y * sin;
                this.points[i].y = y * cos + x * sin;
            }
            this.direction += angle;
            this.direction %= 2 * Constants.PI;
        }
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

module.exports = Ladder;