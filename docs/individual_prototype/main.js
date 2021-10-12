title = "Prototype";

description = `
 Save the buddy!
 [Mouse]
 Move the Blocker
 [Click]
 Swap
`;

characters = [
`
cccccc
cc c c
cc c c
cccccc
 c  c
 c  c
`,`
cccccc
cc c c
cc c c
cccccc
cc  cc
`,`
bbbbbb
`,`
bbbbbb
`,`
b
b
b
b
b
`,`
b
b
b
b
b
`,
];

const G = {
	WIDTH: 100,
	HEIGHT: 100,
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isReplayEnabled: true,
	seed: 12,
};

/**
 * @typedef {{
 * pos: Vector,
 * alive: boolean
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * bulletCount: number,
 * rotation: number
 * }} Blocker
 */

/**
 * @type { Blocker }
 */
let blocker;

function update() {
	//INITIALIZATION
	if (!ticks) {
		//player initialization
		player = {
			pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
			alive: true
		};
		//blocker initialization
		blocker = {
			pos: vec(player.pos.x, player.pos.y - 10),
			bulletCount: 0,
			rotation: 0
		}
	}
	//player properties
	color("black");
	char("a", player.pos);

	//blocker properties
	color("black");
	//determines if blocker is above or below
	//up
	if(blocker.rotation == 0){
		char("c", vec(blocker.pos.x - 3, blocker.pos.y));
		char("d", vec(blocker.pos.x + 3, blocker.pos.y));
		blocker.pos = vec(input.pos.x, input.pos.y);
		blocker.pos.clamp(0, G.WIDTH, player.pos.y - 10, player.pos.y - 10);
		if(input.isJustPressed){
			blocker.rotation = 1;
		}
	//right
	} else if(blocker.rotation == 1) {
		char("e", vec(blocker.pos.x, blocker.pos.y - 2));
		char("f", vec(blocker.pos.x, blocker.pos.y + 2));
		blocker.pos = vec(input.pos.x, input.pos.y);
		blocker.pos.clamp(player.pos.x + 10, player.pos.x + 10, 0, G.HEIGHT);
		if(input.isJustPressed){
			blocker.rotation = 2;
		}
	//down
	} else if(blocker.rotation == 2){
		char("c", vec(blocker.pos.x - 3, blocker.pos.y));
		char("d", vec(blocker.pos.x + 3, blocker.pos.y));
		blocker.pos = vec(input.pos.x, input.pos.y);
		blocker.pos.clamp(0, G.WIDTH, player.pos.y + 10, player.pos.y + 10);
		if(input.isJustPressed){
			blocker.rotation = 3;
		}
	//left
	} else {
		char("e", vec(blocker.pos.x, blocker.pos.y - 2));
		char("f", vec(blocker.pos.x, blocker.pos.y + 2));
		blocker.pos = vec(input.pos.x, input.pos.y);
		blocker.pos.clamp(player.pos.x - 10, player.pos.x - 10, 0, G.HEIGHT);
		if(input.isJustPressed){
			blocker.rotation = 0;
		}
	}
}
