title = "Tele-orb-tation";

description = `[HOLD] to set angle

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
 BB
BBBB
BBBB
 BB
`,
`
 r  r
rrrrrr
ryryrr
rrrrrr
 rrrr
`,
`
 yy
y  y
y  y
y  y
y  y
 yy
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

	ENEMY_SPEED: 0.5,
	RING_SPEED: 0.8
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
  * pos: Vector,
  * speed: number
  * }} Enemies
  */
 /**
  * @type { Enemies [] }
  */
 let enemies;

 /**
  * @typedef {{
  * pos: Vector,
  * speed: number
  * }} Bonus
  */
 /**
  * @type { Bonus [] }
  */
 let rings;

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
		// initialize ring array
		rings = [];
		// initialize enemy array
		enemies = [];	

		//create ball
		ball = [];

		//initialize throw angle
		throwAngle = 0.25;
		
		//setup up throw logic
		airborne = false;
	}

	//UPDATE LOOP
	if (enemies.length === 0) {
		let currentEnemySpeed = G.ENEMY_SPEED;
		for (let i = 0; i < 1; i++) {
			const posX = G.WIDTH + 100;
			const posY = rnd(G.HEIGHT*.5, G.HEIGHT*.75);
			enemies.push({
				pos: vec(posX, posY),
				speed: currentEnemySpeed,
			});
		}
	}
	if (rings.length === 0) {
		let currentRingSpeed = rnd(G.ENEMY_SPEED, G.RING_SPEED);
		for (let i = 0; i < 1; i++) {
			const posX = G.WIDTH + 50;
			const posY = rnd(G.HEIGHT*.5, G.HEIGHT*.35);
			rings.push({
				pos:vec(posX, posY),
				speed: currentRingSpeed,
			})
		}
	}

	// Update for Buildings
	// Each spawner allows for input to
	// control speed of background
	// or any variable for that matter
	buildingsFar.forEach((a) => {
		a.pos.x -= a.speed;
		a.pos.wrap(0, G.WIDTH - 10, 0, G.HEIGHT);

		color("light_black");
		rect(a.pos, 10, 80);
	});
	buildingsMed.forEach((b) => {
		b.pos.x -= b.speed;

		b.pos.wrap(0, G.WIDTH - 10, 0, G.HEIGHT);

		color("light_purple");
		rect(b.pos, 20, 80);
	});
	buildingsClose.forEach((c) => {
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

		
		color("blue");
		const isCollidingWithFloor = char("b", b.pos).isColliding.rect.black;

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

	// ring removal for left ring (give illusion of
	// of going through ring)
	remove(rings, (l) => {
		l.pos.x -= l.speed;
		color("black")
		const isCollidingWithPlayer = char("d", l.pos).isColliding.char.a;
		if (isCollidingWithPlayer) {
			play("coin");
			addScore(50, l.pos);
		}
		return (isCollidingWithPlayer || l.pos.x < 0);
	});

	remove(enemies, (d) => {
		d.pos.x -= d.speed;
		d.pos.y += rnd(-d.speed*3, d.speed*3);
		color("black")
		const isCollidingWithPlayer = char("c", d.pos).isColliding.char.a;
		if (isCollidingWithPlayer) {
			play("explosion");
			color("red")
			text("GAME OVER", G.WIDTH*.38, G.HEIGHT*.5)
			end();
		}
		return (isCollidingWithPlayer || d.pos.x < 0);
	});

	// UI BORDERS
	color("light_blue");
	rect(0, 0, G.WIDTH, 7);
	rect(0, 0, 7, G.HEIGHT);
	rect(0, G.HEIGHT - 7, G.WIDTH, 7);
	rect(G.WIDTH - 7, 0, 7, G.HEIGHT);
	color("black")
	text("TELE-ORB-TATION", vec(G.WIDTH*.27, 3));
}
