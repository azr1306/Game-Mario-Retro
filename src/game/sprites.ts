/**
 * Super Pixel Bros - Pixel Art Renderer
 * Renders authentic 8-bit / 16-bit retro sprites and tiles directly onto the 2D canvas.
 */

import { Block, Enemy, Fireball, Particle, Player, PowerUp } from './types';

export const TILE_SIZE = 16; // Native pixel resolution

// Classic NES Palette
export const PALETTE = {
  // Mario Colors
  marioRed: '#D82800',
  marioBlue: '#0058F8',
  marioSkin: '#FC9838',
  marioBrown: '#684400',
  marioWhite: '#FCFCFC',
  marioFireOveralls: '#D82800',
  marioFireShirt: '#FCFCFC',

  // Enemies
  goombaBrown: '#B84418',
  goombaTan: '#FC9838',
  goombaFeet: '#000000',
  koopaGreen: '#00A800',
  koopaYellow: '#FCBC00',
  koopaShellOrange: '#F87800',
  koopaRed: '#E40058',
  piranhaRed: '#D82800',
  piranhaGreen: '#00A800',
  piranhaWhite: '#FCFCFC',

  // Power-ups
  mushroomRed: '#D82800',
  mushroomGreen: '#00A800',
  starYellow: '#FCE000',
  starEyes: '#000000',
  flowerOrange: '#F85800',
  flowerYellow: '#FCE000',
  coinGold: '#FCBC00',
  coinShine: '#FCFCFC',

  // Environment
  skyBlue: '#5C94FC',
  undergroundBlack: '#000000',
  undergroundBlue: '#0058F8',
  sunsetSky: '#F87858',
  grassGreen: '#00A800',
  dirtBrown: '#8C4000',
  dirtSpeck: '#D87800',
  brickOrange: '#C84C0C',
  brickMortar: '#000000',
  pipeGreenLight: '#00E800',
  pipeGreenDark: '#008800',
  pipeGreenBlack: '#004800',
  castleBrick: '#B8B8B8',
  castleDoor: '#000000',
  cloudWhite: '#FCFCFC',
  cloudOutline: '#3878F8',
  questionYellow: '#FCBC00',
  questionOrange: '#E45C10',
  emptyBlock: '#8C4820',
};

// Rainbow cycle colors for Star Power
const STAR_RAINBOW = ['#FCFCFC', '#FCBC00', '#00E800', '#0058F8', '#E40058', '#FC7460'];

/** Helper to draw a pixel rect scaled by 1 native pixel */
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

export class SpriteRenderer {
  /** Draw Small Mario (16x16) */
  public static drawSmallMario(ctx: CanvasRenderingContext2D, p: Player, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(p.x), Math.floor(p.y));

