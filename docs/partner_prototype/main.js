title = "Tele-orb-tation";

description = `
`;

characters = [];

const G = {
	WIDTH: 200,
	HEIGHT: 200,

	GRAVITY: 3,
	THROW_RADIUS: 20,
	BALL_SPEED: 1.0,
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isReplayEnabled: true,
	seed: 22,
};

/**
 * @typedef {{
 * pos: Vector,
 * throwing: boolean,
 * throwDelay: number,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * }} Ball
 */

/**
 * @type { Ball [] }
 */
let ball;
let throwAngle;
let ballActive;
let airborne;

function update() {
	//INITIALIZATION
	if (!ticks) {
		//create player
		player = {
			pos: vec(G.WIDTH * 0.1, G.HEIGHT * 0.9),
			throwing: false,
			throwDelay: 18000
		}

		//create ball
		ball = [];

		//initialize throw angle
		throwAngle = 0.25;
		
		//setup up throw logic
		airborne = false;
	}

	//UPDATE LOOP

	//create floor
	color("black");
	box(0, G.WIDTH, G.WIDTH * 2, G.HEIGHT * 0.1);
	//player properties
	color("cyan");
	box(player.pos, 4);
	console.log(player.pos.y);

	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT * 0.9);
	player.pos.y += G.GRAVITY;

	if(player.pos.y < (G.HEIGHT * 0.9) - 4){
		airborne = true;
	} else {
		airborne = false;
	}

	//while button pressed, throw line will show to show ball trajectory
	if(input.isPressed && !ballActive && !airborne){
		if(throwAngle >= -1.5){
			throwAngle -= 0.02;
		}
		//create line
		color("light_black");
		line(player.pos.x + 2, player.pos.y - 2, vec(player.pos.x + 2, player.pos.y - 2).addWithAngle(throwAngle, 20), 2);
	}
	if(input.isJustReleased && !ballActive && !airborne){
		player.throwing = true;
	}

	//spawn new ball when throwing
	if(player.throwing && !ballActive){
		ball.push({
			pos: vec(player.pos.x + 2, player.pos.y - 2)
		});
		ballActive = true;
	}

	//handle balls
	remove(ball, (b) => {
		b.pos.x += G.BALL_SPEED * Math.cos(throwAngle);
		b.pos.y += G.BALL_SPEED * Math.sin(throwAngle);
		throwAngle += 0.01;

		
		color("red");
		const isCollidingWithFloor = box(b.pos, 3).isColliding.rect.black;

		//teleport and destroy
		if(input.isPressed && player.throwing){
			console.log("teleport!");
			player.throwDelay = ticks;
			player.pos = b.pos;
			ballActive = false;
			player.throwing = false;
			throwAngle = 0.25;
			return(player.pos == b.pos);
		}

		//destroy ball if you don't teleport
		if(b.pos.x > G.WIDTH || isCollidingWithFloor){
			ballActive = false;
			player.throwing = false;
		}
		return(b.pos.x > G.WIDTH || isCollidingWithFloor);
	});
}
