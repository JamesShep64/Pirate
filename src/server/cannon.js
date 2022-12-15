
const Vector = require('./vector');
const Polygon = require('./polygon');
const CannonBall = require('./cannonBall');
const Grapple = require('./grapple');
const Constants = require('../shared/constants');
class Cannon{
    constructor(ship,line,point,side){
        //position
        this.id = 0;
        this.direction = 0;
        this.ship = ship;
        this.radius = 10;
        this.t = 1;
        if(line){
            this.line = line;
            this.lineVector = new Vector(line.points[1].x - line.points[0].x, line.points[1].y - line.points[0].y);
            this.pos = new Vector(line.points[0].x,line.points[0].y);
        }
        else{
            this.point = point;
            this.pos = new Vector(0,0);
            this.pos.x = this.point.x;
            this.pos.y = this.point.y;

        }
        this.gotMoved = false;
        //Cannon Polygons
        this.barell = new Polygon([new Vector(0, 5), new Vector(0, -5), new Vector(50, -5), new Vector(50, 5)]);
        this.shootVec = new Polygon([new Vector(1, 0)]);
        this.points = this.barell.points;
        //Player Interaction
        this.beingHeld = false;
        this.holder;
        this.beingUsed = false;
        this.user;
        //set side for stationary cannons
        this.side = side;
        //rotate barrel to starting position
        if(!this.line){
            if(this.side == 1){
                this.rotateBarellTo(2);
            }
            if(this.side == -1){
                this.rotateBarellTo(-2 + Constants.PI);
            }
        }
        //cannonball
        this.ammoTimer = 0;
        this.loadTimer = 0;
        this.ammo = 5;
        this.isLoading = false;
    }

    update(dt){
        this.ammoTimer += dt;
        if(this.ammoTimer > 36){
            if(this.ammo < 5){
                this.ammo++;
            }
            this.ammoTimer = 0;
        }
        if(this.line){
            this.lineVector.x = this.line.points[1].x - this.line.points[0].x;
            this.lineVector.y = this.line.points[1].y - this.line.points[0].y;
            this.pos = new Vector(this.line.points[0].x + this.ship.pos.x + this.lineVector.x * this.t, 
            this.line.points[0].y + this.ship.pos.y + this.lineVector.y * this.t);
            this.gotMoved = false;
        }
        else{
            var perp = new Vector((this.ship.points[1].y - this.ship.points[0].y),-(this.ship.points[1].x - this.ship.points[0].x)).unit();
            var now = new Vector(this.side * (this.ship.points[1].x - this.ship.points[0].x),this.side * (this.ship.points[1].y - this.ship.points[0].y)).unit();
            this.pos.x = this.point.x + this.ship.pos.x;
            this.pos.y = this.point.y + this.ship.pos.y;
            this.pos.x +=  10 * perp.x;
            this.pos.y += 10 * perp.y;
            this.pos.x += 10 * now.x;
            this.pos.y += 10 * now.y;
        }
        //load cannon
        if(this.isLoading){
            this.loadCannonBall(dt);
        }
    }
    rotateWire(angle){
        this.line.rotate(angle);
    }
    rotateBarell(angle){
        this.direction = this.barell.direction + angle;
        this.direction %= 2*Constants.PI;
       if(this.line){ 
            if(this.direction - this.ship.direction < .05 && this.direction - this.ship.direction > -Constants.PI){
                this.barell.rotate(angle);
                this.shootVec.rotate(angle);
            }
        }
        else{
            if(this.side == 1){
                if(this.direction - this.ship.direction < 3.2 && this.direction - this.ship.direction > 1.6){
                    this.barell.rotate(angle);
                    this.shootVec.rotate(angle);
                }
            }

            if(this.side == -1){
                if(this.direction - this.ship.direction < 1.4 && this.direction - this.ship.direction > .15){
                    this.barell.rotate(angle);
                    this.shootVec.rotate(angle);
                }
            }
        }
        
    }

    rotateBarellTo(angle){
        this.direction = angle;
        this.direction %= 2*Constants.PI;
        this.barell.rotate(angle);
        this.shootVec.rotate(angle);
    }


    move(player){
        if(player.distanceTo(this) < this.radius + player.radius){
            var proj = this.getProjectedPointOnLine(player.pos, new Vector(this.line.points[1].x - this.line.points[0].x,
                this.line.points[1].y - this.line.points[0].y), 
                new Vector(this.ship.pos.x + this.line.points[0].x, this.ship.pos.y + this.line.points[0].y));
            proj.subtract(this.ship.pos);
            var minComb = Math.min(this.line.points[0].x + this.line.points[0].y, this.line.points[1].x + this.line.points[1].y);
            var maxComb = Math.max(this.line.points[0].x + this.line.points[0].y, this.line.points[1].x + this.line.points[1].y);
            if(proj.x + proj.y < maxComb && proj.x + proj.y > minComb){
               
                player.holding = this;
                player.isHolding = true;
                this.beingHeld = true;
                this.holder = player;

                proj.add(this.ship.pos);
                var vec1 = this.lineVector;
                var zero1 = new Vector(this.ship.pos.x + this.line.points[0].x, this.ship.pos.y + this.line.points[0].y);
                var vec2 = proj;
                var zero2 = new Vector(0,0);
                var a = vec1.x * vec2.y - vec1.y * vec2.x;
                var b = (zero2.x - zero1.x) * vec2.y - (zero2.y - zero1.y) * vec2.x;
                b/=a;
                this.t = b;
                return true;
            }
        }
        return false;
    }

    use(player){
        if(player.distanceTo(this) < this.radius + player.radius){
            player.stopLeft();
            player.stopRight();
            player.using = this;
            player.isUsing = true;
            this.beingUsed = true;
            this.user = player;
        }
    }
    getProjectedPointOnLine(p,line,zero){
        var point = new Vector(p.x - zero.x, p.y - zero.y);
        
        var proj = new Vector(((point.x * line.x + point.y * line.y) / (line.x * line.x + line.y * line.y)) * line.x + zero.x,
        ((point.x * line.x + point.y * line.y) / (line.x * line.x + line.y * line.y)) * line.y + zero.y);
        return proj;
    }

    loadCannonBall(dt){
        if(this.ammo > 0){
            if(this.loadTimer < 12){
                this.loadTimer += dt;
            }
        }
    }
    fireCannonBall(){
        if(this.ammo > 0){
            this.shootCannonBall(this.loadTimer * 18);
            this.ammo--;
        }
        this.isLoading = false;
        this.loadTimer = 0;
    }

    shootCannonBall(power){
            this.ship.cannonBalls.push(new CannonBall(this.pos.x + this.shootVec.points[0].x * 60, this.pos.y + this.shootVec.points[0].y * 60, this.shootVec.points[0], 'a',power,this.ship));
    }

    shootGrapple(){
        if(!this.ship.grapple && this.line)
            this.ship.grapple = (new Grapple(this.pos.x + this.shootVec.points[0].x * 50, this.pos.y + this.shootVec.points[0].y * 50, this.shootVec.points[0], this.ship, this));
    }

    serializeForUpdate(){
        return{
            x : this.pos.x,
            y : this.pos.y,
            points : this.points,
            ammo : this.ammo,
            loadTimer : this.loadTimer
        }
    }

} 
module.exports = Cannon;