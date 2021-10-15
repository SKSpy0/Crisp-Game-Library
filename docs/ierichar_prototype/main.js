title = "SPORTS BALL";

description = `
[HOLD] to 

change direction
`;

characters = [
`
 bbbb
 bbbb
BBBBBB
BBBBBB
 bbbb
 l  l
`,  
`
 rrrr
 rYYr
RRRRRR
RYRRYR
 rrrr
 l  l
`,
`
 bbb
 bBBB
 YYY
BBBBB
YbbbY
 b b
`
];

const G = {
  WIDTH: 150,
  HEIGHT: 150,

  FIELD_SPEED: .5,

  PLAYER_MAX_SPEED: .6,

  ENEMY_MIN_BASE_SPEED: .5,

  PLAYER_ROLL_RATE: 10
}

options = {
  theme: "shape",
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 1,
  isPlayingBgm: true,
  isReplayEnabled: true
};

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Field
 */
/**
 * @type { Field [] }
 */
let field;

/**
 * @typedef {{
 * pos: Vector,
 * playerSpeed: number,
 * switchDirection: boolean
 * }} Player
 */
/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * isPassed: boolean
 * }} Enemy
 */
/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @typedef {{
 * pos: Vector
 * }} Referee
 */
/**
 * @type { Referee }
 */
let referee;

/**
 * @type { number }
 */
let waveCount;

function update() {
  // sidelines
  color("green")
  rect(0, 0, 10, 150);
  rect(142, 0, 10, 150);
  // init
  if (!ticks) {
    field = times(22, () => {
      const posX = 11;
      const posY = rnd(0, G.HEIGHT);
      return {
        pos: vec(posX, posY),
        speed: G.FIELD_SPEED
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.75),
      playerSpeed: G.PLAYER_MAX_SPEED,
      switchDirection: false
    };

    enemies = [];

    waveCount = 0;
  }

  if (enemies.length === 0) {
    currentEnemySpeed = G.ENEMY_MIN_BASE_SPEED + waveCount*0.025;
    for (let i = 0; i < 9; i++) {
      const posX = rnd(15, G.WIDTH - 15);
      const posY = -rnd(i * G.HEIGHT * 0.2);
      enemies.push({
        pos: vec(posX, posY),
        angle: 0,
        isPassed: false
      });
    }
    waveCount++;
  }

  // Update for Field
  field.forEach((f) => {
    f.pos.y += f.speed;
    f.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    color("green");
    rect(f.pos, 140, 10);
  });

  // Create player
  color("black");
  char("a", player.pos);
  player.pos.clamp(10, G.WIDTH - 10, 0, G.HEIGHT);
  // Update player position
  if (input.isPressed) {
    if (player.switchDirection == true) {
      console.log("pressed & true")
      player.pos.x += G.PLAYER_MAX_SPEED;
    } else {
      console.log("pressed & false")
      player.pos.x -= G.PLAYER_MAX_SPEED;
    }
  } else {
    if (player.switchDirection == true) {
      console.log("not pressed & true")
      player.pos.x -= G.PLAYER_MAX_SPEED;
    } else {
      console.log("not pressed & false")
      player.pos.x += G.PLAYER_MAX_SPEED;
    }
  }

  if (waveCount % 2 == 0 && !player.switchDirection) {
    player.switchDirection = !player.switchDirection
    let coachText = "GO RIGHT!"
    text(coachText.toString(), 40, 50)
  }
  if (waveCount > 1 && waveCount % 2 == 1 && player.switchDirection) {
    player.switchDirection = !player.switchDirection
    let coachText = "GO LEFT!"
    text(coachText.toString(), 40, 50)
  }

  remove(enemies, (e) => {
    // Update enemy position
    if (player.pos.x >= e.pos.x) {
      e.pos.x += currentEnemySpeed/3;
    } else {
      e.pos.x -= currentEnemySpeed/3;
    }
    e.pos.y += currentEnemySpeed;

    // If enemy is passed, gain points
    if (player.pos.y < e.pos.y && !e.isPassed) {
      play("coin");
      e.isPassed = true;
      addScore(10 * waveCount);
    }

    // Player -> Enemy Collision
    const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
    if (isCollidingWithPlayer) {
      end();
      play("hit");
    }
    return (e.pos.y > G.HEIGHT);
  });

  const isCollidingWithLeftBorder = rect(10, 0, 2, 150).isColliding.char.a;
  const isCollidingWithRightBorder = rect(140, 0, 2, 150).isColliding.char.a;
  if (isCollidingWithLeftBorder || isCollidingWithRightBorder) {
    end();
    play("jump");
  }
  char("c", 5, 75);

  // upper UI
  color("light_red")
  rect(0, 0, 150, 7)
  // lower UI
  color("cyan")
  rect(0, 143, 150, 7)
}
