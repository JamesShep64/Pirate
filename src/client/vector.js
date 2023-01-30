export default class Vector{
    constructor(x,y){
        this.a = x;
        this.b = y;
        this.unit;
    }
    set x(c){
        if(c != 0 && !c)
        {
            throw error;
        }
        this.a = c;
    }

    set y(c){
        if(c != 0 && !c)
        {
            throw error;
        }
        this.b = c;
    }

    get x(){
        return this.a;
    }

    get y(){
        return this.b;
    }
    subtract(vec){
        this.x -= vec.x;
        this.y -= vec.y;
    }
    divide(vec){
        this.x /= vec.x;
        this.y /= vec.y;
    }
    unit(){
        return new Vector(this.x/Math.sqrt(this.x * this.x + this.y * this.y), this.y/Math.sqrt(this.x * this.x + this.y * this.y));
    }   
    multiply(vec){
        this.x *= vec.x;
        this.y *= vec.y;
    }
    add(vec){
        if(vec.constructor.name == 'Vector'){
            this.x += vec.x;
            this.y += vec.y;
        }
    }
    addX(num){
        this.x += num;
    }
    addY(num){
        this.y +=num;
    }
    magnatude(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    dot(vec){
        return this.x * vec.x + this.y * vec.y;
    }

}
