import { debounce } from 'throttle-debounce';
import constants, { PLAYER_SIZE } from '../shared/constants';
import { getAsset } from './assets';
import { getCurrentState } from './state';
import Vector from './vector';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, MAP_SIZE,BLOCK_SIZE } = Constants;
var lastUpdateTime  = 0;
// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
context.save();
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = 1.5 * scaleRatio * window.innerWidth;
  canvas.height = 1.5 * scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));
function render() {
  const { me, others, blocks, ships,cannonBalls,grapples,planets} = getCurrentState();
  if (!me) {
    return;
  }
  const now = Date.now();
  lastUpdateTime = now;
  // Draw background
  renderBackground(me.eyesX, me.eyesY);


  //draw planets
  planets.forEach(planet => drawPoly(planet,me));

  //draw ship hulls
  ships.forEach(ship =>{
    drawShip(ship,me);
    context.fillStyle = 'black';
  });



  //draw ship parts
  ships.forEach(ship =>{
    drawShipParts(ship,me);
  })

  //draw CannonBalls
  cannonBalls.forEach(ball =>{
    drawCannonBall(ball,me);
  });

  //draw grapples
  grapples.forEach(grapple =>{
    const endX = canvas.width / 2 + grapple.x - me.x;
    const endY = canvas.height / 2 + grapple.y - me.y;
    const startX = canvas.width / 2 + grapple.xEnd - me.x;
    const startY = canvas.height / 2 + grapple.yEnd - me.y;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX,endY);
    context.lineWidth = 4;
    context.stroke();
    context.lineWidth = .5;
    context.restore();
  });
  
  //draw me
  if(!me.dead){
    drawPoly(me,me);
    context.fillStyle = me.color;
    context.fill();
  }
  else{
    context.globalAlpha = .6;
    context.font = "200px papyrus";
    context.fillText("R.I.P",canvas.width / 2 - 200,canvas.height / 2 + 75);
    context.globalAlpha = 1;
  }

  //draw others
  others.filter(player => !player.dead,).forEach(player => {drawPoly(player,me)
    context.fillStyle = player.color;
    context.fill();
  });
  context.fillStyle = 'black';

  //draw blocks
  blocks.forEach(block => {
    drawPoly(block,me);
    context.fillStyle = "rgb(210,180,140)";
    context.fill();
    context.fillStyle = 'black';
  });

  //draw text
  context.globalAlpha = .6;
  context.font = "400px serif";
  context.fillStyle = "rgb("+(me.outOfBoundsTimer*42).toString()+", 0, 0)";
  if(Math.round(me.outOfBoundsTimer) > 0)
    context.fillText(Math.round(me.outOfBoundsTimer).toString(),canvas.width / 2 - 100,canvas.height / 2 + 100);
  context.globalAlpha = 1;

}

function renderBackground(playerX, playerY){
  context.fillStyle = '#34cceb';
  context.fillRect(0,0,canvas.width,canvas.height);
  for(var x = playerX - canvas.width/2 - 400; x < canvas.width/2 + playerX + 400; x +=20){
    for(var y = playerY - canvas.height/2 - 400; y < canvas.height/2 + playerY + 400; y +=20){
      x = Math.ceil(x / 20) * 20;
      y = Math.ceil(y/20) * 20;
      if((x % 1980 == 0 && y % 2360 == 0) ||((x != 0 && y != 0) && (x % 2120 == 0 && y % 1880 == 0)) || (x % 1400 == 0 && y % 860 == 0) || ((x != 0 && y != 0) && (x % 1240 == 0 && y % 1000 == 0))){
        context.save();
        context.translate(canvas.width / 2 - playerX + x, canvas.height / 2 - playerY + y);
        context.beginPath();
        context.moveTo(170, 80);
        context.bezierCurveTo(130, 100, 130, 150, 230, 150);
        context.bezierCurveTo(250, 180, 320, 180, 340, 150);
        context.bezierCurveTo(420, 150, 420, 120, 390, 100);
        context.bezierCurveTo(430, 40, 370, 30, 340, 50);
        context.bezierCurveTo(320, 5, 250, 20, 250, 50);
        context.bezierCurveTo(200, 5, 150, 20, 170, 80);
        context.closePath();
        context.fillStyle = 'white';
        context.fill();
        context.restore();
      }
    }
  }
  context.lineWidth = 3;
  context.strokeRect(canvas.width / 2 - playerX, canvas.height / 2 - playerY, Constants.MAP_WIDTH, Constants.MAP_HEIGHT);
  context.lineWidth = .5;
  context.restore();
  context.fillStyle = 'black';
}


