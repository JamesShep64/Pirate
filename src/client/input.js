// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import {updateClick,updatePress,updateRelease } from './networking';


function handlePress(key) {
  updatePress(key);
}
function handleRelease(key){
  updateRelease(key);
}

export function startCapturingInput() {
  window.addEventListener('keypress',e=>{
    handlePress(e.key);
  });

  window.addEventListener("keyup",e =>{
    handleRelease(e.key);
  })



}

export function stopCapturingInput() {
 window.removeEventListener('keypress');
}
