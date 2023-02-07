// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state
import { updateLeaderboard } from './leaderboard';
import { updateLobbyBoard } from './lobby';

// The "current" state will always be RENDER_DELAY ms behind server time.
// This makes gameplay smoother and lag less noticeable.
const RENDER_DELAY = 100;

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
  gameStart = 0;
  firstServerTimestamp = 0;
}
export function processLobbyUpdate(update){
  updateLobbyBoard(update);
}
export function processGameUpdate(update) {
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.t;
    gameStart = Date.now();
  }
  gameUpdates.push(update);

  updateLeaderboard(update.leaderboard);

  // Keep only one game update before the current server time
  const base = getBaseUpdate();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
}

function currentServerTime() {
  return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1; i >= 0; i--) {
    if (gameUpdates[i].t <= serverTime) {
      return i;
    }
  }
  return -1;
}

// Returns { me, others, bullets }
export function getCurrentState() {
  if (!firstServerTimestamp) {
    return {};
  }

  const base = getBaseUpdate();
  const serverTime = currentServerTime();

  // If base is the most recent update we have, use its state.
  // Otherwise, interpolate between its state and the state of (base + 1).
  if (base < 0 || base === gameUpdates.length - 1) {
    return gameUpdates[gameUpdates.length - 1];
  } else {
    const baseUpdate = gameUpdates[base];
    const next = gameUpdates[base + 1];
    const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
    return {
      me: interpolateObject(baseUpdate.me,next.me,ratio),
      others: interpolateObjectArray(baseUpdate.others,next.others,ratio),
      blocks: interpolateObjectArray(baseUpdate.blocks,next.blocks,ratio),
      ships: interpolateShips(baseUpdate.ships,next.ships,ratio),
      cannonBalls : interpolateObjectArray(baseUpdate.cannonBalls,next.cannonBalls,ratio),
      grapples : interpolateObjectArray(baseUpdate.grapples,next.grapples,ratio),
      explosions : interpolateObjectArray(baseUpdate.explosions,next.explosions,ratio),
      planets : baseUpdate.planets,
      asteroids : interpolateObjectArray(baseUpdate.asteroids,next.asteroids,ratio),
    };
  }
}

function interpolateObject(object1, object2, ratio) {
  if (!object2) {
    return object1;
  }

  const interpolated = {};
  Object.keys(object1).forEach(key => {
    if (key === 'x' || key === 'y' || key == 'eyesX' || key == 'eyesY' || key =='xEnd' || key == 'yEnd' || key =='timer'){
      interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
    }
    else if(key == 'points'){
      interpolated[key] = object1[key];
      for(var i = 0; i<object1[key].length;i++){
        interpolated[key][i].x = object1[key][i].x + (object2[key][i].x - object1[key][i].x) * ratio;
        interpolated[key][i].y = object1[key][i].y + (object2[key][i].y - object1[key][i].y) * ratio;
      }
    }
    else{
      interpolated[key] = object1[key];
    }
  });
  return interpolated;
}

function interpolateShip(object1, object2, ratio){
  if (!object2) {
    return object1;
  }

  const interpolated = {};

  Object.keys(object1).forEach(key =>{
    if (key === 'x' || key === 'y' || key == 'direction'){
      interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
    }
    
    else if(key == 'cannonWire1'){
      interpolated[key] = object1[key];
      for(var i = 0; i<object1[key].length;i++){
        interpolated[key][i].x = object1[key][i].x + (object2[key][i].x - object1[key][i].x) * ratio;
        interpolated[key][i].y = object1[key][i].y + (object2[key][i].y - object1[key][i].y) * ratio;
      }
    }
    
    
    else if(key == 'points'){
      interpolated[key] = object1[key];
      for(var i = 0; i<object1[key].length;i++){
        interpolated[key][i].x = object1[key][i].x + (object2[key][i].x - object1[key][i].x) * ratio;
        interpolated[key][i].y = object1[key][i].y + (object2[key][i].y - object1[key][i].y) * ratio;
      }
    }
    else if(key == 'cannon1'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;
    }
    else if(key == 'cannonLower1'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;

    }
    else if(key == 'cannonLower2'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;

    }
    else if(key == 'ladder'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;
      for(var i = 0; i<object1[key]['points'].length;i++){
        interpolated[key]['points'][i].x = object1[key]['points'][i].x + (object2[key]['points'][i].x - object1[key]['points'][i].x) * ratio;
        interpolated[key]['points'][i].y = object1[key]['points'][i].y + (object2[key]['points'][i].y - object1[key]['points'][i].y) * ratio;
      }

    }
    else if(key == 'mast'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;
      for(var i = 0; i<object1[key]['points'].length;i++){
        interpolated[key]['points'][i].x = object1[key]['points'][i].x + (object2[key]['points'][i].x - object1[key]['points'][i].x) * ratio;
        interpolated[key]['points'][i].y = object1[key]['points'][i].y + (object2[key]['points'][i].y - object1[key]['points'][i].y) * ratio;
      }
    }
    else if(key == 'platform'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;
      for(var i = 0; i<object1[key]['points'].length;i++){
        interpolated[key]['points'][i].x = object1[key]['points'][i].x + (object2[key]['points'][i].x - object1[key]['points'][i].x) * ratio;
        interpolated[key]['points'][i].y = object1[key]['points'][i].y + (object2[key]['points'][i].y - object1[key]['points'][i].y) * ratio;
      }
    }
    else if(key == 'flag'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;
      for(var i = 0; i<object1[key]['points'].length;i++){
        interpolated[key]['points'][i].x = object1[key]['points'][i].x + (object2[key]['points'][i].x - object1[key]['points'][i].x) * ratio;
        interpolated[key]['points'][i].y = object1[key]['points'][i].y + (object2[key]['points'][i].y - object1[key]['points'][i].y) * ratio;
      }
    }
    else if(key == 'telescope'){
      interpolated[key] = object1[key];
      interpolated[key]['x'] = object1[key]['x'] + (object2[key]['x'] - object1[key]['x']) * ratio;
      interpolated[key]['y'] = object1[key]['y'] + (object2[key]['y'] - object1[key]['y']) * ratio;
    }
    else{
      interpolated[key] = object1[key];
    }
  });
  return interpolated;
}

function interpolateShips(objects1, objects2, ratio){
  return objects1.map(o => interpolateShip(o, objects2.find(o2 => o.id === o2.id), ratio));
}

function interpolateObjectArray(objects1, objects2, ratio) {
  return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
}