function drawPoly(block, me){
    var canvasX = canvas.width / 2 + block.x - me.eyesX;
    var canvasY = canvas.height / 2 + block.y - me.eyesY;
    context.restore();
    var o;
    context.beginPath();
    for(var i = 0; i<block.points.length; i++){
      o = i + 1;
      if(o == block.points.length){
        o = 0;
      }
      if(i == 0){
      context.moveTo(canvasX + block.points[i].x, canvasY + block.points[i].y);
      }
      else{
      context.lineTo(canvasX + block.points[i].x, canvasY + block.points[i].y);
      }
      if(i == block.points.length - 1){
        context.lineTo(canvasX + block.points[0].x, canvasY + block.points[0].y);
      }
    }
    context.closePath();
    context.stroke();
}

function drawShip(ship,me){
  var canvasX = canvas.width / 2 + ship.x - me.eyesX;
  var canvasY = canvas.height / 2 + ship.y - me.eyesY;
  context.restore();
  var o;
  context.beginPath();
  var damageCurves = [];
  for(var i = 0; i<ship.points.length; i++){
    o = i + 1;
    if(o == ship.points.length){
      o = 0;
    }
    var surface = new Vector(ship.points[o].x - ship.points[i].x, ship.points[o].y - ship.points[i].y).unit();
    var perp = new Vector((ship.points[o].y - ship.points[i].y), -(ship.points[o].x - ship.points[i].x)).unit();
    if(i == 0){
    context.moveTo(canvasX + ship.points[i].x, canvasY + ship.points[i].y);
    ship.damages.filter(damage =>damage.surface == i,).sort((a,b) =>{
      if(Math.abs((a.point.x - ship.points[i].x) * (a.point.y - ship.points[i].y)) < Math.abs((b.point.x - ship.points[i].x) * (b.point.y - ship.points[i].y))){
        return -1;
      }
      return 1;
    }).forEach(damage =>{
      var startX = canvasX + damage.point.x - 10 * surface.x;
      var startY = canvasY + damage.point.y - 10 * surface.y;
      var endX = canvasX + damage.point.x - 10 * perp.x;
      var endY = canvasY + damage.point.y - 10 * perp.y;
      var cp1X = startX - perp.x * 10 * .552;
      var cp1Y = startY - perp.y * 10 * .552;
      var cp2X = endX - surface.x * 10 * .552;
      var cp2Y = endY - surface.y * 10 * .552;
      if(damage.health == 0){
        context.lineTo(startX, startY);
        context.bezierCurveTo(cp1X,cp1Y,cp2X,cp2Y,endX,endY);
      }
      
      var startX2 = endX;
      var startY2 = endY;
      var endX2 = canvasX + damage.point.x + 10 * surface.x;
      var endY2 = canvasY + damage.point.y + 10 * surface.y;
      var cp1X2 = startX2 + surface.x * 10 * .552;
      var cp1Y2 = startY2 + surface.y * 10 * .552;
      var cp2X2 = endX2 - perp.x * 10 * .552;
      var cp2Y2 = endY2 - perp.y * 10 * .552;
      if(damage.health > 0){
        damageCurves.push({start : new Vector(startX,startY), curve1 : [cp1X,cp1Y,cp2X,cp2Y,endX,endY], curve2 : [cp1X2,cp1Y2,cp2X2,cp2Y2,endX2,endY2], health : damage.health});
      }
      else{
        context.bezierCurveTo(cp1X2,cp1Y2,cp2X2,cp2Y2,endX2,endY2);
      }
    });
    }
    else if(i != ship.points.length - 1){
    context.lineTo(canvasX + ship.points[i].x, canvasY + ship.points[i].y);
    ship.damages.filter(damage =>damage.surface == i,).sort((a,b) =>{
      if(Math.abs((a.point.x - ship.points[i].x) * (a.point.y - ship.points[i].y)) < Math.abs((b.point.x - ship.points[i].x) * (b.point.y - ship.points[i].y))){
        return -1;
      }
      return 1;
    }).forEach(damage =>{
      var startX = canvasX + damage.point.x - 10 * surface.x;
      var startY = canvasY + damage.point.y - 10 * surface.y;
      var endX = canvasX + damage.point.x - 10 * perp.x;
      var endY = canvasY + damage.point.y - 10 * perp.y;
      var cp1X = startX - perp.x * 10 * .552;
      var cp1Y = startY - perp.y * 10 * .552;
      var cp2X = endX - surface.x * 10 * .552;
      var cp2Y = endY - surface.y * 10 * .552;
      if(damage.health == 0){
        context.lineTo(startX, startY);
        context.bezierCurveTo(cp1X,cp1Y,cp2X,cp2Y,endX,endY);
      }
      
      var startX2 = endX;
      var startY2 = endY;
      var endX2 = canvasX + damage.point.x + 10 * surface.x;
      var endY2 = canvasY + damage.point.y + 10 * surface.y;
      var cp1X2 = startX2 + surface.x * 10 * .552;
      var cp1Y2 = startY2 + surface.y * 10 * .552;
      var cp2X2 = endX2 - perp.x * 10 * .552;
      var cp2Y2 = endY2 - perp.y * 10 * .552;
      if(damage.health > 0){
        damageCurves.push({start : new Vector(startX,startY), curve1 : [cp1X,cp1Y,cp2X,cp2Y,endX,endY], curve2 : [cp1X2,cp1Y2,cp2X2,cp2Y2,endX2,endY2], health : damage.health});
      }
      else{
        context.bezierCurveTo(cp1X2,cp1Y2,cp2X2,cp2Y2,endX2,endY2);
      }
    });
    }
    if(i == ship.points.length - 1){
      context.lineTo(canvasX + ship.points[i].x, canvasY + ship.points[i].y);
      ship.damages.filter(damage =>damage.surface == i,).sort((a,b) =>{
        if(Math.abs((a.point.x - ship.points[i].x) * (a.point.y - ship.points[i].y)) < Math.abs((b.point.x - ship.points[i].x) * (b.point.y - ship.points[i].y))){
          return -1;
        }
        return 1;
      }).forEach(damage =>{
      var startX = canvasX + damage.point.x - 10 * surface.x;
      var startY = canvasY + damage.point.y - 10 * surface.y;
      var endX = canvasX + damage.point.x - 10 * perp.x;
      var endY = canvasY + damage.point.y - 10 * perp.y;
      var cp1X = startX - perp.x * 10 * .552;
      var cp1Y = startY - perp.y * 10 * .552;
      var cp2X = endX - surface.x * 10 * .552;
      var cp2Y = endY - surface.y * 10 * .552;
      if(damage.health == 0){
        context.lineTo(startX, startY);
        context.bezierCurveTo(cp1X,cp1Y,cp2X,cp2Y,endX,endY);
      }
      
      var startX2 = endX;
      var startY2 = endY;
      var endX2 = canvasX + damage.point.x + 10 * surface.x;
      var endY2 = canvasY + damage.point.y + 10 * surface.y;
      var cp1X2 = startX2 + surface.x * 10 * .552;
      var cp1Y2 = startY2 + surface.y * 10 * .552;
      var cp2X2 = endX2 - perp.x * 10 * .552;
      var cp2Y2 = endY2 - perp.y * 10 * .552;
      if(damage.health > 0){
        damageCurves.push({start : new Vector(startX,startY), curve1 : [cp1X,cp1Y,cp2X,cp2Y,endX,endY], curve2 : [cp1X2,cp1Y2,cp2X2,cp2Y2,endX2,endY2], health : damage.health});
      }
      else{
        context.bezierCurveTo(cp1X2,cp1Y2,cp2X2,cp2Y2,endX2,endY2);
      }        
      });
      context.lineTo(canvasX + ship.points[0].x, canvasY + ship.points[0].y);
    }
  }
  context.closePath();
  context.fillStyle = '#52300d';
  context.fill();
  damageCurves.forEach(curve =>{
    context.beginPath();
    context.moveTo(curve.start.x, curve.start.y);
    context.bezierCurveTo(curve.curve1[0],curve.curve1[1],curve.curve1[2],curve.curve1[3],curve.curve1[4],curve.curve1[5]);
    context.bezierCurveTo(curve.curve2[0],curve.curve2[1],curve.curve2[2],curve.curve2[3],curve.curve2[4],curve.curve2[5]);
    context.lineTo(curve.start.x,curve.start.y);
    context.closePath();
    context.globalAlpha = 1 - (curve.health/300);
    context.fillStyle = 'red';
    context.fill();
  });
  context.globalAlpha = 1;
}

