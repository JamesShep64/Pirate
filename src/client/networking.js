// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate,processLobbyUpdate } from './state';
import { joinLobby,creatorJoined } from '.';

const canvas = document.getElementById('game-canvas');
const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log(socket.id);
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE,processGameUpdate);
    socket.on(Constants.MSG_TYPES.LOBBY_UPDATE,processLobbyUpdate);
    socket.on(Constants.MSG_TYPES.JOINED_LOBBY,joinLobby);
    socket.on(Constants.MSG_TYPES.CREATOR_JOINED_GAME,creatorJoined);
    socket.on(Constants.MSG_TYPES.CREATOR_LEFT_GAME,disconnect);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('disconnected');
      disconnect();
    });
  })
);
export const play = username => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME);
};

export const disconnect = () =>{
  console.log('Disconnected from server.');
  document.getElementById('disconnect-modal').classList.remove('hidden');
  document.getElementById('reconnect-button').onclick = () => {
    window.location.reload();
  };
};

export const createLobby = (username) =>{
  socket.emit(Constants.MSG_TYPES.CREATE_LOBBY, {socketID : socket.id, username});
};

export const joinCrew = (username) =>{
  socket.emit(Constants.MSG_TYPES.JOINED_CREW,username);
};
export const updatePress = throttle(20, key => {
  socket.emit(Constants.MSG_TYPES.PRESS, key);
});

export const updateRelease = throttle(20, key => {
  socket.emit(Constants.MSG_TYPES.RELEASE, key);
});

export const updateClick = throttle(20, (x, y) => {
  socket.emit(Constants.MSG_TYPES.CLICK, {x,y, canvasWidth: canvas.width, canvasHeight: canvas.height});
});
