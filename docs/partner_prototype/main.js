title = "Tele-orb-tation";

description = `
[HOLD] to set angle

[RELEASE] to launch

[CLICK] to teleport
`;

characters = [
`
 bbbb
RRRRRR
RRyRyR
RRRRRR
bbbbbb
 bbbb
`,
`
 ggg
ggggg
ggggg
ggggg
 ggg
`
];

const G = {
	WIDTH: 200,
	HEIGHT: 100,

	GRAVITY: 3,
	THROW_RADIUS: 20,
	BALL_SPEED: .75,

	BUILDING_SPEED_MIN: 0.2,
	BUILDING_SPEED_MID: 0.5,
	BUILDING_SPEED_MAX: 0.75,
};

options = {
	theme: 'crt',
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isCapturing: true,
	isCapturingGameCanvasOnly: true,
	captureCanvasScale: 2,
	isReplayEnabled: true,
	isPlayingBgm: true,
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

/**
* @typedef { object } Building - A decorative floating object in the background
* @property { Vector } pos - The current position of the object
* @property { number } speed - The downwards floating speed of this object
*/
/**
 * @type { Building [] }
 */
 let buildingsFar;
 let buildingsMed;
 let buildingsClose;

 /**
 * @typedef {{
  * pos: Vector
  * }} Environment
  */
 /**
  * @type { Environment [] }
  */
 let environment;

function update() {
	//INITIALIZATION
	if (!ticks) {
		// Create each layer of buildings for
		// Parallax Effect (big words)
		buildingsClose = times(1, () => {
			const posX = rnd(0, G.WIDTH);
			const posY = rnd(G.HEIGHT*.7, G.HEIGHT*.5);
			 return {
			   pos: vec(posX, posY),
			   speed: G.BUILDING_SPEED_MAX
			 }
		  });
		  buildingsMed = times(10, () => {
			const posX = rnd(0, G.WIDTH);
			const posY = rnd(G.HEIGHT*.5, G.HEIGHT*.35);
			 return {
			   pos: vec(posX, posY),
			   speed: G.BUILDING_SPEED_MID
			 }
		  });
		  buildingsFar = times(15, () => {
			const posX = rnd(0, G.WIDTH);
			const posY = rnd(10, G.HEIGHT*.35);
			 return {
			   pos: vec(posX, posY),
			   speed: G.BUILDING_SPEED_MIN
			 }
		  });
		//create player
		player = {
			pos: vec(G.WIDTH * 0.15, G.HEIGHT * .25),
			throwing: false,
			throwDelay: 18000
		}
		// initialize environment array
		environment = [];

		//create ball
		ball = [];

		//initialize throw angle
		throwAngle = 0.25;
		
		//setup up throw logic
		airborne = false;
	}

	//UPDATE LOOP

	if (environment.length === 0) {
		for (let i = 0; i < 1; i++) {
		  const posX = G.WIDTH;
		  const posY = G.HEIGHT*0.25;
		  environment.push({
			pos: vec(posX, posY)
		  });
		}
	}

	// Update for Buildings
	// Each spawner allows for input to
	// control speed of background
	// or any variable for that matter
	buildingsFar.forEach((a) => {
		// if (input.isPressed) {
		//   a.pos.x -= a.speed;
		// }
		a.pos.x -= a.speed;
		a.pos.wrap(0, G.WIDTH - 10, 0, G.HEIGHT);

		color("light_black");
		rect(a.pos, 10, 80);
	});

	buildingsMed.forEach((b) => {
		// if (input.isPressed) {
		//   b.pos.x -= b.speed;
		// }    
		b.pos.x -= b.speed;

		b.pos.wrap(0, G.WIDTH - 10, 0, G.HEIGHT);

		color("light_purple");
		rect(b.pos, 20, 80);
	});

	buildingsClose.forEach((c) => {
		// if (input.isPressed) {
		//   c.pos.x -= c.speed;
		// }
		c.pos.x -= c.speed;
		c.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

		color("purple");
		rect(c.pos, 40, 80);
	});

	//create floor
	color("black");
	rect(0, G.HEIGHT*.825, G.WIDTH * 2, G.HEIGHT * 0.25);
	//player properties
	color("black");
	char("a", player.pos);
	console.log(player.pos.y);

	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT * 0.75);
	player.pos.y += G.GRAVITY;

	if(player.pos.y < (G.HEIGHT * 0.75) - 4){
		airborne = true;
	} else {
		airborne = false;
	}

	//while button pressed, throw line will show to show ball trajectory
	if(input.isPressed && !ballActive && !airborne){
		if(throwAngle >= -1.5){
			throwAngle -= 0.025;
		}
		//create line
		color("black");
		line(player.pos.x + 4, player.pos.y - 4, vec(player.pos.x + 4, player.pos.y - 4).addWithAngle(throwAngle, 20), 2);
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

	remove(environment, (e) => {
		e.pos.x += .1;
		const isCollidingWithPlayer = rect(G.WIDTH + 30, G.HEIGHT*.25, 30, ).isColliding.char.a;
		return (e.pos.x > 0);
	});

	// UI BORDERS
	color("light_blue");
	rect(0, 0, G.WIDTH, 7);
	rect(0, 0, 7, G.HEIGHT);
	rect(0, G.HEIGHT - 7, G.WIDTH, 7);
	rect(G.WIDTH - 7, 0, 7, G.HEIGHT);
	color("black")
	text("TELE-ORB-TATION", vec(G.WIDTH*.2, 3));
}
