/**
 * Super Pixel Bros - Level Layouts
 * Rich, authentic level designs with power-ups, secrets, warp pipes, and enemies.
 */

import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  // ================= WORLD 1-1: SUNNY GRASSLAND =================
  {
    index: 0,
    worldName: 'Dunia 1-1: Padang Rumput Cerah',
    theme: 'grassland',
    skyColor: '#5C94FC',
    timeLimit: 300,
    widthTiles: 180,
    heightTiles: 15,
    playerStartX: 40,
    playerStartY: 11 * 16,
    flagpoleTileX: 162,
    castleTileX: 168,
    blocks: [
      // Floor (Y=13 and Y=14) with pits
      ...createGroundRange(0, 68),
      ...createGroundRange(71, 86), // pit from 69 to 70
      ...createGroundRange(89, 152), // pit from 87 to 88
      ...createGroundRange(155, 180), // pit from 153 to 154

      // First [?] block with Coin
      { x: 16, y: 9, type: 'question', content: 'coin' },

      // Brick, [?] with Mushroom/Flower, Brick, [?] with Coin, Brick
      { x: 20, y: 9, type: 'brick', destructible: true },
      { x: 21, y: 9, type: 'question', content: 'mushroom' },
      { x: 22, y: 9, type: 'brick', destructible: true },
      { x: 23, y: 9, type: 'question', content: 'coin' },
      { x: 24, y: 9, type: 'brick', destructible: true },

      // High [?] block with Coin
      { x: 22, y: 5, type: 'question', content: 'coin' },

      // Pipe 1 (short, 2 blocks high) at X=28
      ...createPipe(28, 11, 2),

      // Pipe 2 (medium, 3 blocks high) at X=38
      ...createPipe(38, 10, 3),

      // Pipe 3 (Warp Pipe to Secret Room! 4 blocks high) at X=46
      ...createWarpPipe(46, 9, 4, { levelIndex: 3, targetX: 32, targetY: 10 * 16, isSecret: true }),

      // Hidden 1-Up block above pipe
      { x: 50, y: 8, type: 'question', content: '1up' },

      // Elevated brick runway with Fire Flower
      { x: 55, y: 9, type: 'brick', destructible: true },
      { x: 56, y: 9, type: 'question', content: 'flower' },
      { x: 57, y: 9, type: 'brick', destructible: true },
      { x: 58, y: 5, type: 'question', content: 'star' }, // Super Star high up!
      { x: 59, y: 9, type: 'brick', destructible: true },

      // Pipe 4 at X=63
      ...createPipe(63, 11, 2),

      // Multi-brick cluster with multi-coin block
      { x: 74, y: 9, type: 'brick', destructible: true },
      { x: 75, y: 9, type: 'brick', coins: 5, destructible: true },
      { x: 76, y: 9, type: 'question', content: 'flower' },
      { x: 77, y: 9, type: 'brick', destructible: true },

      // Pipe 5 at X=81
      ...createPipe(81, 10, 3),

      // Stairs up to pit jump (Pyramid blocks)
      ...createStairStep(92, 12, 1),
      ...createStairStep(93, 11, 2),
      ...createStairStep(94, 10, 3),
      ...createStairStep(95, 9, 4),

      ...createStairStep(98, 9, 4),
      ...createStairStep(99, 10, 3),
      ...createStairStep(100, 11, 2),
      ...createStairStep(101, 12, 1),

      // Pipe 6 with Piranha plant
      ...createPipe(108, 10, 3),

      // High question block with Star
      { x: 114, y: 9, type: 'brick', destructible: true },
      { x: 115, y: 9, type: 'question', content: 'star' },
      { x: 116, y: 9, type: 'brick', destructible: true },

      // Final staircase up to Flagpole
      ...createStairStep(142, 12, 1),
      ...createStairStep(143, 11, 2),
      ...createStairStep(144, 10, 3),
      ...createStairStep(145, 9, 4),
      ...createStairStep(146, 8, 5),
      ...createStairStep(147, 7, 6),
      ...createStairStep(148, 6, 7),
      ...createStairStep(149, 5, 8),

      // Castle hard ground
      ...createSolidRow(161, 13, 1),
    ],
    enemies: [
      { type: 'goomba', x: 22 * 16, y: 12 * 16 },
      { type: 'goomba', x: 34 * 16, y: 12 * 16 },
      { type: 'goomba', x: 36 * 16, y: 12 * 16 },
      { type: 'koopa', x: 42 * 16, y: 11 * 16, color: 'green' },
      { type: 'goomba', x: 53 * 16, y: 12 * 16 },
      { type: 'goomba', x: 55 * 16, y: 12 * 16 },
      { type: 'koopa', x: 60 * 16, y: 12 * 16, color: 'red' },
      { type: 'goomba', x: 76 * 16, y: 12 * 16 },
      { type: 'koopa', x: 79 * 16, y: 12 * 16, color: 'green' },
      { type: 'paratroopa', x: 88 * 16, y: 9 * 16, color: 'green' },
      { type: 'goomba', x: 104 * 16, y: 12 * 16 },
      { type: 'goomba', x: 106 * 16, y: 12 * 16 },
      { type: 'piranha', x: 108 * 16, y: 8 * 16 },
      { type: 'koopa', x: 120 * 16, y: 12 * 16, color: 'red' },
      { type: 'paratroopa', x: 132 * 16, y: 8 * 16, color: 'red' },
    ],
  },

  // ================= WORLD 1-2: UNDERGROUND CAVERN =================
  {
    index: 1,
    worldName: 'Dunia 1-2: Gua Bawah Tanah',
    theme: 'underground',
    skyColor: '#000000',
    timeLimit: 350,
    widthTiles: 170,
    heightTiles: 15,
    playerStartX: 32,
    playerStartY: 11 * 16,
    flagpoleTileX: 155,
    castleTileX: 160,
    blocks: [
      // Cavern Ceiling (Y=0, 1) and Floor (Y=13, 14)
      ...createRockRange(0, 170, 0),
      ...createRockRange(0, 170, 1),
      ...createRockRange(0, 50, 13),
      ...createRockRange(0, 50, 14),
      ...createRockRange(54, 110, 13), // Gap 51-53
      ...createRockRange(54, 110, 14),
      ...createRockRange(114, 170, 13), // Gap 111-113
      ...createRockRange(114, 170, 14),

      // Entrance pipe
      ...createPipe(6, 10, 3),

      // Ceiling coin run
      { x: 14, y: 5, type: 'brick', destructible: true },
      { x: 15, y: 5, type: 'brick', coins: 3, destructible: true },
      { x: 16, y: 5, type: 'question', content: 'mushroom' },
      { x: 17, y: 5, type: 'brick', destructible: true },

      // Lower question blocks
      { x: 22, y: 9, type: 'question', content: 'coin' },
      { x: 24, y: 9, type: 'question', content: 'star' },
      { x: 26, y: 9, type: 'question', content: 'coin' },

      // Pipe barricade with piranha
      ...createPipe(34, 10, 3),
      ...createPipe(42, 9, 4),
      ...createPipe(48, 8, 5),

      // Floating rock platform across pit
      ...createRockRange(51, 53, 9),

      // Elevated Brick Runway
      { x: 60, y: 8, type: 'brick', destructible: true },
      { x: 61, y: 8, type: 'brick', destructible: true },
      { x: 62, y: 8, type: 'question', content: 'flower' },
      { x: 63, y: 8, type: 'brick', destructible: true },
      { x: 64, y: 8, type: 'brick', destructible: true },

      // Piranha pipes
      ...createPipe(72, 10, 3),
      ...createPipe(80, 10, 3),
      ...createPipe(88, 10, 3),

      // Star block to sprint to the exit!
      { x: 96, y: 8, type: 'question', content: 'star' },

      // Exit Pipe leading to surface flagpole
      ...createWarpPipe(106, 9, 4, { levelIndex: 1, targetX: 120 * 16, targetY: 11 * 16 }),

      // Surface Flagpole area after pipe warp
      ...createStairStep(140, 12, 1),
      ...createStairStep(141, 11, 2),
      ...createStairStep(142, 10, 3),
      ...createStairStep(143, 9, 4),
      ...createStairStep(144, 8, 5),
      ...createStairStep(145, 7, 6),
      ...createStairStep(146, 6, 7),
    ],
    enemies: [
      { type: 'goomba', x: 18 * 16, y: 12 * 16 },
      { type: 'goomba', x: 20 * 16, y: 12 * 16 },
      { type: 'koopa', x: 28 * 16, y: 12 * 16, color: 'red' },
      { type: 'piranha', x: 34 * 16, y: 8 * 16 },
      { type: 'piranha', x: 42 * 16, y: 7 * 16 },
      { type: 'goomba', x: 62 * 16, y: 7 * 16 },
      { type: 'goomba', x: 64 * 16, y: 7 * 16 },
      { type: 'koopa', x: 76 * 16, y: 12 * 16, color: 'green' },
      { type: 'piranha', x: 80 * 16, y: 8 * 16 },
      { type: 'paratroopa', x: 92 * 16, y: 8 * 16, color: 'red' },
      { type: 'goomba', x: 100 * 16, y: 12 * 16 },
    ],
    movingPlatforms: [
      { id: 1, x: 111 * 16, y: 10 * 16, width: 48, height: 12, startX: 111 * 16, endX: 114 * 16, speed: 1.2 },
    ],
  },

  // ================= WORLD 1-3: SKY TREETOPS & FORTRESS =================
  {
    index: 2,
    worldName: 'Dunia 1-3: Puncak Langit & Benteng',
    theme: 'sky',
    skyColor: '#F87858', // Sunset glow
    timeLimit: 300,
    widthTiles: 160,
    heightTiles: 15,
    playerStartX: 32,
    playerStartY: 11 * 16,
    flagpoleTileX: 145,
    castleTileX: 150,
    blocks: [
      // Starting Island
      ...createGroundRange(0, 16),

      // Wooden bridge spans and floating mushroom platforms
      ...createBridgeSpan(18, 25, 11),
      { x: 22, y: 7, type: 'question', content: 'mushroom' },

      ...createBridgeSpan(28, 36, 9),
      { x: 31, y: 5, type: 'question', content: 'flower' },
      { x: 33, y: 5, type: 'brick', destructible: true },

      ...createBridgeSpan(40, 48, 11),
      { x: 44, y: 7, type: 'question', content: 'coin' },

      ...createBridgeSpan(52, 60, 8),
      { x: 55, y: 4, type: 'question', content: 'star' },

      ...createBridgeSpan(64, 75, 10),
      { x: 68, y: 6, type: 'brick', coins: 3, destructible: true },
      { x: 70, y: 6, type: 'question', content: 'flower' },

      ...createBridgeSpan(80, 92, 11),
      { x: 84, y: 7, type: 'question', content: '1up' },

      ...createBridgeSpan(96, 110, 9),
      { x: 102, y: 5, type: 'brick', destructible: true },
      { x: 104, y: 5, type: 'brick', destructible: true },

      // Fortress entry ground
      ...createGroundRange(118, 160),

      // Fortress Stairs
      ...createStairStep(130, 12, 1),
      ...createStairStep(131, 11, 2),
      ...createStairStep(132, 10, 3),
      ...createStairStep(133, 9, 4),
      ...createStairStep(134, 8, 5),
      ...createStairStep(135, 7, 6),
      ...createStairStep(136, 6, 7),
      ...createStairStep(137, 5, 8),
    ],
    enemies: [
      { type: 'paratroopa', x: 22 * 16, y: 8 * 16, color: 'red' },
      { type: 'koopa', x: 32 * 16, y: 7 * 16, color: 'green' },
      { type: 'paratroopa', x: 44 * 16, y: 8 * 16, color: 'green' },
      { type: 'goomba', x: 56 * 16, y: 6 * 16 },
      { type: 'paratroopa', x: 66 * 16, y: 7 * 16, color: 'red' },
      { type: 'koopa', x: 72 * 16, y: 8 * 16, color: 'red' },
      { type: 'goomba', x: 86 * 16, y: 9 * 16 },
      { type: 'paratroopa', x: 98 * 16, y: 6 * 16, color: 'red' },
      { type: 'koopa', x: 122 * 16, y: 12 * 16, color: 'red' },
    ],
    movingPlatforms: [
      { id: 1, x: 111 * 16, y: 11 * 16, width: 48, height: 12, startX: 111 * 16, endX: 116 * 16, speed: 1.5 },
    ],
  },

  // ================= SECRET COIN CAVERN =================
  {
    index: 3,
    worldName: 'Ruang Rahasia Koin Emas',
    theme: 'underground',
    skyColor: '#000000',
    timeLimit: 120,
    widthTiles: 36,
    heightTiles: 15,
    playerStartX: 32,
    playerStartY: 4 * 16,
    flagpoleTileX: 999, // No flagpole in secret room
    castleTileX: 999,
    blocks: [
      // Enclosed rock room
      ...createRockRange(0, 36, 0),
      ...createRockRange(0, 36, 1),
      ...createRockRange(0, 36, 13),
      ...createRockRange(0, 36, 14),

      // Left entrance drop
      ...createSolidRow(2, 4, 1),

      // 20 Floating golden question blocks & coins!
      { x: 8, y: 9, type: 'question', content: 'coin' },
      { x: 9, y: 9, type: 'question', content: 'coin' },
      { x: 10, y: 9, type: 'question', content: 'coin' },
      { x: 11, y: 9, type: 'question', content: 'coin' },
      { x: 12, y: 9, type: 'question', content: 'coin' },

      { x: 8, y: 5, type: 'question', content: 'coin' },
      { x: 9, y: 5, type: 'question', content: 'coin' },
      { x: 10, y: 5, type: 'question', content: 'star' },
      { x: 11, y: 5, type: 'question', content: 'coin' },
      { x: 12, y: 5, type: 'question', content: 'coin' },

      { x: 16, y: 9, type: 'question', content: 'coin' },
      { x: 17, y: 9, type: 'question', content: 'coin' },
      { x: 18, y: 9, type: 'question', content: 'coin' },
      { x: 19, y: 9, type: 'question', content: 'coin' },
      { x: 20, y: 9, type: 'question', content: '1up' },

      { x: 16, y: 5, type: 'question', content: 'coin' },
      { x: 17, y: 5, type: 'question', content: 'coin' },
      { x: 18, y: 5, type: 'question', content: 'coin' },
      { x: 19, y: 5, type: 'question', content: 'coin' },
      { x: 20, y: 5, type: 'question', content: 'coin' },

      // Exit Pipe returning to Level 1-1 at X=70
      ...createWarpPipe(28, 9, 4, { levelIndex: 0, targetX: 72 * 16, targetY: 11 * 16 }),
    ],
    enemies: [],
  },
];

