const Polygon = require('./polygon');
const Vector = require('./vector');

class Cursor{
    constructor(id, x, y){
        this.pos = new Vector(x, y);
        this.selected;
        this.id = id;
    }
    update(x,y){
        this.pos.x = x;
        this.pos.y = y;
    }

    handlePress(key){
        if(key == 'r' && this.selected instanceof Polygon){
            this.selected.rotate(.05);
        }
    }
}

module.exports = Cursor;