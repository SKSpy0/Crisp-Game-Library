title = "SPORTS BALL";

description = `
down...


seeeeeet...
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

  PLAYER_MAX_SPEED: .5,

  ENEMY_MIN_BASE_SPEED: .5,
  ENEMY_MAX_BASE_SPEED: 1.0,

  PLAYER_ROLL_RATE: 10
}

options = {
  theme: "shape",
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 2,
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
  color("green")
  rect(0, 0, 10, 150);
  rect(142, 0, 10, 150);
  // init
  if (!ticks) {
    field = times(20, () => {
      const posX = 11;
      const posY = rnd(0, G.HEIGHT);
      return {
        pos: vec(posX, posY),
        speed: G.FIELD_SPEED
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      playerSpeed: G.PLAYER_MAX_SPEED,
      switchDirection: false
    };

    enemies = [];

    waveCount = 0;
  }

  if (enemies.length === 0) {
    currentEnemySpeed = 
      rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED);
    for (let i = 0; i < 9; i++) {
      const posX = rnd(15, G.WIDTH - 15);
      const posY = -rnd(i * G.HEIGHT * 0.2);
      enemies.push({
        pos: vec(posX, posY),
        angle: 0,
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

  color("black");
  char("a", player.pos);

  player.pos.clamp(10, G.WIDTH - 10, 0, G.HEIGHT);
  
  // Update player position
  if (input.isPressed) {
    player.pos.x -= G.PLAYER_MAX_SPEED;
    if (player.switchDirection) {
      player.pos.x += G.PLAYER_MAX_SPEED;
    }
    // player.pos = vec(input.pos.x, input.pos.y);
    // let destination = vec(input.pos.x, input.pos.y);
    // player.angle = player.pos.angleTo(destination);
    // while (player.pos.x != input.pos.x && player.pos.y != input.pos.y) {
    //   play("coin")
    // }
  } else {
    player.pos.x += G.PLAYER_MAX_SPEED;
    if (player.switchDirection) {
      player.pos.x -= G.PLAYER_MAX_SPEED;
    }
  }

  remove(enemies, (e) => {
    e.pos.y += currentEnemySpeed;

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
}