    // Star power flashing effect or Invulnerable flashing
    if (p.invulnerableTimer > 0 && Math.floor(tick / 4) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    let shirtColor = PALETTE.marioRed;
    let overallsColor = PALETTE.marioBlue;
    let skinColor = PALETTE.marioSkin;
    let capColor = PALETTE.marioRed;

    if (p.starTimer > 0) {
      const colIdx = Math.floor(tick / 3) % STAR_RAINBOW.length;
      shirtColor = STAR_RAINBOW[colIdx];
      overallsColor = STAR_RAINBOW[(colIdx + 2) % STAR_RAINBOW.length];
      capColor = shirtColor;
    }

    if (p.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    // Dead animation (flip upside down or freeze pose)
    if (p.dead) {
      // Hat
      px(ctx, 3, 0, 10, 3, shirtColor);
      px(ctx, 1, 3, 14, 2, shirtColor);
      // Face
      px(ctx, 3, 5, 8, 4, skinColor);
      px(ctx, 9, 6, 2, 2, '#000'); // Dead eye 'X' or closed
      px(ctx, 4, 8, 4, 2, PALETTE.marioBrown); // Moustache
      // Overalls
      px(ctx, 4, 9, 8, 4, overallsColor);
      px(ctx, 2, 13, 12, 3, PALETTE.marioBrown);
      ctx.restore();
      return;
    }

    // Jump frame
    if (!p.isGrounded) {
      // Hat
      px(ctx, 5, 1, 8, 3, capColor);
      px(ctx, 4, 3, 11, 2, capColor);
      // Face
      px(ctx, 4, 5, 7, 3, skinColor);
      px(ctx, 9, 5, 2, 2, '#000'); // Eye
      px(ctx, 9, 7, 5, 2, PALETTE.marioBrown); // Moustache
      px(ctx, 2, 6, 3, 3, PALETTE.marioBrown); // Hair
      // Body (jumping limbs outstretched)
      px(ctx, 2, 8, 4, 3, shirtColor);
      px(ctx, 6, 8, 5, 5, overallsColor);
      px(ctx, 11, 8, 4, 3, shirtColor);
      // Hands
      px(ctx, 0, 7, 3, 3, skinColor);
      px(ctx, 13, 6, 3, 3, skinColor);
      // Legs
      px(ctx, 3, 13, 4, 3, PALETTE.marioBrown); // Back foot tucked
      px(ctx, 10, 12, 5, 4, PALETTE.marioBrown); // Front foot forward
      ctx.restore();
      return;
    }

    // Skid frame (turning around while moving fast)
    if (p.isSkidding) {
      // Hat
      px(ctx, 3, 1, 9, 3, capColor);
      px(ctx, 2, 3, 11, 2, capColor);
      // Face looking back
      px(ctx, 4, 5, 7, 3, skinColor);
      px(ctx, 5, 5, 2, 2, '#000');
      px(ctx, 3, 7, 5, 2, PALETTE.marioBrown);
      // Overalls & bracing arms
      px(ctx, 5, 8, 6, 5, overallsColor);
      px(ctx, 1, 9, 4, 3, shirtColor);
      px(ctx, 11, 9, 4, 3, shirtColor);
      px(ctx, 2, 13, 5, 3, PALETTE.marioBrown);
      px(ctx, 9, 13, 5, 3, PALETTE.marioBrown);
      ctx.restore();
      return;
    }

    // Walking / Running cycle (frames 0, 1, 2)
    const frame = Math.abs(p.vx) > 0.1 ? Math.floor(p.runCycle) % 3 : 0;

    // Cap
    px(ctx, 4, 1, 8, 3, capColor);
    px(ctx, 3, 3, 11, 2, capColor);
    // Face
    px(ctx, 3, 5, 8, 3, skinColor);
    px(ctx, 8, 5, 2, 2, '#000'); // Eye
    px(ctx, 8, 7, 5, 2, PALETTE.marioBrown); // Moustache
    px(ctx, 2, 5, 3, 3, PALETTE.marioBrown); // Hair

    if (frame === 0) {
      // Standing
      px(ctx, 4, 8, 8, 5, overallsColor);
      px(ctx, 2, 9, 3, 3, shirtColor);
      px(ctx, 11, 9, 3, 3, shirtColor);
      px(ctx, 2, 12, 3, 2, skinColor);
      px(ctx, 11, 12, 3, 2, skinColor);
      // Feet
      px(ctx, 3, 13, 5, 3, PALETTE.marioBrown);
      px(ctx, 9, 13, 5, 3, PALETTE.marioBrown);
    } else if (frame === 1) {
      // Step 1
      px(ctx, 4, 8, 8, 5, overallsColor);
      px(ctx, 1, 8, 3, 4, shirtColor);
      px(ctx, 12, 10, 3, 3, shirtColor);
      // Feet
      px(ctx, 2, 13, 5, 3, PALETTE.marioBrown);
      px(ctx, 10, 12, 4, 4, PALETTE.marioBrown);
    } else {
      // Step 2
      px(ctx, 4, 8, 8, 5, overallsColor);
      px(ctx, 12, 8, 3, 4, shirtColor);
      px(ctx, 1, 10, 3, 3, shirtColor);
      // Feet
      px(ctx, 5, 13, 4, 3, PALETTE.marioBrown);
      px(ctx, 9, 13, 6, 3, PALETTE.marioBrown);
    }

    ctx.restore();
  }

  /** Draw Super & Fire Mario (16x32) */
  public static drawSuperMario(ctx: CanvasRenderingContext2D, p: Player, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(p.x), Math.floor(p.y));

    if (p.invulnerableTimer > 0 && Math.floor(tick / 4) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    const isFire = p.form === 'fire';
    let shirtColor = isFire ? PALETTE.marioFireShirt : PALETTE.marioRed;
    let overallsColor = isFire ? PALETTE.marioFireOveralls : PALETTE.marioBlue;
    let capColor = shirtColor;
    let skinColor = PALETTE.marioSkin;

    if (p.starTimer > 0) {
      const colIdx = Math.floor(tick / 3) % STAR_RAINBOW.length;
      shirtColor = STAR_RAINBOW[colIdx];
      overallsColor = STAR_RAINBOW[(colIdx + 2) % STAR_RAINBOW.length];
      capColor = shirtColor;
    }

    if (p.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    // Crouching (compressed 16x22)
    if (p.isCrouching && p.isGrounded) {
      ctx.translate(0, 10);
      // Cap
      px(ctx, 4, 1, 9, 4, capColor);
      px(ctx, 3, 4, 12, 3, capColor);
      // Face
      px(ctx, 4, 7, 8, 4, skinColor);
      px(ctx, 9, 7, 2, 3, '#000');
      px(ctx, 9, 9, 5, 3, PALETTE.marioBrown);
      // Overalls tucked
      px(ctx, 4, 11, 9, 7, overallsColor);
      px(ctx, 2, 18, 12, 4, PALETTE.marioBrown);
      ctx.restore();
      return;
    }

    // Jump frame
    if (!p.isGrounded) {
      // Cap
      px(ctx, 4, 1, 9, 4, capColor);
      px(ctx, 3, 4, 12, 3, capColor);
      // Face
      px(ctx, 4, 7, 8, 5, skinColor);
      px(ctx, 9, 7, 2, 3, '#000');
      px(ctx, 9, 10, 6, 3, PALETTE.marioBrown);
      px(ctx, 2, 8, 3, 4, PALETTE.marioBrown);
      // Torso & Outstretched Arms
      px(ctx, 5, 12, 6, 8, overallsColor);
      px(ctx, 1, 11, 4, 6, shirtColor);
      px(ctx, 11, 9, 4, 6, shirtColor);
      px(ctx, 0, 10, 3, 4, skinColor);
      px(ctx, 12, 7, 3, 4, skinColor);
      // Overalls buttons
      px(ctx, 6, 14, 2, 2, PALETTE.flowerYellow);
      // Legs
      px(ctx, 3, 20, 5, 6, overallsColor);
      px(ctx, 10, 19, 5, 6, overallsColor);
      px(ctx, 2, 26, 6, 5, PALETTE.marioBrown);
      px(ctx, 11, 24, 5, 5, PALETTE.marioBrown);
      ctx.restore();
      return;
    }

    // Skid frame
    if (p.isSkidding) {
      px(ctx, 3, 1, 10, 4, capColor);
      px(ctx, 2, 4, 12, 3, capColor);
      px(ctx, 4, 7, 8, 5, skinColor);
      px(ctx, 5, 7, 2, 3, '#000');
      px(ctx, 3, 10, 6, 3, PALETTE.marioBrown);
      px(ctx, 5, 12, 6, 9, overallsColor);
      px(ctx, 1, 13, 4, 5, shirtColor);
      px(ctx, 11, 13, 4, 5, shirtColor);
      px(ctx, 2, 21, 5, 7, overallsColor);
      px(ctx, 9, 21, 5, 7, overallsColor);
      px(ctx, 1, 27, 6, 5, PALETTE.marioBrown);
      px(ctx, 9, 27, 6, 5, PALETTE.marioBrown);
      ctx.restore();
      return;
    }

    // Walking cycle (3 frames)
    const frame = Math.abs(p.vx) > 0.1 ? Math.floor(p.runCycle) % 3 : 0;

    // Cap
    px(ctx, 4, 1, 9, 4, capColor);
    px(ctx, 3, 4, 12, 3, capColor);
    // Face
    px(ctx, 4, 7, 8, 5, skinColor);
    px(ctx, 9, 7, 2, 3, '#000');
    px(ctx, 9, 10, 6, 3, PALETTE.marioBrown);
    px(ctx, 2, 8, 3, 4, PALETTE.marioBrown);

    // Torso
    px(ctx, 5, 12, 6, 9, overallsColor);
    px(ctx, 7, 14, 2, 2, PALETTE.flowerYellow); // Gold button

    if (frame === 0) {
      // Standing
      px(ctx, 2, 13, 3, 6, shirtColor);
      px(ctx, 11, 13, 3, 6, shirtColor);
      px(ctx, 2, 19, 3, 3, skinColor);
      px(ctx, 11, 19, 3, 3, skinColor);
      // Legs
      px(ctx, 4, 21, 4, 6, overallsColor);
      px(ctx, 8, 21, 4, 6, overallsColor);
      px(ctx, 3, 27, 5, 5, PALETTE.marioBrown);
      px(ctx, 8, 27, 5, 5, PALETTE.marioBrown);
    } else if (frame === 1) {
      // Step 1
      px(ctx, 1, 12, 4, 6, shirtColor);
      px(ctx, 12, 14, 3, 5, shirtColor);
      px(ctx, 1, 18, 3, 3, skinColor);
      px(ctx, 12, 19, 3, 3, skinColor);
      // Legs stride
      px(ctx, 3, 21, 5, 6, overallsColor);
      px(ctx, 9, 21, 4, 5, overallsColor);
      px(ctx, 2, 27, 6, 5, PALETTE.marioBrown);
      px(ctx, 10, 26, 5, 5, PALETTE.marioBrown);
    } else {
      // Step 2
      px(ctx, 11, 12, 4, 6, shirtColor);
      px(ctx, 1, 14, 3, 5, shirtColor);
      px(ctx, 12, 18, 3, 3, skinColor);
      px(ctx, 1, 19, 3, 3, skinColor);
      // Legs stride
      px(ctx, 5, 21, 4, 5, overallsColor);
      px(ctx, 8, 21, 5, 6, overallsColor);
      px(ctx, 4, 26, 5, 5, PALETTE.marioBrown);
      px(ctx, 8, 27, 6, 5, PALETTE.marioBrown);
    }

    ctx.restore();
  }

  /** Draw Goomba (16x16) */
  public static drawGoomba(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(enemy.x), Math.floor(enemy.y));

    if (enemy.state === 'falling') {
      ctx.scale(1, -1);
      ctx.translate(0, -16);
    }

    if (enemy.state === 'squashed') {
      // Squashed pancake frame
      px(ctx, 1, 8, 14, 6, PALETTE.goombaBrown);
      px(ctx, 3, 11, 10, 3, PALETTE.goombaTan);
      px(ctx, 4, 10, 3, 2, '#000');
      px(ctx, 9, 10, 3, 2, '#000');
      ctx.restore();
      return;
    }

    const walkFrame = Math.floor(tick / 10) % 2;

    // Mushroom Cap
    px(ctx, 4, 1, 8, 2, PALETTE.goombaBrown);
    px(ctx, 2, 3, 12, 3, PALETTE.goombaBrown);
    px(ctx, 1, 6, 14, 3, PALETTE.goombaBrown);

    // Face / Stem
    px(ctx, 3, 9, 10, 4, PALETTE.goombaTan);

    // Angry Eyebrows & Eyes
    px(ctx, 3, 8, 4, 1, '#000');
    px(ctx, 9, 8, 4, 1, '#000');
    px(ctx, 4, 9, 2, 3, '#FFF');
    px(ctx, 5, 10, 1, 2, '#000');
    px(ctx, 10, 9, 2, 3, '#FFF');
    px(ctx, 10, 10, 1, 2, '#000');

    // Feet animation
    if (walkFrame === 0) {
      px(ctx, 1, 13, 5, 3, PALETTE.goombaFeet);
      px(ctx, 9, 13, 6, 3, PALETTE.goombaFeet);
    } else {
      px(ctx, 2, 13, 6, 3, PALETTE.goombaFeet);
      px(ctx, 10, 13, 5, 3, PALETTE.goombaFeet);
    }

    ctx.restore();
  }

  /** Draw Koopa Troopa (16x24) & Shell */
  public static drawKoopa(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(enemy.x), Math.floor(enemy.y));

    if (enemy.facing === 'right') {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    if (enemy.state === 'falling') {
      ctx.scale(1, -1);
      ctx.translate(0, -enemy.height);
    }

    const shellColor = enemy.color === 'red' ? PALETTE.koopaRed : PALETTE.koopaGreen;

    // Shell state (idle or sliding)
    if (enemy.state === 'shell_idle' || enemy.state === 'shell_moving') {
      // 16x14 Shell
      ctx.translate(0, 10);
      px(ctx, 2, 2, 12, 10, shellColor);
      px(ctx, 4, 0, 8, 2, shellColor);
      px(ctx, 1, 4, 14, 6, shellColor);
      // Yellow Rim / Belly
      px(ctx, 2, 12, 12, 2, PALETTE.koopaYellow);
      // Hex pattern highlights
      px(ctx, 4, 3, 3, 3, '#FCFCFC');
      px(ctx, 9, 3, 3, 3, '#FCFCFC');
      px(ctx, 6, 7, 4, 3, '#FCFCFC');

      // Motion blur lines if sliding fast
      if (enemy.state === 'shell_moving') {
        px(ctx, 0, 6, 2, 1, '#FFF');
        px(ctx, 14, 8, 2, 1, '#FFF');
      }

      ctx.restore();
      return;
    }

    // Walking Koopa
    const walkFrame = Math.floor(tick / 8) % 2;

    // Head
    px(ctx, 2, 1, 7, 4, PALETTE.koopaYellow);
    px(ctx, 1, 4, 9, 4, PALETTE.koopaYellow);
    px(ctx, 7, 3, 2, 3, '#000'); // Eye
    px(ctx, 8, 4, 1, 1, '#FFF'); // Eye shine
    px(ctx, 1, 7, 4, 2, PALETTE.koopaYellow); // Beak

    // Shell Body
    px(ctx, 5, 8, 9, 10, shellColor);
    px(ctx, 4, 9, 11, 7, shellColor);
    px(ctx, 4, 16, 9, 2, PALETTE.koopaYellow); // Rim

    // Legs
    if (walkFrame === 0) {
      px(ctx, 3, 18, 4, 6, PALETTE.koopaYellow);
      px(ctx, 9, 18, 4, 5, PALETTE.koopaYellow);
      px(ctx, 2, 22, 5, 2, PALETTE.koopaYellow);
      px(ctx, 8, 21, 5, 3, PALETTE.koopaYellow);
    } else {
      px(ctx, 4, 18, 4, 5, PALETTE.koopaYellow);
      px(ctx, 9, 18, 4, 6, PALETTE.koopaYellow);
      px(ctx, 3, 21, 5, 3, PALETTE.koopaYellow);
      px(ctx, 8, 22, 5, 2, PALETTE.koopaYellow);
    }

    ctx.restore();
  }

  /** Draw Flying Paratroopa (Koopa with flapping wings) */
  public static drawParatroopa(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    this.drawKoopa(ctx, enemy, tick);

    // Draw Flapping Wings behind shell
    ctx.save();
    ctx.translate(Math.floor(enemy.x), Math.floor(enemy.y));
    const wingFlap = Math.sin(tick * 0.3) > 0 ? 0 : 3;

    px(ctx, 9, 6 + wingFlap, 6, 6, '#FCFCFC');
    px(ctx, 12, 4 + wingFlap, 4, 4, '#FCFCFC');
    px(ctx, 11, 7 + wingFlap, 3, 2, '#3878F8');
    ctx.restore();
  }

  /** Draw Piranha Plant emerging from Pipe (16x24) */
  public static drawPiranha(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(enemy.x), Math.floor(enemy.y));

    const snapOpen = Math.floor(tick / 12) % 2 === 0;

    // Stem
    px(ctx, 6, 12, 4, 12, PALETTE.piranhaGreen);
    px(ctx, 2, 16, 4, 3, PALETTE.piranhaGreen); // Leaf left
    px(ctx, 10, 16, 4, 3, PALETTE.piranhaGreen); // Leaf right

    // Red Head with White Polka Dots
    px(ctx, 2, 0, 12, 12, PALETTE.piranhaRed);
    px(ctx, 4, 2, 2, 2, PALETTE.piranhaWhite);
    px(ctx, 10, 2, 2, 2, PALETTE.piranhaWhite);
    px(ctx, 3, 7, 2, 2, PALETTE.piranhaWhite);
    px(ctx, 11, 7, 2, 2, PALETTE.piranhaWhite);

    // Mouth & Sharp White Teeth
    if (snapOpen) {
      px(ctx, 3, 4, 10, 4, '#000');
      px(ctx, 4, 4, 2, 2, '#FFF');
      px(ctx, 7, 4, 2, 2, '#FFF');
      px(ctx, 10, 4, 2, 2, '#FFF');
      px(ctx, 5, 7, 2, 1, '#FFF');
      px(ctx, 9, 7, 2, 1, '#FFF');
    } else {
      px(ctx, 3, 5, 10, 2, '#FFF');
      px(ctx, 4, 5, 2, 2, '#000');
      px(ctx, 8, 5, 2, 2, '#000');
    }

    ctx.restore();
  }

