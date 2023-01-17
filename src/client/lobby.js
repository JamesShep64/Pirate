import escape from 'lodash/escape';

const lobbyBoard = document.getElementById('lobby-board');
const rows = document.querySelectorAll('#lobby-board tr');
var creator;
var id;
export function updateLobbyBoard(update) {
  console.log(update.crew);
  for (let i = 0; i < update.crew.length; i++) {
    rows[i].innerHTML = `<td>${escape(update.crew[i].slice(0, 15))}</td>`;
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
