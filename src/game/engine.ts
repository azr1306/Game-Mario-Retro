/**
 * Super Pixel Bros - Game Engine & Physics
 * High-performance 60FPS loop, sub-pixel physics, collision handling, and game state logic.
 */

import { sound } from './audio';
import { LEVELS } from './levels';
import { SpriteRenderer, TILE_SIZE } from './sprites';
import {
  Block,
  Enemy,
  Fireball,
  GameStats,
  GameStatus,
  KeyState,
  LevelData,
  Particle,
  Player,
  PlayerForm,
  PowerUp,
} from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public status: GameStatus = 'TITLE';
  public currentLevelIndex: number = 0;
  public currentLevel: LevelData;

  public stats: GameStats = {
    score: 0,
    coins: 0,
    lives: 3,
    world: '1-1',
    levelIndex: 0,
    timeRemaining: 300,
    highScore: 0,
  };

  public player: Player;
  public blocks: Block[] = [];
  public enemies: Enemy[] = [];
  public powerUps: PowerUp[] = [];
  public fireballs: Fireball[] = [];
  public particles: Particle[] = [];

  public cameraX: number = 0;
  public tick: number = 0;

  private flagSlideTimer: number = 0;
  private flagY: number = 3 * TILE_SIZE;
  private castleFlagRaised: boolean = false;
  private timeTickAccumulator: number = 0;

  private keyState: KeyState = {
    left: false,
    right: false,
    jump: false,
    run: false,
    down: false,
  };

  private prevRunKey: boolean = false;
  private prevJumpKey: boolean = false;

  private animFrameId: number | null = null;
  private onStatsChange?: (stats: GameStats, status: GameStatus) => void;

  constructor(canvas: HTMLCanvasElement, onStatsChange?: (stats: GameStats, status: GameStatus) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStatsChange = onStatsChange;

    // Load saved high score
    try {
      const saved = localStorage.getItem('pixel_bros_highscore');
      if (saved) {
        this.stats.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      // localStorage may fail in some iframe sandbox modes
    }

    this.currentLevel = LEVELS[0];
    this.player = this.createDefaultPlayer();
    this.loadLevel(0);
  }

  private createDefaultPlayer(form: PlayerForm = 'small'): Player {
    return {
      x: 40,
      y: 11 * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: 14,
      height: form === 'small' ? 14 : 28,
      form,
      facing: 'right',
      isGrounded: false,
      isJumping: false,
      jumpHoldTimer: 0,
      isSkidding: false,
      isCrouching: false,
      runCycle: 0,
      invulnerableTimer: 0,
      starTimer: 0,
      transformTimer: 0,
      dead: false,
      deadTimer: 0,
    };
  }

  public loadLevel(levelIndex: number, startPosition?: { x: number; y: number }, preservePlayerForm: boolean = true) {
    const lvl = LEVELS[levelIndex] || LEVELS[0];
    this.currentLevelIndex = levelIndex;
    this.currentLevel = lvl;

    this.stats.world = lvl.index === 3 ? 'BONUS' : `1-${lvl.index + 1}`;
    this.stats.levelIndex = lvl.index;
    this.stats.timeRemaining = lvl.timeLimit;
    this.timeTickAccumulator = 0;

    // Spawn Blocks
    this.blocks = lvl.blocks.map((b, idx) => ({
      id: idx + 1,
      gridX: b.x,
      gridY: b.y,
      x: b.x * TILE_SIZE,
      y: b.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: b.type,
      content: b.content,
      coinCount: b.coins || (b.content === 'coin' ? 1 : 0),
      bumping: false,
      bumpOffset: 0,
      destructible: b.destructible,
      warpDestination: b.warp,
    }));

    // Spawn Enemies
    this.enemies = lvl.enemies.map((e, idx) => ({
      id: idx + 1,
      type: e.type,
      x: e.x,
      y: e.y,
      vx: e.type === 'piranha' ? 0 : -0.7,
      vy: 0,
      width: 14,
      height: e.type === 'koopa' || e.type === 'paratroopa' || e.type === 'piranha' ? 22 : 14,
      facing: 'left',
      isGrounded: false,
      alive: true,
      state: e.type === 'piranha' ? 'hidden' : 'walk',
      animTimer: 0,
      color: e.color || 'green',
      pipeBaseY: e.type === 'piranha' ? e.y : undefined,
      pipeTimer: e.type === 'piranha' ? (idx % 2 === 0 ? 0 : 90) : undefined,
    }));

    this.powerUps = [];
    this.fireballs = [];
    this.particles = [];

    const existingForm = preservePlayerForm ? this.player.form : 'small';
    this.player = this.createDefaultPlayer(existingForm);
    this.player.x = startPosition ? startPosition.x : lvl.playerStartX;
    this.player.y = startPosition ? startPosition.y : lvl.playerStartY;

    this.cameraX = Math.max(0, this.player.x - 120);
    this.flagY = 3 * TILE_SIZE;
    this.castleFlagRaised = false;
    this.flagSlideTimer = 0;

    // Play appropriate BGM
    if (this.status === 'PLAYING') {
      if (lvl.theme === 'underground') {
        sound.playBgm('underground');
      } else {
        sound.playBgm('overworld');
      }
    }

    this.notifyStats();
  }

  public startGame() {
    this.stats.score = 0;
    this.stats.coins = 0;
    this.stats.lives = 3;
    this.status = 'PLAYING';
    this.loadLevel(0, undefined, false);
    sound.playBgm('overworld');
    this.notifyStats();
  }

  public restartCurrentLevel() {
    this.status = 'PLAYING';
    this.loadLevel(this.currentLevelIndex);
  }

  public togglePause() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      sound.stopBgm();
    } else if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      if (this.player.starTimer > 0) {
        sound.playBgm('star');
      } else if (this.currentLevel.theme === 'underground') {
        sound.playBgm('underground');
      } else {
        sound.playBgm('overworld');
      }
    }
    this.notifyStats();
  }

  public setKeyState(key: keyof KeyState, pressed: boolean) {
    this.keyState[key] = pressed;
  }

  public startLoop() {
    if (this.animFrameId !== null) return;

    const loop = () => {
      this.update();
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /* ---------------- UPDATE TICK ---------------- */

  private update() {
    this.tick++;

    if (this.status === 'PAUSED' || this.status === 'TITLE') {
      return;
    }

    // Freeze logic during power-up growth / shrink animation
    if (this.player.transformTimer > 0) {
      this.player.transformTimer--;
      if (this.player.transformTimer === 0 && this.player.transformTargetForm) {
        this.setPlayerForm(this.player.transformTargetForm);
      }
      return;
    }

    // Flagpole celebration sequence
    if (this.status === 'FLAG_CELEBRATION') {
      this.updateFlagpoleSequence();
      this.updateParticles();
      return;
    }

    // Dead player death jump animation
    if (this.player.dead) {
      this.player.deadTimer++;
      this.player.vy += 0.3;
      this.player.y += this.player.vy;

      if (this.player.deadTimer > 120) {
        this.stats.lives--;
        if (this.stats.lives <= 0) {
          this.status = 'GAME_OVER';
          sound.playDeath();
        } else {
          this.loadLevel(this.currentLevelIndex, undefined, false);
        }
        this.notifyStats();
      }
      this.updateParticles();
      return;
    }

    // Timer countdown
    this.timeTickAccumulator++;
    if (this.timeTickAccumulator >= 60) {
      this.timeTickAccumulator = 0;
      if (this.stats.timeRemaining > 0) {
        this.stats.timeRemaining--;
        if (this.stats.timeRemaining === 0) {
          this.killPlayer();
        }
        this.notifyStats();
      }
    }

    this.updatePlayer();
    this.updatePowerUps();
    this.updateEnemies();
    this.updateFireballs();
    this.updateBlocks();
    this.updateParticles();
    this.updateMovingPlatforms();

    // Check bottomless pit death
    if (this.player.y > this.canvas.height + 32) {
      this.killPlayer();
    }

    // Smooth Camera Scroll (Never scroll backwards)
    const targetCamX = this.player.x - this.canvas.width * 0.38;
    if (targetCamX > this.cameraX) {
      this.cameraX = Math.min(
        this.currentLevel.widthTiles * TILE_SIZE - this.canvas.width,
        this.cameraX + (targetCamX - this.cameraX) * 0.15
      );
    }

    this.prevRunKey = this.keyState.run;
    this.prevJumpKey = this.keyState.jump;
  }

  /* ---------------- PLAYER PHYSICS & MECHANICS ---------------- */

  private updatePlayer() {
    const p = this.player;

    // Star power timer
    if (p.starTimer > 0) {
      p.starTimer--;
      if (p.starTimer === 0) {
        // Star expired: return to normal BGM
        if (this.currentLevel.theme === 'underground') {
          sound.playBgm('underground');
        } else {
          sound.playBgm('overworld');
        }
      }
    }

    // Invulnerability flashing after hit
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer--;
    }

    // Crouch (only for Super & Fire forms)
    p.isCrouching = this.keyState.down && p.form !== 'small' && p.isGrounded;

    // Horizontal Movement & Momentum
    const maxSpeed = this.keyState.run ? 2.9 : 1.8;
    const accel = p.isGrounded ? 0.12 : 0.08;
    const friction = p.isGrounded ? 0.1 : 0.04;

    if (this.keyState.left && !p.isCrouching) {
      p.facing = 'left';
      if (p.vx > 0.4 && p.isGrounded) {
        p.isSkidding = true;
        p.vx -= friction * 2.2;
      } else {
        p.isSkidding = false;
        p.vx = Math.max(-maxSpeed, p.vx - accel);
      }
    } else if (this.keyState.right && !p.isCrouching) {
      p.facing = 'right';
      if (p.vx < -0.4 && p.isGrounded) {
        p.isSkidding = true;
        p.vx += friction * 2.2;
      } else {
        p.isSkidding = false;
        p.vx = Math.min(maxSpeed, p.vx + accel);
      }
    } else {
      p.isSkidding = false;
      if (p.vx > 0) {
        p.vx = Math.max(0, p.vx - friction);
      } else if (p.vx < 0) {
        p.vx = Math.min(0, p.vx + friction);
      }
    }

    // Run cycle animation
    if (p.isGrounded && Math.abs(p.vx) > 0.1) {
      p.runCycle += Math.abs(p.vx) * 0.18;
    }

    // Jumping Mechanics (Variable Jump Height!)
    if (this.keyState.jump && !this.prevJumpKey && p.isGrounded) {
      // Initial jump impulse
      p.vy = -4.4;
      p.isGrounded = false;
      p.isJumping = true;
      p.jumpHoldTimer = 14; // frames can hold to go higher
      sound.playJump(p.form !== 'small');
    } else if (this.keyState.jump && p.isJumping && p.jumpHoldTimer > 0) {
      // Sustained jump boost
      p.jumpHoldTimer--;
      p.vy -= 0.18;
    } else if (!this.keyState.jump) {
      // Early jump release cuts vertical upward speed
      p.isJumping = false;
      p.jumpHoldTimer = 0;
      if (p.vy < -2.2) {
        p.vy = -2.2;
      }
    }

    // Gravity
    p.vy += 0.32;
    if (p.vy > 7.0) p.vy = 7.0; // Terminal fall velocity

    // Fireball Throwing (X / Shift key with Fire Mario form)
    if (this.keyState.run && !this.prevRunKey && p.form === 'fire' && this.fireballs.length < 2) {
      this.shootFireball();
    }

    // Pipe entry check (Press Down on Warp Pipe)
    if (this.keyState.down && p.isGrounded) {
      this.checkWarpPipeEntry();
    }

    // Sub-pixel movement & Tile Collisions
    this.resolvePlayerTileCollisions();

    // Check Flagpole Collision
    this.checkFlagpoleCollision();
  }

  /** Resolve Player vs Terrain Blocks */
  private resolvePlayerTileCollisions() {
    const p = this.player;

    // Move X first
    p.x += p.vx;
    // Keep player within left level boundary and camera left edge
    if (p.x < this.cameraX) {
      p.x = this.cameraX;
      p.vx = 0;
    }

    for (const b of this.blocks) {
      if (b.isBroken || !this.isSolidBlock(b.type)) continue;

      if (this.checkAABB(p.x, p.y, p.width, p.height, b.x, b.y, b.width, b.height)) {
        if (p.vx > 0) {
          p.x = b.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = b.x + b.width;
          p.vx = 0;
        }
      }
    }

    // Move Y
    p.y += p.vy;
    p.isGrounded = false;

    for (const b of this.blocks) {
      if (b.isBroken || !this.isSolidBlock(b.type)) continue;

      if (this.checkAABB(p.x, p.y, p.width, p.height, b.x, b.y, b.width, b.height)) {
        if (p.vy > 0) {
          // Landing on block top
          p.y = b.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.isJumping = false;
        } else if (p.vy < 0) {
          // Bumping block from below!
          p.y = b.y + b.height;
          p.vy = 0;
          p.isJumping = false;
          this.bumpBlock(b);
        }
      }
    }
  }

  private isSolidBlock(type: Block['type']): boolean {
    return (
      type === 'ground' ||
      type === 'brick' ||
      type === 'question' ||
      type === 'empty' ||
      type === 'rock' ||
      type === 'bridge' ||
      type.startsWith('pipe_')
    );
  }

  /** Head Bump a Block */
  private bumpBlock(b: Block) {
    if (b.bumping || b.type === 'empty') {
      sound.playBump();
      return;
    }

    // Brick Block
    if (b.type === 'brick') {
      if (b.coinCount && b.coinCount > 0) {
        // Multi-coin brick
        b.coinCount--;
        this.addScore(200, b.x, b.y);
        this.addCoin();
        this.spawnCoinPop(b.x + 4, b.y - 12);
        sound.playCoin();
        b.bumping = true;
        b.bumpOffset = 6;
        if (b.coinCount <= 0) {
          b.type = 'empty';
        }
        return;
      }

      if (this.player.form !== 'small' || this.player.starTimer > 0) {
        // Break brick!
        b.isBroken = true;
        sound.playBrickBreak();
        this.addScore(50, b.x, b.y);
        this.spawnBrickDebris(b.x + 8, b.y + 8);
        return;
      } else {
        // Small Mario bumps brick without breaking
        sound.playBump();
        b.bumping = true;
        b.bumpOffset = 6;
      }
    }

    // Question Block [?]
    if (b.type === 'question') {
      b.bumping = true;
      b.bumpOffset = 6;
      b.type = 'empty';

      if (b.content === 'coin') {
        this.addCoin();
        this.addScore(200, b.x, b.y);
        this.spawnCoinPop(b.x + 4, b.y - 12);
        sound.playCoin();
      } else if (b.content) {
        // Spawn Power-Up item (Mushroom, Flower, Star, 1Up)
        this.spawnPowerUp(b.x, b.y - 16, b.content);
        sound.playPowerupSpawn();
      }
    }

    // Check if any enemy is standing on top of bumped block
    for (const e of this.enemies) {
      if (
        e.alive &&
        Math.abs(e.x - b.x) < 14 &&
        Math.abs(e.y + e.height - b.y) < 6
      ) {
        this.defeatEnemy(e, 'bump');
      }
    }
  }

  /** Spawn PowerUp that rises from the block */
  private spawnPowerUp(x: number, y: number, type: PowerUp['type']) {
    // If small Mario hits a flower block, give mushroom first (classic Mario logic!)
    let actualType = type;
    if (type === 'flower' && this.player.form === 'small') {
      actualType = 'mushroom';
    }

    this.powerUps.push({
      id: Date.now() + Math.random(),
      type: actualType,
      x,
      y: y + 16,
      vx: actualType === 'flower' ? 0 : 0.9,
      vy: 0,
      width: 14,
      height: 14,
      isGrounded: false,
      state: 'spawning',
      spawnProgress: 0,
    });
  }

  private updatePowerUps() {
    for (const item of this.powerUps) {
      if (item.state === 'collected') continue;

      if (item.state === 'spawning') {
        item.spawnProgress += 0.05;
        item.y -= 0.8;
        if (item.spawnProgress >= 1) {
          item.state = 'active';
        }
        continue;
      }

      // Physics for active items
      if (item.type !== 'flower') {
        item.vy += 0.3;
        if (item.vy > 6) item.vy = 6;

        // Move X
        item.x += item.vx;
        for (const b of this.blocks) {
          if (b.isBroken || !this.isSolidBlock(b.type)) continue;
          if (this.checkAABB(item.x, item.y, item.width, item.height, b.x, b.y, b.width, b.height)) {
            item.vx = -item.vx; // Reverse on wall impact
            item.x += item.vx * 2;
          }
        }

        // Move Y
        item.y += item.vy;
        item.isGrounded = false;
        for (const b of this.blocks) {
          if (b.isBroken || !this.isSolidBlock(b.type)) continue;
          if (this.checkAABB(item.x, item.y, item.width, item.height, b.x, b.y, b.width, b.height)) {
            if (item.vy > 0) {
              item.y = b.y - item.height;
              item.vy = item.type === 'star' ? -3.8 : 0; // Star bounces!
              item.isGrounded = true;
            }
          }
        }
      }

      // Player Collects Power-Up
      if (this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, item.x, item.y, item.width, item.height)) {
        this.collectPowerUp(item);
      }
    }
  }

  private collectPowerUp(item: PowerUp) {
    item.state = 'collected';
    this.addScore(1000, item.x, item.y);

    if (item.type === 'mushroom') {
      sound.playPowerupCollect();
      if (this.player.form === 'small') {
        this.transformPlayer('super');
      }
    } else if (item.type === 'flower') {
      sound.playPowerupCollect();
      this.transformPlayer('fire');
    } else if (item.type === 'star') {
      sound.playPowerupCollect();
      this.player.starTimer = 720; // 12 seconds of invincibility!
      sound.playBgm('star');
    } else if (item.type === '1up') {
      sound.play1Up();
      this.stats.lives++;
      this.particles.push({
        id: Math.random(),
        x: item.x,
        y: item.y - 10,
        vx: 0,
        vy: -0.8,
        color: '#00E800',
        size: 8,
        life: 50,
        maxLife: 50,
        text: '1-UP',
      });
      this.notifyStats();
    }
  }

  private transformPlayer(newForm: PlayerForm) {
    this.player.transformTimer = 24; // Freeze frame transformation
    this.player.transformTargetForm = newForm;
    this.setPlayerForm(newForm);
  }

  private setPlayerForm(newForm: PlayerForm) {
    const oldHeight = this.player.height;
    this.player.form = newForm;
    this.player.height = newForm === 'small' ? 14 : 28;
    // Adjust Y position so player stays on ground
    this.player.y -= this.player.height - oldHeight;
    this.notifyStats();
  }

  /* ---------------- FIREBALL PROJECTILE ---------------- */

  private shootFireball() {
    sound.playFireball();
    const vx = this.player.facing === 'right' ? 4.2 : -4.2;
    this.fireballs.push({
      id: Date.now() + Math.random(),
      x: this.player.x + (this.player.facing === 'right' ? 14 : -6),
      y: this.player.y + 10,
      vx,
      vy: 1.5,
      radius: 4,
      lifeTimer: 90,
      exploding: false,
      explodeTimer: 0,
    });
  }

  private updateFireballs() {
    for (const fb of this.fireballs) {
      if (fb.exploding) {
        fb.explodeTimer++;
        continue;
      }

      fb.lifeTimer--;
      if (fb.lifeTimer <= 0) {
        fb.exploding = true;
        continue;
      }

      fb.vy += 0.35;
      fb.x += fb.vx;

      // Wall collision
      for (const b of this.blocks) {
        if (b.isBroken || !this.isSolidBlock(b.type)) continue;
        if (this.checkAABB(fb.x - fb.radius, fb.y - fb.radius, fb.radius * 2, fb.radius * 2, b.x, b.y, b.width, b.height)) {
          fb.exploding = true;
          break;
        }
      }

      // Ground bounce
      fb.y += fb.vy;
      for (const b of this.blocks) {
        if (b.isBroken || !this.isSolidBlock(b.type)) continue;
        if (this.checkAABB(fb.x - fb.radius, fb.y - fb.radius, fb.radius * 2, fb.radius * 2, b.x, b.y, b.width, b.height)) {
          if (fb.vy > 0) {
            fb.y = b.y - fb.radius;
            fb.vy = -3.4; // Bounce up!
          }
        }
      }

      // Enemy hit check
      for (const e of this.enemies) {
        if (!e.alive || e.state === 'falling') continue;
        if (this.checkAABB(fb.x - fb.radius, fb.y - fb.radius, fb.radius * 2, fb.radius * 2, e.x, e.y, e.width, e.height)) {
          fb.exploding = true;
          this.defeatEnemy(e, 'fireball');
          break;
        }
      }
    }

    // Clean up expired fireballs
    this.fireballs = this.fireballs.filter((fb) => fb.explodeTimer < 6);
  }

  /* ---------------- ENEMIES & COMBAT ---------------- */

  private updateEnemies() {
    for (const e of this.enemies) {
      if (!e.alive && e.state !== 'squashed' && e.state !== 'falling') continue;

      // Squashed goomba despawn
      if (e.state === 'squashed') {
        e.animTimer++;
        if (e.animTimer > 30) {
          e.alive = false;
        }
        continue;
      }

      // Defeated enemy falling off screen (flipped upside down)
      if (e.state === 'falling') {
        e.vy += 0.3;
        e.y += e.vy;
        e.x += e.vx;
        if (e.y > this.canvas.height + 40) {
          e.alive = false;
        }
        continue;
      }

      // Piranha Plant Logic
      if (e.type === 'piranha') {
        this.updatePiranhaPlant(e);
        continue;
      }

      // Paratroopa winged bounce
      if (e.type === 'paratroopa') {
        if (e.isGrounded) {
          e.vy = -4.5;
          e.isGrounded = false;
        }
      }

      // Gravity
      e.vy += 0.3;
      if (e.vy > 6) e.vy = 6;

      // Horizontal movement
      const moveSpeed = e.state === 'shell_moving' ? 5.5 : 0.7;
      e.x += e.facing === 'left' ? -moveSpeed : moveSpeed;

      // Enemy vs Wall collisions
      for (const b of this.blocks) {
        if (b.isBroken || !this.isSolidBlock(b.type)) continue;

        if (this.checkAABB(e.x, e.y, e.width, e.height, b.x, b.y, b.width, b.height)) {
          if (e.facing === 'left') {
            e.facing = 'right';
            e.x = b.x + b.width;
          } else {
            e.facing = 'left';
            e.x = b.x - e.width;
          }
          if (e.state === 'shell_moving') {
            sound.playBump();
          }
        }
      }

      // Enemy vs Ground collisions
      e.y += e.vy;
      e.isGrounded = false;
      for (const b of this.blocks) {
        if (b.isBroken || !this.isSolidBlock(b.type)) continue;
        if (this.checkAABB(e.x, e.y, e.width, e.height, b.x, b.y, b.width, b.height)) {
          if (e.vy > 0) {
            e.y = b.y - e.height;
            e.vy = 0;
            e.isGrounded = true;
          }
        }
      }

      // Shell moving: smashes into other enemies!
      if (e.state === 'shell_moving') {
        for (const other of this.enemies) {
          if (other.id === e.id || !other.alive || other.state === 'falling') continue;
          if (this.checkAABB(e.x, e.y, e.width, e.height, other.x, other.y, other.width, other.height)) {
            this.defeatEnemy(other, 'shell');
          }
        }
      }

      // Player vs Enemy Collision Check
      if (this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, e.x, e.y, e.width, e.height)) {
        this.handlePlayerEnemyCollision(e);
      }
    }
  }

  private updatePiranhaPlant(e: Enemy) {
    if (!e.pipeBaseY || !e.pipeTimer) {
      e.pipeTimer = 0;
      e.pipeBaseY = e.y;
    }

    e.pipeTimer++;
    const cycle = e.pipeTimer % 180;

    // Don't emerge if player is too close to pipe top
    const distToPlayer = Math.abs(this.player.x - e.x);

    if (cycle < 60) {
      // Emerging up from pipe
      if (distToPlayer > 28) {
        e.y = Math.max(e.pipeBaseY - 24, e.y - 0.8);
      }
    } else if (cycle < 120) {
      // Snapping jaws at peak
    } else {
      // Retracting into pipe
      e.y = Math.min(e.pipeBaseY, e.y + 0.8);
    }

    // Check hit with player
    if (e.y < e.pipeBaseY - 4) {
      if (this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, e.x, e.y, e.width, e.height)) {
        if (this.player.starTimer > 0) {
          this.defeatEnemy(e, 'star');
        } else if (this.player.invulnerableTimer === 0) {
          this.hurtPlayer();
        }
      }
    }
  }

  private handlePlayerEnemyCollision(e: Enemy) {
    const p = this.player;

    // Star power kills everything instantly on touch!
    if (p.starTimer > 0) {
      this.defeatEnemy(e, 'star');
      return;
    }

    // If player is falling onto enemy from above -> STOMP!
    const isFallingOnTop = p.vy > 0 && p.y + p.height - p.vy <= e.y + 8;

    if (isFallingOnTop) {
      // Stomp!
      sound.playStomp();
      p.vy = this.keyState.jump ? -4.8 : -3.2; // Extra bounce height if holding jump!

      if (e.type === 'goomba') {
        e.state = 'squashed';
        e.animTimer = 0;
        this.addScore(100, e.x, e.y);
      } else if (e.type === 'paratroopa') {
        // Clip wings, turns into standard Koopa
        e.type = 'koopa';
        this.addScore(200, e.x, e.y);
      } else if (e.type === 'koopa') {
        // Koopa retreats into shell
        e.state = 'shell_idle';
        e.height = 14;
        this.addScore(100, e.x, e.y);
      } else if (e.state === 'shell_moving') {
        // Stop moving shell
        e.state = 'shell_idle';
        this.addScore(100, e.x, e.y);
      } else if (e.state === 'shell_idle') {
        // Kick stationary shell
        this.kickShell(e);
      }
      return;
    }

    // Stationary Shell can be kicked from side
    if (e.state === 'shell_idle') {
      this.kickShell(e);
      return;
    }

    // Otherwise: Player takes damage!
    if (p.invulnerableTimer === 0) {
      this.hurtPlayer();
    }
  }

  private kickShell(e: Enemy) {
    sound.playKick();
    e.state = 'shell_moving';
    e.facing = this.player.x < e.x ? 'right' : 'left';
    e.x += e.facing === 'right' ? 6 : -6;
    this.addScore(400, e.x, e.y);
  }

  private defeatEnemy(e: Enemy, method: 'stomp' | 'shell' | 'fireball' | 'star' | 'bump') {
    e.alive = false;
    e.state = 'falling';
    e.vy = -3.8;
    e.vx = this.player.facing === 'right' ? 1.5 : -1.5;

    sound.playKick();
    const pts = method === 'star' ? 400 : method === 'fireball' ? 200 : 100;
    this.addScore(pts, e.x, e.y);
  }

  private hurtPlayer() {
    const p = this.player;

    if (p.form === 'fire') {
      sound.playHurt();
      p.invulnerableTimer = 120; // 2 seconds flashing
      this.transformPlayer('super');
    } else if (p.form === 'super') {
      sound.playHurt();
      p.invulnerableTimer = 120;
      this.transformPlayer('small');
    } else {
      this.killPlayer();
    }
  }

  public killPlayer() {
    if (this.player.dead) return;
    this.player.dead = true;
    this.player.deadTimer = 0;
    this.player.vy = -5.5;
    sound.playDeath();
    this.notifyStats();
  }

  /* ---------------- WARP PIPES & SECRETS ---------------- */

  private checkWarpPipeEntry() {
    const p = this.player;
    for (const b of this.blocks) {
      if (b.warpDestination && (b.type === 'pipe_in_tl' || b.type === 'pipe_in_tr')) {
        // Check if player is standing on top of warp pipe mouth
        if (
          p.x + p.width > b.x &&
          p.x < b.x + b.width &&
          Math.abs(p.y + p.height - b.y) < 4
        ) {
          sound.playPipeWarp();
          this.loadLevel(
            b.warpDestination.levelIndex,
            { x: b.warpDestination.targetX, y: b.warpDestination.targetY }
          );
          return;
        }
      }
    }
  }

  /* ---------------- FLAGPOLE & LEVEL CLEAR ---------------- */

  private checkFlagpoleCollision() {
    const p = this.player;
    const flagTileX = this.currentLevel.flagpoleTileX;
    if (flagTileX === 999) return; // No flagpole in bonus rooms

    const flagX = flagTileX * TILE_SIZE;
    if (p.x + p.width >= flagX && p.x <= flagX + 8) {
      // Grab the flagpole!
      this.status = 'FLAG_CELEBRATION';
      p.vx = 0;
      p.vy = 0;
      p.x = flagX - 6;
      sound.playLevelClear();

      // Bonus points for higher flag grab!
      const heightGrab = Math.max(0, 13 * TILE_SIZE - p.y);
      const bonusPts = Math.min(5000, Math.floor(heightGrab * 30));
      this.addScore(bonusPts, flagX, p.y);
      this.notifyStats();
    }
  }

  private updateFlagpoleSequence() {
    this.flagSlideTimer++;
    const p = this.player;
    const groundY = 12 * TILE_SIZE;

    // Flag slides down pole
    if (this.flagY < 12 * TILE_SIZE) {
      this.flagY += 2;
    }

    // Mario slides down pole
    if (p.y < groundY) {
      p.y += 2;
    } else {
      // Mario hops off pole and walks to castle door
      p.facing = 'right';
      const castleDoorX = (this.currentLevel.castleTileX + 2) * TILE_SIZE;

      if (p.x < castleDoorX) {
        p.x += 1.2;
        p.runCycle += 0.2;
      } else {
        // Entered castle! Raise castle flag
        if (!this.castleFlagRaised) {
          this.castleFlagRaised = true;
          // Spawn fireworks particles
          this.spawnFireworks(castleDoorX, 7 * TILE_SIZE);
        }
      }
    }

    if (this.flagSlideTimer > 280) {
      // Advance to next level!
      const nextLvl = this.currentLevelIndex + 1;
      if (nextLvl < 3) {
        this.status = 'PLAYING';
        this.loadLevel(nextLvl);
      } else {
        this.status = 'GAME_WON';
        sound.stopBgm();
        this.notifyStats();
      }
    }
  }

  private spawnFireworks(x: number, y: number) {
    const colors = ['#FCBC00', '#D82800', '#00E800', '#0058F8', '#FCFCFC'];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 3,
        life: 60,
        maxLife: 60,
      });
    }
  }

  /* ---------------- PARTICLES & FX ---------------- */

  private spawnCoinPop(x: number, y: number) {
    this.particles.push({
      id: Math.random(),
      x,
      y,
      vx: 0,
      vy: -3.5,
      color: '#FCBC00',
      size: 10,
      life: 25,
      maxLife: 25,
      text: 'COIN',
    });
  }

  private spawnBrickDebris(x: number, y: number) {
    const pieces = [
      { vx: -2.2, vy: -4.5 },
      { vx: 2.2, vy: -4.5 },
      { vx: -1.6, vy: -2.5 },
      { vx: 1.6, vy: -2.5 },
    ];
    for (const p of pieces) {
      this.particles.push({
        id: Math.random(),
        x,
        y,
        vx: p.vx,
        vy: p.vy,
        color: '#C84C0C',
        size: 5,
        life: 45,
        maxLife: 45,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  private updateParticles() {
    for (const p of this.particles) {
      p.life--;
      p.x += p.vx;
      p.y += p.vy;
      if (p.rotation !== undefined && p.vRot) {
        p.rotation += p.vRot;
      }
      p.vy += 0.25; // gravity for debris
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private updateBlocks() {
    for (const b of this.blocks) {
      if (b.bumping) {
        b.bumpOffset -= 0.6;
        if (b.bumpOffset <= 0) {
          b.bumpOffset = 0;
          b.bumping = false;
        }
      }
    }
  }

  private updateMovingPlatforms() {
    if (!this.currentLevel.movingPlatforms) return;
    for (const plat of this.currentLevel.movingPlatforms) {
      plat.x += plat.speed;
      if (plat.x > plat.endX || plat.x < plat.startX) {
        plat.speed = -plat.speed;
      }

      // Check if player is riding platform
      const p = this.player;
      if (
        p.vy >= 0 &&
        p.x + p.width > plat.x &&
        p.x < plat.x + plat.width &&
        Math.abs(p.y + p.height - plat.y) < 5
      ) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.isGrounded = true;
        p.x += plat.speed;
      }
    }
  }

  private addScore(pts: number, x?: number, y?: number) {
    this.stats.score += pts;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      try {
        localStorage.setItem('pixel_bros_highscore', this.stats.highScore.toString());
      } catch {
        // ignore
      }
    }

    if (x !== undefined && y !== undefined) {
      this.particles.push({
        id: Math.random(),
        x,
        y: y - 8,
        vx: 0,
        vy: -0.6,
        color: '#FCFCFC',
        size: 8,
        life: 40,
        maxLife: 40,
        text: `+${pts}`,
      });
    }

    this.notifyStats();
  }

  private addCoin() {
    this.stats.coins++;
    if (this.stats.coins >= 100) {
      this.stats.coins -= 100;
      this.stats.lives++;
      sound.play1Up();
    }
    this.notifyStats();
  }

  private notifyStats() {
    if (this.onStatsChange) {
      this.onStatsChange({ ...this.stats }, this.status);
    }
  }

  private checkAABB(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /* ---------------- CANVAS RENDERING ---------------- */

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear Screen with Sky Color
    ctx.fillStyle = this.currentLevel.skyColor;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Parallax Clouds & Green Hills in Background (Overworld)
    if (this.currentLevel.theme === 'grassland' || this.currentLevel.theme === 'sky') {
      const camOffset = this.cameraX * 0.4;
      for (let i = 0; i < 20; i++) {
        SpriteRenderer.drawCloud(ctx, i * 220 + 30 - camOffset * 0.3, 30 + (i % 3) * 16, 0.85);
      }
      for (let i = 0; i < 15; i++) {
        SpriteRenderer.drawHill(ctx, i * 280 - camOffset * 0.5, 12 * TILE_SIZE - 40, 110, 50);
      }
    }

    // Draw Flagpole & Castle
    if (this.currentLevel.flagpoleTileX !== 999) {
      SpriteRenderer.drawFlagpole(ctx, this.currentLevel.flagpoleTileX, this.flagY);
      SpriteRenderer.drawCastle(ctx, this.currentLevel.castleTileX, 8, this.castleFlagRaised);
    }

    // Draw Moving Platforms
    if (this.currentLevel.movingPlatforms) {
      for (const plat of this.currentLevel.movingPlatforms) {
        ctx.fillStyle = '#FCBC00';
        ctx.fillRect(Math.floor(plat.x), Math.floor(plat.y), plat.width, plat.height);
        ctx.fillStyle = '#D87800';
        ctx.fillRect(Math.floor(plat.x), Math.floor(plat.y + plat.height - 2), plat.width, 2);
      }
    }

    // Draw Visible Blocks
    for (const b of this.blocks) {
      if (b.x + b.width >= this.cameraX - 16 && b.x <= this.cameraX + w + 16) {
        SpriteRenderer.drawBlock(ctx, b, this.tick);
      }
    }

    // Draw Power-Ups
    for (const item of this.powerUps) {
      if (item.state !== 'collected') {
        SpriteRenderer.drawPowerUp(ctx, item, this.tick);
      }
    }

    // Draw Enemies
    for (const e of this.enemies) {
      if (e.alive || e.state === 'squashed' || e.state === 'falling') {
        if (e.type === 'goomba') {
          SpriteRenderer.drawGoomba(ctx, e, this.tick);
        } else if (e.type === 'paratroopa') {
          SpriteRenderer.drawParatroopa(ctx, e, this.tick);
        } else if (e.type === 'koopa' || e.type === 'koopa_shell') {
          SpriteRenderer.drawKoopa(ctx, e, this.tick);
        } else if (e.type === 'piranha') {
          SpriteRenderer.drawPiranha(ctx, e, this.tick);
        }
      }
    }

    // Draw Fireballs
    for (const fb of this.fireballs) {
      SpriteRenderer.drawFireball(ctx, fb, this.tick);
    }

    // Draw Player
    if (this.player.form === 'small') {
      SpriteRenderer.drawSmallMario(ctx, this.player, this.tick);
    } else {
      SpriteRenderer.drawSuperMario(ctx, this.player, this.tick);
    }

    // Draw Particles & Floating Points
    for (const p of this.particles) {
      SpriteRenderer.drawParticle(ctx, p);
    }

    ctx.restore();
  }
}
