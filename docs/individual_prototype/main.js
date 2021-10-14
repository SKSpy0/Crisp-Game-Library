title = "Tele-Split";

description = `
 [Click] Move
 Don't touch Red
`;

characters = [];

const G = {
	WIDTH: 100,
	HEIGHT: 100,

	ENEMY_SPEED: 1.0
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isReplayEnabled: true,
	seed: 12,
	theme: "shapeDark",
};

/**
 * @typedef {{
 * pos: Vector
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} Teleport
 */

/**
 * @type { Player }
 */
let teleport;

/**
 * @typedef {{
 * pos: Vector,
 * angleX: number,
 * angleY: number,
 * delay: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

var numOfEnemyDots;


function update() {
	//INITIALIZATION
	if (!ticks) {
		//creating player
		player = {
			pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5)
		}
		//creating teleport spot
		teleport = {
			pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5)
		}

		//create enemy array
		enemies = [];
	}

	//UPDATE LOOP
	
	//player look
	color("blue");
	box(player.pos, 4);

	//teleport look and follow mouse
	color("light_black");
	box(teleport.pos, 4);
	teleport.pos = vec(input.pos.x, input.pos.y);
	teleport.pos.clamp(1, G.WIDTH-1, 1, G.HEIGHT-1);

	if(input.isJustPressed){
		//teleport player to where clicked
		player.pos = teleport.pos;
		play("powerUp");

		//increase numOfEnemyDots
		numOfEnemyDots = 2;

		//increase score
		addScore(2);
	}


	//spawn new enemies
	if(numOfEnemyDots > 0){
		for(let i = 0; i < 2; i++){
			let offset = 0;
			if(i == 0){
				offset = -4;
			} else {
				offset = 4;
			}
			enemies.push({
				pos: vec(teleport.pos.x + offset, teleport.pos.y),
				angleX: rnd(0, 360),
				angleY: rnd(0, 360),
				delay: ticks
			});
			numOfEnemyDots = 0;
		}
	}

	//handle enemies
	remove(enemies, (e) => {
		e.pos.x += G.ENEMY_SPEED * Math.cos(e.angleX);
		e.pos.y += G.ENEMY_SPEED * Math.sin(e.angleY);
		if(e.pos.x >= G.WIDTH){
			e.angleX -= 180;
		}
		if(e.pos.x <= 0){
			e.angleX += 180;
		}
		if(e.pos.y >= G.HEIGHT){
			e.angleY -= 180;
		}
		if(e.pos.y <= 0){
			e.angleY += 180;
		}

		color("red");
		const isCollidingWithEnemies = box(e.pos, 2).isColliding.rect.red;
		const isCollidingWithPlayer = box(e.pos, 2).isColliding.rect.blue;

		if(isCollidingWithPlayer && ticks >= e.delay + 30){
			play("coin");
			end();
		}

		if(isCollidingWithEnemies){
			color("red");
			particle(e.pos);
			play("explosion");
			addScore(1);
		}

		return(isCollidingWithEnemies);
	});
}
