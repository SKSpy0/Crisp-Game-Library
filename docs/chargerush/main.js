title = "CHARGE RUSH";

description = `
Destroy enemies.
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`,`
rr  rr
rrrrrr
rrpprr
rrrrrr
  rr
  rr
`,`
y  y
yyyyyy
 y  y
yyyyyy
 y  y
`
];

const G = {
	WIDTH: 100,
	HEIGHT: 150,
	STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

	PLAYER_FIRE_RATE: 5,
	PLAYER_GUN_OFFSET: 3,

	FBULLET_SPEED: 5,

	ENEMY_MIN_BASE_SPEED: 1.0,
	ENEMY_MAX_BASE_SPEED: 2.0,
	ENEMY_FIRE_RATE: 45,

	EBULLET_SPEED: 2.0,
	EBULLET_ROTATION_SPD: 0.1
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	seed: 2,
	isPlayingBgm: true,
	theme: "dark"
};

/**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/
	
/**
* @type  { Star [] }
*/
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;

/**
 * @typedef {{
 * pos: Vector
 * firingCooldown:
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
 * }} EBullet
 */

/**
 * @type { EBullet [] }
 */
let eBullets;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;

function update() {
	// INITIALIZATION
	if (!ticks) {
		waveCount = 0;
		//creating 20 instances of stars
		stars = times(20, () => {
			const posX = rnd(0, G.WIDTH);
			const posY = rnd(0, G.HEIGHT);
			return {
				pos: vec(posX, posY),
				speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
			};
		});
		// creating a player object
		player = {
			pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
			firingCooldown: G.PLAYER_FIRE_RATE,
			isFiringLeft: true
		};

		//create "friendly" bullets
		fBullets= [];

		//create enemies
		enemies = [];
		
		//create "enemy" bullets
		eBullets = [];

		//initialize wavecount and enemy speed
		waveCount = 0;
		currentEnemySpeed = 0;
	}

	//UPDATE LOOP

	//spawning enemies
	if(enemies.length == 0){
		currentEnemySpeed = rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
		for(let i = 0; i < 9; i++){
			const posX = rnd(0, G.WIDTH);
			const posY = -rnd(i * G.HEIGHT * 0.1);
			enemies.push({
				pos: vec(posX, posY),
				firingCooldown: G.ENEMY_FIRE_RATE 
			});
		}
		waveCount++;
	}

	//star properties
	stars.forEach((s) => {
		s.pos.y += s.speed;
		s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
		color("light_black");
		box(s.pos, 1);
	});

	//player properties
	//color("cyan");
	color("black");
	//box(player.pos, 4);
	char("a", player.pos);
	//player input (uses mouse)
	player.pos = vec(input.pos.x, input.pos.y);
	//keep player within bounds
	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
	//adjust player cooldown
	player.firingCooldown--;
	//fire next shot when cooldown = 0
	if(player.firingCooldown <= 0){
		//alternate bullet firing
		const offset = (player.isFiringLeft)
			? -G.PLAYER_GUN_OFFSET
			: G.PLAYER_GUN_OFFSET;
		//create a bullet
		fBullets.push({
			pos: vec(player.pos.x + offset, player.pos.y)
		});
		//reset firing cd
		player.firingCooldown = G.PLAYER_FIRE_RATE;
		//switch side of firing gun
		player.isFiringLeft = !player.isFiringLeft;

		color("yellow");
		//generate particle effects
		particle(
			player.pos.x + offset,
			player.pos.y,
			4,
			1,
			-PI/2,
			PI/4
		);
	}
	
	//update and draw each bullet
	fBullets.forEach((fb) => {
		//move bullet upwards
		fb.pos.y -= G.FBULLET_SPEED;

		//draw bullets
		color("yellow");
		box(fb.pos, 2);
	});


	//handle enemies
	remove(enemies, (e) => {
		e.pos.y += currentEnemySpeed;
		e.firingCooldown--;
		if(e.firingCooldown <= 0) {
			eBullets.push({
				pos: vec(e.pos.x, e.pos.y),
				angle: e.pos.angleTo(player.pos),
				rotation: rnd()
			});
			e.firingCooldown = G.ENEMY_FIRE_RATE;
			play("select");
		}

		color("black");
		//collision detection
		const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.yellow;

		//collision with player
		const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
		if(isCollidingWithPlayer){
			end();
			play("powerUp");
		}

		//check for small particle explosion
		if(isCollidingWithFBullets) {
			color("yellow");
			particle(e.pos);
			play("explosion");
			addScore(10 * waveCount, e.pos);
		}

		//another way to remove the object
		return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
	});

	//handle enemy bullets
	remove(eBullets, (eb) => {
		eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
		eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
		eb.rotation += G.EBULLET_ROTATION_SPD;

		color("red");
		const isCollidingWithPlayer = char ("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

		if(isCollidingWithPlayer) {
			end();
			play("powerUp");
		}

		const isCollidingWithFBullets = char("c", eb.pos, {rotation: eb.rotation}).isColliding.rect.yellow;
		if(isCollidingWithFBullets) addScore(1, eb.pos);

		return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
	});

	//text(fBullets.length.toString(), 3, 10);
	remove(fBullets, (fb) =>{
		color("yellow");
		const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
		return(isCollidingWithEnemies || fb.pos.y < 0);
	});
}
