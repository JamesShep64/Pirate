const { BLOCK_SIZE, PLAYER_RADIUS } = require("../shared/constants");

function applyPlayerBlockCollisions(players,blocks) {
    
    for(let i = 0; i<blocks.length; i++){

        for(let j = 0; j<players.length; j++){
            const player = players[j];
            const block = blocks[i];
            const dx = player.x - block.x;
            const dy = player.y - block.y;
               
            
            //check for collision
            if(dx > 0 && dx < BLOCK_SIZE && dy > 0 && dy < BLOCK_SIZE){
                
                //Right collision
                if(dx > BLOCK_SIZE / 2 && (block.x - player.x < block.y - player.y)){
                    player.x_velocity = 0;
                    player.x = block.x + BLOCK_SIZE;
                    console.log("Right colision");
                }
                //Left collision
                if(dx < BLOCK_SIZE / 2 && ((block.x - player.x > block.y - player.y))){
                    player.x_velocity = 0;
                    player.x = block.x;
                    console.log("Left colision");

                }

                 //top collision
                 if(dy < BLOCK_SIZE / 2 && (block.x - player.x < block.y - player.y)){
                    player.y_velocity = 0;
                    player.y = block.y;
                    
                    console.log("Top colision");

                }
                //bottom collision
                if(dy > BLOCK_SIZE / 2 && (block.x - player.x > block.y - player.y)){
                    player.y_velocity = 0;
                    player.y = block.y + BLOCK_SIZE;
                    console.log("Bottom colision");

                }

                //corner collision
            }

            
        }
    }
}

module.exports = applyPlayerBlockCollisions;