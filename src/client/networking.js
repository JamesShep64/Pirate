import { throttle } from 'throttle-debounce';
import { processGameUpdate,processLobbyUpdate } from './state';
import { joinLobby,creatorJoined } from '.';
import Constants from '../shared/constants';
const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
   const address =socketProtocol+`://${window.location.host}`

   const ws = new WebSocket(address);

   const connectedPromise = new Promise(resolve => {
    ws.addEventListener('open', () => {
      resolve();
    });
  });
  
  export const connect = onGameOver => (
    connectedPromise.then(() => {
      // Register callbacks
      ws.onmessage = m =>{
        var e = JSON.parse(m.data);

        if(e.message == Constants.MSG_TYPES.LOBBY_UPDATE){
          processLobbyUpdate(e.update);
        }

        if(e.message == Constants.MSG_TYPES.GAME_UPDATE){
          processGameUpdate(e.update);
        }

        if(e.message == Constants.MSG_TYPES.CREATOR_JOINED_GAME){
          creatorJoined();
        }

        if(e.message == Constants.MSG_TYPES.JOINED_LOBBY){
          joinLobby(e.update);
        }

        if(e.message == Constants.MSG_TYPES.CREATOR_LEFT_GAME){
          disconnect();
          console.log('CREATOR LEFT GAME');
        }

        if(e.message == Constants.MSG_TYPES.GAME_OVER){
          onGameOver();
        }        
      }
      ws.addEventListener('closed', () => {
        console.log('disconnected');
        disconnect();
      });
    })
  );

export const play = username => {
  ws.send(JSON.stringify({message:Constants.MSG_TYPES.JOIN_GAME,username}));
};

export const disconnect = () =>{
  console.log('Disconnected from server.');
  document.getElementById('disconnect-modal').classList.remove('hidden');
  document.getElementById('reconnect-button').onclick = () => {
  window.location.reload();
  };
};

export const createLobby = (username) =>{
  ws.send(JSON.stringify({message : Constants.MSG_TYPES.CREATE_LOBBY, username}));
};

export const joinCrew = (username) =>{
  ws.send(JSON.stringify({message : Constants.MSG_TYPES.JOINED_CREW,username}));
};
export const updatePress = throttle(20, key => {
  ws.send(JSON.stringify({message : Constants.MSG_TYPES.PRESS, key}));
});

export const updateRelease = throttle(20, key => {
  ws.send(JSON.stringify({message : Constants.MSG_TYPES.RELEASE, key}));
});

export const updateClick = throttle(20, (x, y) => {
  ws.send(Constants.MSG_TYPES.CLICK, {x,y, canvasWidth: canvas.width, canvasHeight: canvas.height});
});

const IDs = [];
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if(IDs.indexOf(result) != -1){
      generateString(length);
    }
    IDs.push(result);
    return result;
}