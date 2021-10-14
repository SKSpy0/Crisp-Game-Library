title = "Tele-Split";

description = `
 [Click] Move
`;

characters = [];

const G = {
	WIDTH: 100,
	HEIGHT: 200,
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isReplayEnabled: true,
	seed: 12,
	theme: "shape",
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
let teleport;

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
	}

	//UPDATE LOOP
	
	//player look
	color("blue");
	box(player.pos, 4);

	//teleport look and follow mouse
	color("light_black");
	box(teleport.pos, 4);
	teleport.pos = vec(input.pos.x, input.pos.y);
}
