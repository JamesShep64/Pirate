const Vector = require('./vector');
function vectorCollision(zero1, vec1, zero2, vec2){
    var h = vec1.x * vec2.y - vec1.y * vec2.x;
    var t = (zero2.x - zero1.x) * vec2.y - (zero2.y - zero1.y) * vec2.x;
    t/=h;

    var u = (zero2.x - zero1.x) * vec1.y - (zero2.y - zero1.y) * vec1.x;
    u/=h;

    return {t,u};
} 
function shipShipCollision(ship1, ship2){
    if(ship1.distanceTo(ship2) > ship1.radius + ship2.radius)
        return false;
    var firstCol;
    for(var i = 0; i < ship1.outer.length; i++){
        var zero1 = ship1.pos;
        var vec1 = ship1.outer[i];
        for(var j = 0; j < ship2.outer.length; j++){
            var zero2 = new Vector(ship2.outer[j].x + ship2.pos.x, ship2.outer[j].y + ship2.pos.y);
            var o = j+1;
            if(o == ship2.outer.length){
                o = 0;
            }
            var vec2 = new Vector(ship2.outer[o].x + ship2.pos.x - zero2.x, ship2.outer[o].y + ship2.pos.y - zero2.y);
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

    for(var i = 0; i < ship2.outer.length; i++){
        var zero1 = ship2.pos;
        var vec1 = ship2.outer[i];
        for(var j = 0; j<ship1.outer.length; j++){
            var zero2 = new Vector(ship1.outer[j].x + ship1.pos.x, ship1.outer[j].y + ship1.pos.y);
            var o = j+1;
            if(o == ship1.outer.length){
                o = 0;
            }
            var vec2 = new Vector(ship1.outer[o].x + ship1.pos.x - zero2.x, ship1.outer[o].y + ship1.pos.y - zero2.y);
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
module.exports = shipShipCollision;