
const Vector = require('./vector');
const Polygon = require('./polygon');
class TrapDoor extends Polygon{
    constructor(ship){
        super([new Vector(-35, -30), new Vector(35, -30), new Vector(35, 0), new Vector(-35, 0)]);
        this.collisionZeros = ['a', new Vector(25,-20), new Vector(25,-10),'a'];
        this.isClosed = true;
        this.isOpen = false;
        this.closing = false;
        this.opening = false;
        this.ship = ship;
        this.pos = new Vector(ship.pos.x, ship.pos.y);
        this.floor = [0];
    }

    update(dt){
        this.pos.x = this.ship.pos.x;
        this.pos.y = this.ship.pos.y;
        if(this.opening && !this.closing){
            this.open(dt);
        }
        if(this.closing && !this.opening){
            this.close(dt);
        }
    }
    open(dt){
        if(this.opening){
            var v = new Vector(this.ship.points[1].x - this.ship.points[0].x, this.ship.points[1].y - this.ship.points[0].y).unit();
            var comb = this.points[1].x + this.points[1].y;
            var mult = 1;
            if(this.ship.points[8].x + this.ship.points[8].y < this.ship.points[1].x + this.ship.points[1].y){
                comb *=-1;
                mult = -1;
            }
            if(comb > (this.ship.points[1].x + this.ship.points[1].y) * mult){
                this.points[1].x -= v.x * 15 * dt;
                this.points[1].y -= v.y * 15 * dt;
                this.points[2].x -= v.x * 15 * dt;
                this.points[2].y -= v.y * 15 * dt;
                this.collisionZeros[1].x -= v.x * 15 * dt;
                this.collisionZeros[1].y -= v.y * 15 * dt;
                this.collisionZeros[2].x -= v.x * 15 * dt;
                this.collisionZeros[2].y -= v.y * 15 * dt;               
                this.isClosed = false;
            }
            else{
                this.points[1].x = this.ship.points[1].x;
                this.points[1].y = this.ship.points[1].y;
                this.points[2].x = this.ship.points[2].x;
                this.points[2].y = this.ship.points[2].y;
                this.collisionZeros[1].x = this.points[1].x - 10;
                this.collisionZeros[1].y = this.points[1].y + 10;
                this.collisionZeros[2].x = this.points[2].x - 10;
                this.collisionZeros[2].y = this.points[2].y - 10;  
                this.opening = false;
                this.isOpen = true;
            }
        }
    }

    fullyOpen(){

    }

    close(dt){
        if(this.closing){
            var v = new Vector(this.ship.points[1].x - this.ship.points[0].x, this.ship.points[1].y - this.ship.points[0].y).unit();
            var comb = this.points[1].x + this.points[1].y;
            var mult = 1;
            if(this.ship.points[8].x + this.ship.points[8].y < this.ship.points[1].x + this.ship.points[1].y){
                comb *=-1;
                mult = -1;
            }
            if(comb <  (this.ship.points[8].x + this.ship.points[8].y)*mult){
                this.points[1].x += v.x * 15 * dt;
                this.points[1].y += v.y * 15 * dt;
                this.points[2].x += v.x * 15 * dt;
                this.points[2].y += v.y * 15 * dt;
                this.collisionZeros[1].x += v.x * 15 * dt;
                this.collisionZeros[1].y += v.y * 15 * dt;
                this.collisionZeros[2].x += v.x * 15 * dt;
                this.collisionZeros[2].y += v.y * 15 * dt;    
                this.isOpen = false;
            }
            else{
                this.points[1].x = this.ship.points[8].x;
                this.points[1].y = this.ship.points[8].y;
                this.points[2].x = this.ship.points[7].x;
                this.points[2].y = this.ship.points[7].y;
                this.collisionZeros[1].x = this.points[1].x - 10;
                this.collisionZeros[1].y = this.points[1].y + 10;
                this.collisionZeros[2].x = this.points[2].x - 10;
                this.collisionZeros[2].y = this.points[2].y - 10;  
                this.closing = false;
                this.isClosed = true;
            }
        }
    }

    fullyClosed(){

    }

    get realPoints(){
        var real = [];
        for(var i = 0; i<this.points.length; i++){
          real.push(new Vector(this.points[i].x + this.pos.x, this.points[i].y + this.pos.y));
        }
        return real;
    }

    serializeForUpdate(){
        return{
            x : this.pos.x,
            y : this.pos.y,
            points : this.points,
            isClosed : this.isClosed,
            isOpen : this.isOpen
        };
    }
}
module.exports = TrapDoor;  