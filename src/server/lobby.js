const Constants = require('../shared/constants')
class Lobby{
    constructor(socket,username){
        this.sockets = {};
        this.crew = {};
        this.creator = username;
        this.id = socket.id;
        this.crew[socket.id] = username;
        this.sockets[socket.id] = socket;
        this.firstUpdate = true;
        this.ship;
        this.colorI = 0;
    }

    addMember(socket){
        if(Object.keys(this.sockets).length < 4){
            this.sockets[socket.id] = socket;
        }
    }

    addCrew(socket,username){
        this.crew[socket.id] = username;
    }

    update(){
        Object.keys(this.sockets).forEach(ID => {
            this.sockets[ID].send(JSON.stringify({message : Constants.MSG_TYPES.LOBBY_UPDATE, update : this.createUpdate()}));
          });
    }
    removeMember(socket){
        if(this.crew[socket.id]){
            delete this.crew[socket.id];
        }
        delete this.sockets[socket.id];
        this.update();
    }
    createUpdate(){
        return {crew : Object.values(this.crew), creator:this.creator,id : this.id}
    }

}
module.exports = Lobby;