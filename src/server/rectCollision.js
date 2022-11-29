const Vector = require('./vector');

function vectorCollision(zero1, vec1, zero2, vec2){
    var h = vec1.x * vec2.y - vec1.y * vec2.x;
    var t = (zero2.x - zero1.x) * vec2.y - (zero2.y - zero1.y) * vec2.x;
    t/=h;

    var u = (zero2.x - zero1.x) * vec1.y - (zero2.y - zero1.y) * vec1.x;
    u/=h;

    return {t,u};
}
 function rectCollision(block1, block2){
    var firstCol;
    for(var i = 0; i < 2; i++){
        var zero1 = block1.pos;
        var vec1 = block1.points[i];
        for(var j = 0; j < 4; j++){
            var zero2 = block2.realPoints[j];
            var o = j+1;
            if(j == 3){
                o = 0;
            }
            var vec2 = new Vector(block2.realPoints[o].x - zero2.x, block2.realPoints[o].y - zero2.y);
            var {t,u} = vectorCollision(zero1, vec1, zero2, vec2);
            
            if(t > -1 && t < 1 && u >= 0 && u < 1){
                var mult = 1;
                if(t < 0){
                    mult = -1;
                    t = Math.abs(t);
                }
                var push = new Vector(1 - t, 1 - t);
                push.multiply(new Vector(mult, mult));
                push.multiply(vec1);
                push.multiply(new Vector(-1,-1));
                if(j == 0){
                    firstCol = {push, vec2:vec2.unit()};
                }
                else{
                firstCol = {push, t, vec2:false};
                }
            }
        }
    }

    for(var i = 0; i < 2; i++){
        var zero1 = block2.pos;
        var vec1 = block2.points[i];
        for(var j = 0; j < 4; j++){
            var zero2 = block1.realPoints[j];
            var o = j+1;
            if(j == 3){
                o = 0;
            }
            var vec2 = new Vector(block1.realPoints[o].x - zero2.x, block1.realPoints[o].y - zero2.y);
            var {t,u} = vectorCollision(zero1, vec1, zero2, vec2);

            if(t > -1 && t < 1 && u >= 0 && u < 1){
                var mult = 1;
                if(t < 0){
                    mult = -1;
                    t = Math.abs(t);
                }
                var push = new Vector(1 - t, 1 - t);
                push.multiply(new Vector(mult, mult));
                push.multiply(vec1);
                if(!firstCol){
                    return {push,t,vec2:false};
                }
                if(firstCol.t > t){
                return {push, t,vec2:false};
                }
                else{
                    return firstCol;
                }
            }
        }
    }
    return firstCol;
}
module.exports = rectCollision;