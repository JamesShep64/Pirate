module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,
  BLOCK_SIZE: 15,
  SCORE_PER_SECOND: 1,
  PLAYER_SIZE: 25,
  PI : 3.14,
  VELOCITY_MULTIPLIER: 2.5,
  MAP_SIZE: 3000,
  MAP_HEIGHT : 3000,
  MAP_WIDTH : 6000,

  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    PRESS : 'press',
    RELEASE : 'release',
    GAME_OVER: 'dead',
    CLICK: 'click',
    CREATE_LOBBY: 'create_lobby',
    LOBBY_UPDATE: 'lobby_update',
    JOINED_LOBBY: 'joined_lobby',
    JOINED_CREW : 'joined_crew',
    CREATOR_JOINED_GAME : 'creator_joined_game',
    
  },
});
