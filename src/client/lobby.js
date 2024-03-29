import escape from 'lodash/escape';

const lobbyBoard = document.getElementById('lobby-board');
const rows = document.querySelectorAll('#lobby-board tr');
var creator;
var id;
export function updateLobbyBoard(update) {
  for (let i = 0; i < update.crew.length; i++) {
    rows[i].innerHTML = `<td>${escape(update.crew[i].slice(0, 15))}</td>`;
  }
  for(var i = update.crew.length;i < 4;i++){
    rows[i].innerHTML = `<td></td>`;
  }
  creator = update.creator;
  id = update.id;
}

export function getCreator(){
  return creator;
}

export function getID(){
  return id;
}
