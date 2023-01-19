const Vector = require('./vector');
function vectorCollision(zero1, vec1, zero2, vec2){
    var h = vec1.x * vec2.y - vec1.y * vec2.x;
    var t = (zero2.x - zero1.x) * vec2.y - (zero2.y - zero1.y) * vec2.x;
    t/=h;

    var u = (zero2.x - zero1.x) * vec1.y - (zero2.y - zero1.y) * vec1.x;
    u/=h;

    return {t,u};
}
function playerLadderCollision(block1, block2){
    if(!block1.withinRect(block2.ship,block1.radius + block2.ship.radius,block1.radius + block2.ship.radius))
        return false;
    for(var i = 0; i < 4; i++){
        var zero1 = block1.pos;
        var vec1 = block1.points[i];
        for(var j = 1; j < block2.points.length; j++){
            var zero2 = block2.realPoints[j];
            var o = j+1;
            if(o == block2.points.length){
                o = 0;
            }
            var vec2 = new Vector(block2.realPoints[o].x - zero2.x, block2.realPoints[o].y - zero2.y);
            var {t,u} = vectorCollision(zero1, vec1, zero2, vec2);

            if(t > -1 && t < 1 && u >= 0 && u < 1){
                return true;
            }
        }
    }
    return false;
}
module.exports = playerLadderCollision;