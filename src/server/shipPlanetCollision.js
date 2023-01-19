const Vector = require('./vector');
function vectorCollision(zero1, vec1, zero2, vec2){
    var h = vec1.x * vec2.y - vec1.y * vec2.x;
    var t = (zero2.x - zero1.x) * vec2.y - (zero2.y - zero1.y) * vec2.x;
    t/=h;

    var u = (zero2.x - zero1.x) * vec1.y - (zero2.y - zero1.y) * vec1.x;
    u/=h;

    return {t,u};
}
function shipPlanetCollision(ship, block2){
    if(!ship.withinRect(block2,ship.radius + block2.radius,ship.radius + block2.radius))
        return false;
    if(ship.distanceTo(block2) > ship.radius + block2.radius)
        return false;
    var firstCol;
    for(var i = 0; i < ship.outer.length; i++){
        var zero1 = ship.pos;
        var vec1 = ship.outer[i];
        for(var j = 0; j < block2.points.length; j++){
            var zero2 = block2.realPoints[j];
            var o = j+1;
            if(o == block2.points.length){
                o = 0;
            }
            var vec2 = new Vector(block2.realPoints[o].x - zero2.x, block2.realPoints[o].y - zero2.y);
            var {t,u} = vectorCollision(zero1,vec1,zero2,vec2);
            if(t > 0 && t < 1 && u >=0 && u < 1){
                var push = new Vector(1 - t, 1 - t);
                push.x *= -1;
                push.y *= -1;
                push.multiply(vec1);
                firstCol = {push,t};
                return {push};
            }
        }
    }

    for(var i = 0; i < block2.points.length; i++){
        var zero1 = block2.pos;
        var vec1 = block2.points[i];
        for(var j = 0; j<ship.outer.length; j++){
            var zero2 = new Vector(ship.outer[j].x + ship.pos.x, ship.outer[j].y + ship.pos.y);
            var o = j+1;
            if(o == ship.outer.length){
                o = 0;
            }
            var vec2 = new Vector(ship.outer[o].x + ship.pos.x - zero2.x, ship.outer[o].y + ship.pos.y - zero2.y);
            var {t,u} = vectorCollision(zero1, vec1, zero2, vec2);
            if(t > 0 && t < 1 && u >=0 && u<1){
                var push = new Vector(1 - t, 1 - t);
                push.multiply(vec1);
                if(!firstCol){
                    return {push};
                }
                if(firstCol.t < t){
                    return {push : firstCol.push};
                }
                else{
                    return {push};
                }
            }
        }
    }

}
module.exports = shipPlanetCollision;