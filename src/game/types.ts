/**
 * Super Pixel Bros - Type Definitions
 */

export type PlayerForm = 'small' | 'super' | 'fire';

export type GameStatus = 
  | 'TITLE' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'TRANSITIONING' 
  | 'FLAG_CELEBRATION' 
  | 'GAME_OVER' 
  | 'GAME_WON';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  form: PlayerForm;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isJumping: boolean;
  jumpHoldTimer: number;
  isSkidding: boolean;
  isCrouching: boolean;
  runCycle: number;
  invulnerableTimer: number; // Flash frames after hit
  starTimer: number; // Invincible star duration (in frames, e.g. 600 = 10s)
  transformTimer: number; // Freeze animation during grow/shrink
  transformTargetForm?: PlayerForm;
  dead: boolean;
  deadTimer: number;
}

export type EnemyType = 'goomba' | 'koopa' | 'koopa_shell' | 'piranha' | 'paratroopa';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  alive: boolean;
  state: 'walk' | 'squashed' | 'shell_idle' | 'shell_moving' | 'emerging' | 'hidden' | 'falling';
  animTimer: number;
  despawnTimer?: number;
  color?: 'green' | 'red';
  pipeBaseY?: number; // For piranha plants
  pipeTimer?: number;
}

export type PowerUpType = 'mushroom' | 'flower' | 'star' | '1up' | 'coin';

export interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  state: 'spawning' | 'active' | 'collected';
  spawnProgress: number; // 0 to 1 as it rises out of the block
  collectedTimer?: number;
}

export type BlockType = 
  | 'question' 
  | 'brick' 
  | 'ground' 
  | 'rock' 
  | 'pipe_tl' 
  | 'pipe_tr' 
  | 'pipe_bl' 
  | 'pipe_br' 
  | 'pipe_in_tl' // Warp pipe top
  | 'pipe_in_tr'
  | 'empty' 
  | 'bridge'
  | 'cloud'
  | 'bush';

export interface Block {
  id: number;
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BlockType;
  content?: PowerUpType;
  coinCount?: number;
  bumping: boolean;
  bumpOffset: number;
  isBroken?: boolean;
  destructible?: boolean;
  warpDestination?: { levelIndex: number; targetX: number; targetY: number; isSecret?: boolean };
}

export interface Fireball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lifeTimer: number;
  exploding: boolean;
  explodeTimer: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  rotation?: number;
  vRot?: number;
  text?: string;
}

export interface LevelData {
  index: number;
  worldName: string;
  timeLimit: number;
  theme: 'grassland' | 'underground' | 'sky';
  skyColor: string;
  widthTiles: number;
  heightTiles: number;
  playerStartX: number;
  playerStartY: number;
  flagpoleTileX: number;
  castleTileX: number;
  blocks: {
    x: number;
    y: number;
    type: BlockType;
    content?: PowerUpType;
    coins?: number;
    destructible?: boolean;
    warp?: { levelIndex: number; targetX: number; targetY: number; isSecret?: boolean };
  }[];
  enemies: {
    type: EnemyType;
    x: number;
    y: number;
    color?: 'green' | 'red';
  }[];
  movingPlatforms?: {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    startX: number;
    endX: number;
    speed: number;
  }[];
}

export interface GameStats {
  score: number;
  coins: number;
  lives: number;
  world: string;
  levelIndex: number;
  timeRemaining: number;
  highScore: number;
}

export interface KeyState {
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean; // Also shoots fireball
  down: boolean; // Crouch / enter pipe
}
