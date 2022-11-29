// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import constants, { PLAYER_SIZE } from '../shared/constants';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, MAP_SIZE,BLOCK_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
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
  const { me, others, blocks} = getCurrentState();
  if (!me) {
    return;
  }

  // Draw background
  renderBackground(me.x, me.y);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);



  // Draw all players
  renderPlayer(me, me);
  others.forEach(p => renderPlayer.bind(null, me));
  
  //Draw all blocks
  blocks.forEach(renderBlock.bind(null,me));
}

function renderBackground(x, y) {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// Renders a player at the given coordinates
function renderPlayer(me, player) {
  const {col, x, y,points} = player;
  const canvasX = me.x - canvas.width / 2;
  const canvasY = me.y - canvas.height / 2;

  // Draw ship
  context.save();
  context.translate(x - canvasX, y - canvasY);
  if(col){
    context.strokeStyle = 'blue';
  }
  drawRect(0,0,points);
  context.restore();
}

function renderBlock(me,block){
  const { x, y,points} = block;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  drawRect(0,0,points);
  context.restore();
}
function drawRect(x, y, points){
  context.beginPath();
  context.moveTo(x + points[0].x, y + points[0].y);
  context.lineTo(x + points[1].x, y + points[1].y);
  
  context.moveTo(x + points[1].x, y + points[1].y);
  context.lineTo(x + points[2].x, y + points[2].y);
  
  context.moveTo(x + points[2].x, y + points[2].y);
  context.lineTo(x + points[3].x, y + points[3].y);

  context.moveTo(x + points[3].x, y + points[3].y);
  context.lineTo(x + points[0].x, y + points[0].y);
  context.stroke();
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