function drawCannonWire(points,me,x,y){
  var canvasX = canvas.width / 2 + x - me.eyesX;
  var canvasY = canvas.height / 2 + y - me.eyesY;
  context.restore();
  var o;
  context.beginPath();
  for(var i = 0; i<points.length; i++){
    o = i + 1;
    if(o == points.length){
      o = 0;
    }
    if(i == 0){
    context.moveTo(canvasX + points[i].x, canvasY + points[i].y);
    }
    else{
    context.lineTo(canvasX + points[i].x, canvasY + points[i].y);
    }
    if(i == points.length - 1){
      context.lineTo(canvasX + points[0].x, canvasY + points[0].y);
    }
  }
  context.closePath();
  context.stroke();
}
// Renders a player at the given coordinates

function drawTrapDoor(block, me){
  var canvasX = canvas.width / 2 + block.x - me.eyesX;
  var canvasY = canvas.height / 2 + block.y - me.eyesY;
  context.restore();
  var o;
  context.beginPath();
  for(var i = 0; i<block.points.length; i++){
    o = i + 1;
    if(o == block.points.length){
      o = 0;
    }
    if(i != 3){
      if(!(i == 1 && (block.isClosed || block.isOpen))){
        context.moveTo(canvasX + block.points[i].x, canvasY + block.points[i].y);
        context.lineTo(canvasX + block.points[o].x, canvasY + block.points[o].y);
      }
    }
  }
  context.stroke();
}

