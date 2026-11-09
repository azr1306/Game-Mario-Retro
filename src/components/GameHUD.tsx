/**
 * Super Pixel Bros - Game HUD
 * Classic 8-bit style arcade scoreboard with real-time stats and power-up indicator.
 */

import React from 'react';
import { GameStats, PlayerForm } from '../game/types';

interface GameHUDProps {
  stats: GameStats;
  playerForm: PlayerForm;
  starTimer: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ stats, playerForm, starTimer }) => {
  // Pad score with leading zeroes
  const formattedScore = stats.score.toString().padStart(6, '0');
  const formattedCoins = stats.coins.toString().padStart(2, '0');
  const formattedTime = stats.timeRemaining.toString().padStart(3, '0');

  // Star countdown in seconds
  const starSeconds = Math.ceil(starTimer / 60);

  return (
    <div className="w-full bg-slate-950/95 border-b-2 border-slate-800 text-white select-none py-2 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm font-pixel tracking-wider">
        {/* Score */}
        <div className="flex flex-col items-start">
          <span className="text-red-400 text-[10px] sm:text-xs">PIXEL</span>
          <span className="text-yellow-300 font-bold tabular-nums">{formattedScore}</span>
        </div>

        {/* Coins */}
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-[10px] sm:text-xs">KOIN</span>
          <div className="flex items-center gap-1 text-amber-300 tabular-nums font-bold">
            <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-sm border border-amber-200"></span>
            <span>x{formattedCoins}</span>
          </div>
        </div>

        {/* World */}
        <div className="flex flex-col items-center">
          <span className="text-emerald-400 text-[10px] sm:text-xs">DUNIA</span>
          <span className="text-white font-bold">{stats.world}</span>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center">
          <span className="text-sky-400 text-[10px] sm:text-xs">WAKTU</span>
          <span className={`font-bold tabular-nums ${stats.timeRemaining < 50 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {formattedTime}
          </span>
        </div>

        {/* Lives & Form */}
        <div className="flex flex-col items-end">
          <span className="text-pink-400 text-[10px] sm:text-xs">NYAWA</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-red-500">❤️</span>
            <span className="text-white tabular-nums">x{stats.lives}</span>
          </div>
        </div>
      </div>

      {/* Power-Up Status Sub-Bar */}
      <div className="max-w-4xl mx-auto mt-1 flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">STATUS:</span>
          {starTimer > 0 ? (
            <span className="px-1.5 py-0.5 bg-yellow-400 text-slate-950 font-bold rounded animate-pulse">
              ⭐ BINTANG KEBAL ({starSeconds}s)
            </span>
          ) : playerForm === 'fire' ? (
            <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold rounded">
              🌸 FIRE MARIO (TEMBAK: [X])
            </span>
          ) : playerForm === 'super' ? (
            <span className="px-1.5 py-0.5 bg-amber-600 text-white font-bold rounded">
              🍄 SUPER MARIO (BALOK BATA BISA PECAH)
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
              MINI MARIO
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <span>REKOR TERTINGGI:</span>
          <span className="text-yellow-400 font-pixel">{stats.highScore.toString().padStart(6, '0')}</span>
        </div>
      </div>
    </div>
  );
};
