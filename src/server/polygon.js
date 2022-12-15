
const Constants = require('../shared/constants');
class Polygon {
    constructor(points) {
        this.points = points;
        this.radius = 0;
        this.direction = 0;
        this.repeats1 = [];
        this.repeats2 = [];
    }

    //rotates about center ANGLE IN RADIANS/PI
    rotate(angle,cos,sin){
        if(typeof angle == 'number' && !cos && angle!=0 && angle){
            for(var i = 0; i <this.points.length;i++){
                var x = this.points[i].x;
                var y = this.points[i].y;
                this.points[i].x = x * Math.cos(angle) - y * Math.sin(angle);
                this.points[i].y = y * Math.cos(angle) + x * Math.sin(angle);
            }
            this.direction += angle;
            this.direction %= 2 * Constants.PI;
        }

        if(typeof angle == 'number' && cos && angle!=0 && sin){
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

    rotateTo(angle){
        angle %= 2 * Constants.PI;
        this.rotate(angle - this.direction);
    }

    serializeForUpdate() {
        return {
            points: this.points,
            center: this.center
        };
    }
}
module.exports = Polygon;

