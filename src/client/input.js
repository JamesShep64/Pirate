// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import {updateClick,updatePress,updateRelease } from './networking';


function handlePress(key) {
  updatePress(key);
}
function handleRelease(key){
  updateRelease(key);
}
function handleClick(x, y){
  updateClick(x, y);
}
export function startCapturingInput() {
  window.addEventListener('keypress',e=>{
    handlePress(e.key);
  });

  window.addEventListener("keyup",e =>{
    handleRelease(e.key);
  })

  window.addEventListener('click', e => {
    console.log(e.screenX, e.screenY);
    handleClick(e.clientX, e.clientY);
  });
  

}

export function stopCapturingInput() {
 window.removeEventListener('keypress');
}