  /** Draw Power-Up Items */
  public static drawPowerUp(ctx: CanvasRenderingContext2D, item: PowerUp, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(item.x), Math.floor(item.y));

    if (item.type === 'mushroom' || item.type === '1up') {
      const capColor = item.type === '1up' ? PALETTE.mushroomGreen : PALETTE.mushroomRed;
      // Cap
      px(ctx, 4, 0, 8, 2, capColor);
      px(ctx, 2, 2, 12, 3, capColor);
      px(ctx, 1, 5, 14, 4, capColor);
      // White Dots
      px(ctx, 6, 2, 4, 4, '#FFF');
      px(ctx, 1, 5, 3, 3, '#FFF');
      px(ctx, 12, 5, 3, 3, '#FFF');
      // Stem
      px(ctx, 3, 9, 10, 7, PALETTE.marioSkin);
      // Eyes
      px(ctx, 5, 10, 2, 3, '#000');
      px(ctx, 9, 10, 2, 3, '#000');
    } else if (item.type === 'flower') {
      const petalCol = Math.floor(tick / 6) % 2 === 0 ? PALETTE.flowerOrange : PALETTE.flowerYellow;
      // Stem & Leaves
      px(ctx, 7, 8, 2, 8, PALETTE.grassGreen);
      px(ctx, 2, 11, 5, 3, PALETTE.grassGreen);
      px(ctx, 9, 11, 5, 3, PALETTE.grassGreen);
      // Flower Petals
      px(ctx, 3, 0, 10, 8, petalCol);
      px(ctx, 5, 2, 6, 4, '#FCFCFC');
      // Smiling Eyes
      px(ctx, 6, 3, 1, 2, '#000');
      px(ctx, 9, 3, 1, 2, '#000');
    } else if (item.type === 'star') {
      const starCol = Math.floor(tick / 4) % 2 === 0 ? PALETTE.starYellow : '#FCFCFC';
      // 5-Point Star
      px(ctx, 6, 0, 4, 3, starCol);
      px(ctx, 4, 3, 8, 4, starCol);
      px(ctx, 1, 5, 14, 3, starCol);
      px(ctx, 3, 8, 10, 4, starCol);
      px(ctx, 2, 12, 4, 4, starCol);
      px(ctx, 10, 12, 4, 4, starCol);
      // Star Eyes
      px(ctx, 6, 5, 1, 3, PALETTE.starEyes);
      px(ctx, 9, 5, 1, 3, PALETTE.starEyes);
    } else if (item.type === 'coin') {
      // Spinning golden coin
      const coinPhase = Math.floor(tick / 6) % 4;
      const w = coinPhase === 0 || coinPhase === 2 ? 10 : coinPhase === 1 ? 6 : 2;
      const offset = (16 - w) / 2;

      px(ctx, offset, 2, w, 12, PALETTE.coinGold);
      px(ctx, offset + 1, 3, w - 2, 10, '#FFF59D');
      if (w > 4) {
        px(ctx, offset + 2, 5, 2, 6, PALETTE.questionOrange);
      }
    }

