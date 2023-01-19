// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import constants, { PLAYER_SIZE } from '../shared/constants';
import { getAsset } from './assets';
import { getCurrentState } from './state';

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
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
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

  //draw ship hulls
  
  ships.forEach(ship =>{
    drawPoly(ship,me);
    context.fillStyle = '#52300d';
    context.fill();
    context.fillStyle = 'black';
  });


  //draw ship damage
  ships.forEach(ship =>{  
    drawShipDamage(ship,me);
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
  if(!me.dead)
    drawPoly(me,me);
  //draw others
  others.filter(player => !player.dead,).forEach(player => drawPoly(player,me));

  //draw blocks
  blocks.forEach(block => drawPoly(block,me));

  //draw planets
  planets.forEach(planet => drawPoly(planet,me));
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
  
    //draw graple
  /*
  if(ship.grapple){
      const endX = canvas.width / 2 + ship.grapple.pos.x - player.pos.x;
      const endY = canvas.height / 2 + ship.grapple.pos.y - player.pos.y;
      const startX = canvas.width / 2 + ship.grapple.cannon.pos.x - player.pos.x;
      const startY = canvas.height / 2 + ship.grapple.cannon.pos.y - player.pos.y;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX,endY);
      context.stroke();
      context.beginPath();
    }
    */
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
  
      //draw ladder, mast, and trap door
      drawTrapDoor(ship.trapDoor,player);
      drawPoly(ship.ladder,player);
      drawPoly(ship.mast,player);
      context.fillStyle = '#4d0f20';
      context.fill();
      context.fillStyle = 'black';
      drawPoly(ship.platform,player);
  
      //draw Telescope
      var canvasX = canvas.width / 2 + ship.telescope.x - player.eyesX;
      var canvasY = canvas.height / 2 + ship.telescope.y - player.eyesY;
      context.beginPath();
      context.arc(canvasX, canvasY, ship.telescope.radius, 0, 2*Constants.PI);
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

function drawShipDamage(ship,player){
  for(var i = 0; i < ship.damages.length; i++){
    var canvasX = canvas.width / 2 + ship.x + ship.damages[i].x - player.eyesX;
    var canvasY = canvas.height / 2 + ship.y + ship.damages[i].y - player.eyesY;
    context.beginPath();
    context.arc(canvasX, canvasY, 10, 0, 2*Constants.PI);
    context.fillStyle = '#34cceb';
    context.fill();
    context.fillStyle = 'black';
  }
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
