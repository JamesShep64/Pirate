 class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
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
    unitMultiply(m){
        this.x *= m;
        this.y *= m;
    }
    unitDivide(d){
        this.x /= d;
        this.y /= d;
    }
    add(vec){
        this.x += vec.x;
        this.y += vec.y;
    }
    addX(num){
        this.x += num;
    }
    addY(num){
        this.y +=num;
    }

    dot(vec){
        return this.x * vec.x + this.y * vec.y;
    }
    magnatude(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
module.exports = Vector;