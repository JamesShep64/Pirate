const Vector = require("./vector");
class Polygon {
    constructor(points) {
        this.points = points;
        this.radius = 0;
        this.direction = 0;
    }

    setRadius(radius){
        this.radius = radius;
    }


    //rotates about center ANGLE IN RADIANS/PI
    rotate(angle){
        for(var i = 0; i <this.points.length;i++){
            var x = this.points[i].x;
            var y = this.points[i].y;
            this.points[i].x = x * Math.cos(angle*Math.PI) - y * Math.sin(angle*Math.PI);
            this.points[i].y = y * Math.cos(angle*Math.PI) + x * Math.sin(angle*Math.PI);
        }
        this.direction += angle;
        this.direction %= 2;
    }

    rotateTo(angle){
        angle %= 2;
        this.rotate(angle - this.direction);
    }

  serializeForUpdate() {
      return {
          points: this.points,
      };
    }
}



  
  module.exports = Polygon;
  