const Vector = require('./vector');
class Explosion{
    constructor(x,y,power,surface,ship,id){
        this.pos = new Vector(x,y);
        this.id = id;
        this.radius = 10 + power/15;
        this.timer = 0;
        this.exist = true;
        this.hitboxExist = 0;
        this.ship = ship;
        this.surface = surface;
    }

    update(dt){
        this.hitboxExist++;
        this.timer += dt;
        if(this.timer > 5){
            delete this.ship.explosions[this.id];
        }
    }
}

module.exports = Explosion;