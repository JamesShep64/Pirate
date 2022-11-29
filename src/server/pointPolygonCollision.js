const Vector = require('./vector');
function getProjectedPointOnLine(p,line,zero){
    var point = new Vector(p.x - zero.x, p.y - zero.y);
    
    var proj = new Vector(((point.x * line.x + point.y * line.y) / (line.x * line.x + line.y * line.y)) * line.x + zero.x,
    ((point.x * line.x + point.y * line.y) / (line.x * line.x + line.y * line.y)) * line.y + zero.y);
    return proj;
  }

  //circle polygon collision
function pointPolygonCollision(x1, y1, poly2, x2, y2){
    var didCol = false;
   var circlePointReal = new Vector(x1, y1);
   var poly2PointsReal = poly2.points.map(point => new Vector(point.x + x2, point.y + y2));
   var axi2 = [];
   var comps2 = [];
   for(var i = 0; i < poly2.points.length; i++){
    var o =  i + 1;
    if(o == poly2.points.length){
        o = 0;
    }
    axi2.push(new Vector(poly2.points[i].x - poly2.points[o].x, poly2.points[i].y - poly2.points[o].y));
    comps2.push((poly2PointsReal[i].x + poly2PointsReal[i].y));
    }
   var circleProj = [];

   for( i = 0; i < axi2.length;i++){
    circleProj.push(getProjectedPointOnLine(circlePointReal, axi2[i], poly2PointsReal[i]));
   }
   for(i = 0;i<axi2.length;i++){
    var o = i + 1;
    if(o == poly2.points.length){
        o = 0;
    }
     var circleComp = circleProj[i].x + circleProj[i].y;
     var minComp = Math.min(comps2[i], comps2[o]);
     var maxComp = Math.max(comps2[i], comps2[o]);
    if(!(circleComp < maxComp && circleComp > minComp)){
        return didCol;
    }
   }
   didCol = true;
   return didCol;
}

module.exports = pointPolygonCollision;