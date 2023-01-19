function withinRect(x,y,other,width,height){
    if(other.pos.x < x + width && other.pos.x > x - width && other.pos.y < y + height && other.pos.y > y - height)
      return true;
    return false;
}

module.exports = withinRect;