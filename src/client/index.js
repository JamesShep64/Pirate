// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, play,createLobby,joinCrew } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';
import {getCreator,getID} from './lobby';

// I'm using a tiny subset of Bootstrap here for convenience - there's some wasted CSS,
// but not much. In general, you should be careful using Bootstrap because it makes it
// easy to unnecessarily bloat your site.
import './css/bootstrap-reboot.css';
import './css/main.css';

const usernameMenu = document.getElementById('username-menu');
const playMenu = document.getElementById('play-menu');
const lobbyButton = document.getElementById('lobby-button');
const playButton = document.getElementById('play-button')
const copyButton = document.getElementById('copy-button');
const usernameInput = document.getElementById('username-input');
const lobbyCreator = document.getElementById('lobby-creator');

var joinedLobby = false;
Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  usernameMenu.classList.remove('hidden');
  usernameInput.focus();
  lobbyButton.onclick = () => {
    if(!joinedLobby){
      createLobby(usernameInput.value);
    }
    else{
      joinCrew(usernameInput.value);
      playButton.classList.add('hidden');
    }
      playMenu.classList.remove('hidden');
      usernameMenu.classList.add('hidden');
    }

  copyButton.onclick = () =>{
    navigator.clipboard.writeText(window.location.href.toString()+getID());
  };

  playButton.onclick = () => {
    // Play!
    play();
  };

}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
}

export function joinLobby(update){
  lobbyCreator.classList.remove('hidden');
  lobbyCreator.innerHTML = 'you are in '+update.creator+'\'s lobby'; 
  joinedLobby = true;
}

export function creatorJoined(){
  playMenu.classList.add('hidden');
  initState();
  startCapturingInput();
  startRendering();
}