    ctx.restore();
  }

  /** Draw Bouncing Fireball */
  public static drawFireball(ctx: CanvasRenderingContext2D, fb: Fireball, tick: number) {
    ctx.save();
    ctx.translate(Math.floor(fb.x - fb.radius), Math.floor(fb.y - fb.radius));

    if (fb.exploding) {
      // Expanding fire poof explosion
      const s = 12;
      px(ctx, 0, 0, s, s, '#FFF');
      px(ctx, 2, 2, s - 4, s - 4, PALETTE.flowerOrange);
      px(ctx, 4, 4, s - 8, s - 8, PALETTE.flowerYellow);
      ctx.restore();
      return;
    }

    const flameCycle = Math.floor(tick / 3) % 2;
    // Core fire orb
    px(ctx, 2, 0, 4, 8, flameCycle === 0 ? PALETTE.marioRed : PALETTE.flowerOrange);
    px(ctx, 0, 2, 8, 4, flameCycle === 0 ? PALETTE.flowerOrange : PALETTE.marioRed);
    px(ctx, 2, 2, 4, 4, '#FCFCFC');

    ctx.restore();
  }

  /** Draw Level Blocks */
  public static drawBlock(ctx: CanvasRenderingContext2D, b: Block, tick: number) {
    if (b.isBroken) return;

    ctx.save();
    ctx.translate(Math.floor(b.x), Math.floor(b.y - b.bumpOffset));

    const s = b.width;

    if (b.type === 'question') {
      // Question block shimmer
      const shimmer = Math.floor(tick / 15) % 4;
      const bgCol = shimmer === 0 ? '#FFE082' : PALETTE.questionYellow;

      px(ctx, 0, 0, s, s, bgCol);
      // 3D Borders
      px(ctx, 0, 0, s, 1, '#FFF');
      px(ctx, 0, 0, 1, s, '#FFF');
      px(ctx, 0, s - 1, s, 1, PALETTE.questionOrange);
      px(ctx, s - 1, 0, 1, s, PALETTE.questionOrange);

      // Corner rivets
      px(ctx, 1, 1, 1, 1, '#000');
      px(ctx, s - 2, 1, 1, 1, '#000');
      px(ctx, 1, s - 2, 1, 1, '#000');
      px(ctx, s - 2, s - 2, 1, 1, '#000');

      // '?' glyph
      px(ctx, 5, 3, 6, 2, PALETTE.questionOrange);
      px(ctx, 9, 5, 2, 3, PALETTE.questionOrange);
      px(ctx, 7, 7, 3, 2, PALETTE.questionOrange);
      px(ctx, 7, 11, 2, 2, PALETTE.questionOrange);
    } else if (b.type === 'empty') {
      // Spent metal block
      px(ctx, 0, 0, s, s, PALETTE.emptyBlock);
      px(ctx, 0, 0, s, 1, '#BCAAA4');
      px(ctx, 0, 0, 1, s, '#BCAAA4');
      px(ctx, 0, s - 1, s, 1, '#3E2723');
      px(ctx, s - 1, 0, 1, s, '#3E2723');
      // 4 Rivets
      px(ctx, 2, 2, 1, 1, '#000');
      px(ctx, s - 3, 2, 1, 1, '#000');
      px(ctx, 2, s - 3, 1, 1, '#000');
      px(ctx, s - 3, s - 3, 1, 1, '#000');
    } else if (b.type === 'brick') {
      // Terracotta Brick
      px(ctx, 0, 0, s, s, PALETTE.brickOrange);
      // Mortar lines
      px(ctx, 0, 7, s, 1, PALETTE.brickMortar);
      px(ctx, 0, 15, s, 1, PALETTE.brickMortar);
      px(ctx, 7, 0, 1, 7, PALETTE.brickMortar);
      px(ctx, 3, 8, 1, 7, PALETTE.brickMortar);
      px(ctx, 12, 8, 1, 7, PALETTE.brickMortar);
      // Brick texture highlights
      px(ctx, 1, 1, 5, 1, '#FF8A65');
      px(ctx, 9, 1, 5, 1, '#FF8A65');
      px(ctx, 5, 9, 6, 1, '#FF8A65');
    } else if (b.type === 'ground') {
      // Lush grass top on rich dirt
      px(ctx, 0, 0, s, s, PALETTE.dirtBrown);
      px(ctx, 0, 0, s, 4, PALETTE.grassGreen);
      px(ctx, 0, 4, s, 1, '#006400');
      // Dirt flecks
      px(ctx, 3, 8, 2, 2, PALETTE.dirtSpeck);
      px(ctx, 10, 11, 2, 2, PALETTE.dirtSpeck);
      px(ctx, 12, 6, 2, 1, PALETTE.dirtSpeck);
    } else if (b.type === 'rock') {
      // Underground blue rock / stone
      px(ctx, 0, 0, s, s, '#283593');
      px(ctx, 0, 0, s, 2, '#5C6BC0');
      px(ctx, 0, 0, 2, s, '#5C6BC0');
      px(ctx, 0, s - 2, s, 2, '#0D47A1');
      px(ctx, s - 2, 0, 2, s, '#0D47A1');
      px(ctx, 4, 5, 4, 4, '#1A237E');
      px(ctx, 10, 10, 3, 3, '#1A237E');
    } else if (b.type === 'pipe_tl' || b.type === 'pipe_in_tl') {
      // Pipe top-left lip
      px(ctx, 0, 0, s, s, PALETTE.pipeGreenDark);
      px(ctx, 2, 0, 3, s, PALETTE.pipeGreenLight);
      px(ctx, 0, 0, s, 2, PALETTE.pipeGreenLight);
      px(ctx, 0, 0, 1, s, '#000');
      px(ctx, 0, s - 1, s, 1, PALETTE.pipeGreenBlack);
    } else if (b.type === 'pipe_tr' || b.type === 'pipe_in_tr') {
      // Pipe top-right lip
      px(ctx, 0, 0, s, s, PALETTE.pipeGreenDark);
      px(ctx, 0, 0, s, 2, PALETTE.pipeGreenLight);
      px(ctx, s - 1, 0, 1, s, '#000');
      px(ctx, s - 4, 0, 3, s, PALETTE.pipeGreenBlack);
      px(ctx, 0, s - 1, s, 1, PALETTE.pipeGreenBlack);
    } else if (b.type === 'pipe_bl') {
      // Pipe column left
      px(ctx, 2, 0, s - 2, s, PALETTE.pipeGreenDark);
      px(ctx, 3, 0, 3, s, PALETTE.pipeGreenLight);
      px(ctx, 2, 0, 1, s, '#000');
    } else if (b.type === 'pipe_br') {
      // Pipe column right
      px(ctx, 0, 0, s - 2, s, PALETTE.pipeGreenDark);
      px(ctx, s - 4, 0, 2, s, PALETTE.pipeGreenBlack);
      px(ctx, s - 3, 0, 1, s, '#000');
    } else if (b.type === 'bridge') {
      // Wooden suspension bridge
      px(ctx, 0, 0, s, 6, '#8D6E63');
      px(ctx, 0, 6, s, 2, '#4E342E');
      px(ctx, 2, 8, 2, s - 8, '#3E2723');
      px(ctx, s - 4, 8, 2, s - 8, '#3E2723');
    }

    ctx.restore();
  }

  /** Draw Particles & Floating Scores */
  public static drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.translate(Math.floor(p.x), Math.floor(p.y));

    if (p.text) {
      // Score floating popup (+100, +200, 1-UP)
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#000';
      ctx.fillText(p.text, 1, 1);
      ctx.fillStyle = p.color || '#FCFCFC';
      ctx.fillText(p.text, 0, 0);
    } else {
      // Brick debris chunk with rotation
      if (p.rotation !== undefined) {
        ctx.rotate(p.rotation);
      }
      px(ctx, -p.size / 2, -p.size / 2, p.size, p.size, p.color);
    }

    ctx.restore();
  }

  /** Draw Flagpole and Castle */
  public static drawFlagpole(ctx: CanvasRenderingContext2D, tileX: number, flagY: number) {
    const x = tileX * TILE_SIZE;
    const groundY = 13 * TILE_SIZE;
    const topY = 3 * TILE_SIZE;

    // Brass Pole
    px(ctx, x + 7, topY, 2, groundY - topY, '#FCBC00');
    // Golden Finial Ball on Top
    px(ctx, x + 5, topY - 5, 6, 6, '#FCBC00');
    px(ctx, x + 6, topY - 4, 2, 2, '#FFF');

    // Triangular Flag
    const currentFlagY = Math.floor(flagY);
    px(ctx, x - 12, currentFlagY, 12, 10, PALETTE.grassGreen);
    px(ctx, x - 10, currentFlagY + 2, 8, 6, '#FFF');
  }

  /** Draw Castle at Level Finish */
  public static drawCastle(ctx: CanvasRenderingContext2D, tileX: number, tileY: number, hasFlagRaised: boolean) {
    const x = tileX * TILE_SIZE;
    const y = tileY * TILE_SIZE;

    // Castle Base (80x80px approx)
    px(ctx, x, y + 32, 80, 48, PALETTE.brickOrange);
    px(ctx, x + 16, y, 48, 32, PALETTE.brickOrange);

    // Battlements / Crenellations
    for (let i = 0; i < 5; i++) {
      px(ctx, x + i * 16, y + 24, 8, 8, PALETTE.brickOrange);
    }
    for (let i = 0; i < 3; i++) {
      px(ctx, x + 16 + i * 16, y - 8, 8, 8, PALETTE.brickOrange);
    }

    // Arched Black Doorway
    px(ctx, x + 32, y + 48, 16, 32, '#000');
    px(ctx, x + 34, y + 44, 12, 6, '#000');

    // Castle Victory Flag
    if (hasFlagRaised) {
      px(ctx, x + 39, y - 24, 2, 16, '#FCBC00');
      px(ctx, x + 41, y - 24, 12, 8, PALETTE.marioRed);
    }
  }

  /** Draw Smiling Retro Cloud */
  public static drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.scale(scale, scale);

    px(ctx, 8, 0, 32, 16, PALETTE.cloudWhite);
    px(ctx, 0, 6, 48, 16, PALETTE.cloudWhite);

    // Cute retro eyes
    px(ctx, 16, 12, 2, 4, PALETTE.cloudOutline);
    px(ctx, 30, 12, 2, 4, PALETTE.cloudOutline);

    ctx.restore();
  }

  /** Draw Lush Green Hill in Background */
  public static drawHill(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    ctx.beginPath();
    ctx.fillStyle = '#00A800';
    ctx.ellipse(width / 2, height, width / 2, height, 0, Math.PI, 0, false);
    ctx.fill();

    // Subtle darker ring border
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Darker green decorative spots
    px(ctx, width * 0.3, height * 0.5, 4, 4, '#006400');
    px(ctx, width * 0.6, height * 0.4, 4, 4, '#006400');
    px(ctx, width * 0.45, height * 0.7, 4, 4, '#006400');

    ctx.restore();
  }
}