function drawShipParts(ship,player){ 
    context.strokeStyle = 'black';
    drawCannonWire(ship.cannonWire1, player, ship.x, ship.y);
    context.restore();
  
      context.strokeStyle = 'black';
      context.lineWidth = .5;
      //draw cannon1
      var canvasX = canvas.width / 2 + ship.cannon1.x - player.eyesX;
      var canvasY = canvas.height / 2 + ship.cannon1.y - player.eyesY;
      context.beginPath();
      context.arc(canvasX, canvasY, 10, 0, (2*Constants.PI/5) * ship.cannon1.ammo);
      context.fill();
      drawPoly(ship.cannon1,player);
      context.fillStyle = "rgb("+(ship.cannon1.loadTimer*18).toString()+", 10, 10)";
      context.fill();
      context.fillStyle = 'black';
      
      //drawLowerCannon1
      var canvasX = canvas.width / 2 + ship.cannonLower1.x - player.eyesX;
      var canvasY = canvas.height / 2 + ship.cannonLower1.y - player.eyesY;
      context.beginPath();
      context.arc(canvasX, canvasY, 10, 0, (2*Constants.PI/5) * ship.cannonLower1.ammo);
      context.fill();
      drawPoly(ship.cannonLower1,player);
      context.fillStyle = "rgb("+(ship.cannonLower1.loadTimer*18).toString()+", 10, 10)";
      context.fill();
      context.fillStyle = 'black';
  
      //drawLowerCannon2
      var canvasX = canvas.width / 2 + ship.cannonLower2.x - player.eyesX;
      var canvasY = canvas.height / 2 + ship.cannonLower2.y - player.eyesY;
      context.beginPath();
      context.arc(canvasX, canvasY, 10, 0, (2*Constants.PI/5) * ship.cannonLower2.ammo);
      context.fill();
      drawPoly(ship.cannonLower2,player);
      context.fillStyle = "rgb("+(ship.cannonLower2.loadTimer*18).toString()+", 10, 10)";
      context.fill();
      context.fillStyle = 'black';
  
      //draw ladder, mast, flag, and trap door
      drawTrapDoor(ship.trapDoor,player);
      drawPoly(ship.ladder,player);
      drawPoly(ship.mast,player);
      context.fillStyle = '#4d0f20';
      context.fill();
      context.fillStyle = 'black';
      drawPoly(ship.flag,player);
      context.fillStyle = ship.flag.color;
      context.fill();
      context.fillStyle = 'black';
      drawPoly(ship.platform,player);
  
      //draw flag Text
      context.font = "16px papyrus";
      context.save();
      context.translate(canvas.width/2 - player.eyesX + ship.x + ship.flag.namePointX,canvas.height/2 - player.eyesY + ship.y + ship.flag.namePointY);
      context.rotate(ship.direction);
      context.fillText(ship.flag.name,0,0);
      context.restore();

      //draw Telescope
      var canvasX = canvas.width / 2 + ship.telescope.x - player.eyesX;
      var canvasY = canvas.height / 2 + ship.telescope.y - player.eyesY;
      context.beginPath();
      context.arc(canvasX, canvasY, 5, 0, 2*Constants.PI);
      context.fill();
      drawPoly(ship.telescope,player);



  
      //draw button
      /*
      var canvasX = canvas.width / 2 + ship.x + ship.button.x - player.eyes.x;
      var canvasY = canvas.height / 2 + ship.y + ship.button.y - player.eyes.y;
      context.beginPath();
      context.arc(canvasX, canvasY, ship.buttonRadius, 0, 2*Constants.PI);
      context.fill();
      */
}


function drawCannonBall(cannonBall,player){
    var canvasX = canvas.width / 2 + cannonBall.x - player.eyesX;
    var canvasY = canvas.height / 2 + cannonBall.y - player.eyesY;
    context.beginPath();
    context.arc(canvasX, canvasY, 10, 0, 2*Constants.PI);
    context.fill();
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);
}

// Note: you should use requestAnimationFrame() here instead. setInterval works fine,
// but requestAnimationFrame() is specifically made for render loops like this.
let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(render, 1000 / 60);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(renderMainMenu, 1000 / 60);
}
