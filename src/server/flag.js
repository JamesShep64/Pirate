const Vector = require('./vector');
const Polygon = require('./polygon');
class Flag extends Polygon{
    constructor(ship,name,color){
        super([new Vector(70,-140),new Vector(140,-140),new Vector(140,-90), new Vector(70,-90)]);
        this.ship = ship;
        this.name = name;
        this.color = color;
        this.pos = ship.pos;
        this.namePoint = new Vector(75,-115);
    }
    rotate(angle,cos,sin){
        super.rotate(angle,cos,sin);
        var x = this.namePoint.x;
        var y = this.namePoint.y;
        this.namePoint.x = x * cos - y * sin;
        this.namePoint.y = y * cos + x * sin;
    }

    serializeForUpdate(){
        return{
            x : this.pos.x,
            y : this.pos.y,
            points : this.points,
            color : this.color,
            name : this.name,
            namePointX : this.namePoint.x,
            namePointY : this.namePoint.y,
        };
    }
    
}

module.exports = Flag;