/* Helper generator functions */

function createGroundRange(startTileX: number, endTileX: number) {
  const blocks: LevelData['blocks'] = [];
  for (let x = startTileX; x <= endTileX; x++) {
    blocks.push({ x, y: 13, type: 'ground' });
    blocks.push({ x, y: 14, type: 'ground' });
  }
  return blocks;
}

function createRockRange(startTileX: number, endTileX: number, tileY: number) {
  const blocks: LevelData['blocks'] = [];
  for (let x = startTileX; x <= endTileX; x++) {
    blocks.push({ x, y: tileY, type: 'rock' });
  }
  return blocks;
}

function createBridgeSpan(startTileX: number, endTileX: number, tileY: number) {
  const blocks: LevelData['blocks'] = [];
  for (let x = startTileX; x <= endTileX; x++) {
    blocks.push({ x, y: tileY, type: 'bridge' });
  }
  return blocks;
}

function createSolidRow(tileX: number, tileY: number, width: number) {
  const blocks: LevelData['blocks'] = [];
  for (let x = tileX; x < tileX + width; x++) {
    blocks.push({ x, y: tileY, type: 'ground' });
  }
  return blocks;
}

function createStairStep(tileX: number, startY: number, height: number) {
  const blocks: LevelData['blocks'] = [];
  for (let i = 0; i < height; i++) {
    blocks.push({ x: tileX, y: startY + i, type: 'brick' });
  }
  return blocks;
}

function createPipe(tileX: number, topTileY: number, height: number) {
  const blocks: LevelData['blocks'] = [];
  // Top Lip
  blocks.push({ x: tileX, y: topTileY, type: 'pipe_tl' });
  blocks.push({ x: tileX + 1, y: topTileY, type: 'pipe_tr' });
  // Body Columns
  for (let y = topTileY + 1; y < topTileY + height; y++) {
    blocks.push({ x: tileX, y, type: 'pipe_bl' });
    blocks.push({ x: tileX + 1, y, type: 'pipe_br' });
  }
  return blocks;
}

function createWarpPipe(
  tileX: number,
  topTileY: number,
  height: number,
  warp: { levelIndex: number; targetX: number; targetY: number; isSecret?: boolean }
) {
  const blocks: LevelData['blocks'] = [];
  blocks.push({ x: tileX, y: topTileY, type: 'pipe_in_tl', warp });
  blocks.push({ x: tileX + 1, y: topTileY, type: 'pipe_in_tr', warp });
  for (let y = topTileY + 1; y < topTileY + height; y++) {
    blocks.push({ x: tileX, y, type: 'pipe_bl' });
    blocks.push({ x: tileX + 1, y, type: 'pipe_br' });
  }
  return blocks;
}
