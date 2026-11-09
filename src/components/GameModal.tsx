/**
 * Super Pixel Bros - Game Modals & Overlays
 * Handles Title Menu, Pause, Game Over, Victory, and Power-Up Guide.
 */

import React, { useState } from 'react';
import { GameStats, GameStatus } from '../game/types';

interface GameModalProps {
  status: GameStatus;
  stats: GameStats;
  onStartGame: () => void;
  onResume: () => void;
  onRestartLevel: () => void;
  onSelectLevel: (lvlIdx: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  status,
  stats,
  onStartGame,
  onResume,
  onRestartLevel,
  onSelectLevel,
  isMuted,
  onToggleMute,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  // If in active playing or flag celebration, modal is hidden unless guide is explicitly requested
  if ((status === 'PLAYING' || status === 'FLAG_CELEBRATION') && !showGuide) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-yellow-400 rounded-xl p-6 shadow-2xl text-white relative">
        {/* ================= TITLE MENU ================= */}
        {status === 'TITLE' && !showGuide && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <span className="text-yellow-400 font-pixel text-xs tracking-widest uppercase">
                ★ 8-BIT RETRO PLATFORMER ★
              </span>
              <h1 className="text-2xl sm:text-3xl font-pixel text-yellow-300 drop-shadow-[0_4px_0_rgba(216,40,0,1)] leading-tight">
                SUPER PIXEL BROS
              </h1>
              <p className="text-slate-300 text-sm max-w-md pt-1">
                Lompat tinggi, kumpulkan koin, dapatkan power-up super, dan kalahkan musuh dengan bola api & bintang kebal!
              </p>
            </div>

            {/* Pixel Badge Showcase */}
            <div className="grid grid-cols-3 gap-2 w-full py-2">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center">
                <span className="text-2xl mb-1">🍄</span>
                <span className="font-pixel text-[10px] text-amber-300">SUPER</span>
                <span className="text-[11px] text-slate-400 text-center">Tumbuh Besar</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center">
                <span className="text-2xl mb-1">🌸</span>
                <span className="font-pixel text-[10px] text-red-400">API</span>
                <span className="text-[11px] text-slate-400 text-center">Tembak Bola Api</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center">
                <span className="text-2xl mb-1">⭐</span>
                <span className="font-pixel text-[10px] text-yellow-300">BINTANG</span>
                <span className="text-[11px] text-slate-400 text-center">Kebal 12 Detik</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={onStartGame}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-sm font-bold rounded-lg shadow-lg active:scale-98 transition-transform cursor-pointer"
              >
                ▶ MULAI PETUALANGAN
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  📖 Panduan & Kontrol
                </button>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  {isMuted ? '🔇 Audio Mati' : '🔊 Audio Nyala'}
                </button>
              </div>
            </div>

            {/* Level Select */}
            <div className="w-full pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-2 font-pixel text-[10px]">PILIH DUNIA:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectLevel(0);
                    onStartGame();
                  }}
                  className="p-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700 rounded text-xs text-emerald-300 font-pixel text-[10px] transition-colors cursor-pointer"
                >
                  Dunia 1-1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectLevel(1);
                    onStartGame();
                  }}
                  className="p-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-700 rounded text-xs text-blue-300 font-pixel text-[10px] transition-colors cursor-pointer"
                >
                  Dunia 1-2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectLevel(2);
                    onStartGame();
                  }}
                  className="p-2 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700 rounded text-xs text-amber-300 font-pixel text-[10px] transition-colors cursor-pointer"
                >
                  Dunia 1-3
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PAUSE MENU ================= */}
        {status === 'PAUSED' && !showGuide && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-pixel text-yellow-300">GAME DIJEDA</h2>
            <div className="space-y-2 text-sm text-slate-300 font-mono">
              <p>Dunia: <span className="text-white font-bold">{stats.world}</span></p>
              <p>Skor: <span className="text-yellow-400 font-bold tabular-nums">{stats.score}</span></p>
              <p>Koin: <span className="text-amber-300 font-bold tabular-nums">{stats.coins}</span></p>
              <p>Nyawa: <span className="text-red-400 font-bold tabular-nums">{stats.lives}</span></p>
            </div>

            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={onResume}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs font-bold rounded-lg shadow cursor-pointer transition-colors"
              >
                ▶ LANJUTKAN
              </button>
              <button
                type="button"
                onClick={onRestartLevel}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                🔄 Ulangi Level Ini
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                📖 Buka Panduan Kontrol & Power-Up
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                {isMuted ? '🔇 Nyalakan Suara' : '🔊 Matikan Suara'}
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME OVER ================= */}
        {status === 'GAME_OVER' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-pixel text-red-500 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
              GAME OVER
            </h2>
            <p className="text-slate-300 text-sm">
              Semua nyawa Anda telah habis! Tapi jangan menyerah, petualangan berikutnya menanti.
            </p>

            <div className="w-full bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Skor Akhir:</span>
                <span className="text-yellow-400 font-pixel font-bold">{stats.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Koin Dikumpulkan:</span>
                <span className="text-amber-300 font-bold">{stats.coins}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2">
                <span className="text-slate-400">Rekor Tertinggi:</span>
                <span className="text-emerald-400 font-pixel font-bold">{stats.highScore}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartGame}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-xs font-bold rounded-lg shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              🔄 MAIN LAGI DARI AWAL
            </button>
          </div>
        )}

        {/* ================= GAME WON ================= */}
        {status === 'GAME_WON' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="text-3xl">👑🏰🎉</span>
            <h2 className="text-2xl font-pixel text-yellow-300 drop-shadow-[0_2px_0_rgba(216,40,0,1)]">
              SELAMAT! KASTIL DIBEBASKAN!
            </h2>
            <p className="text-slate-300 text-sm">
              Luar biasa! Anda berhasil menaklukkan seluruh rintangan dan menyelesaikan semua dunia!
            </p>

            <div className="w-full bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Skor Kemenangan:</span>
                <span className="text-yellow-400 font-pixel font-bold">{stats.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Koin:</span>
                <span className="text-amber-300 font-bold">{stats.coins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sisa Nyawa:</span>
                <span className="text-red-400 font-bold">{stats.lives}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartGame}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs font-bold rounded-lg shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              ★ MAIN LAGI DARI DUNIA 1-1
            </button>
          </div>
        )}

        {/* ================= POWER-UP & CONTROLS GUIDE ================= */}
        {showGuide && (
          <div className="flex flex-col space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-pixel text-sm text-yellow-400">PANDUAN KONTROL & POWER-UP</h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Keyboard Controls */}
            <div className="space-y-2 text-xs">
              <h4 className="font-pixel text-[10px] text-emerald-400">KONTROL KEYBOARD:</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div className="bg-slate-800/80 p-2 rounded">
                  <span className="text-yellow-300 font-bold">[←] [→] / [A] [D]</span>: Gerak Kiri / Kanan
                </div>
                <div className="bg-slate-800/80 p-2 rounded">
                  <span className="text-yellow-300 font-bold">[Space] / [W] / [Z]</span>: Lompat (Tahan = Lompat Tinggi)
                </div>
                <div className="bg-slate-800/80 p-2 rounded">
                  <span className="text-yellow-300 font-bold">[Shift] / [X] / [J]</span>: Lari Cepat & Tembak Bola Api
                </div>
                <div className="bg-slate-800/80 p-2 rounded">
                  <span className="text-yellow-300 font-bold">[↓] / [S]</span>: Jongkok / Masuk Pipa Hijau
                </div>
              </div>
            </div>

            {/* Power-Up Explanations */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-pixel text-[10px] text-amber-400">SISTEM POWER-UP:</h4>
              
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 flex gap-3">
                <span className="text-2xl">🍄</span>
                <div>
                  <div className="font-bold text-amber-300">Super Mushroom</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Mengubah Mario kecil menjadi Super Mario (badan tinggi). Bisa menghancurkan balok bata dengan sundulan kepala dan tahan 1 kali pukulan musuh!
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 flex gap-3">
                <span className="text-2xl">🌸</span>
                <div>
                  <div className="font-bold text-red-400">Fire Flower</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Mengubah Mario menjadi Fire Mario (baju putih). Tekan tombol <b>Lari [X]</b> untuk menembakkan bola api memantul yang dapat mengalahkan musuh dari jarak jauh!
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 flex gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-bold text-yellow-300">Super Star (Bintang Kebal)</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Memberikan kekebalan mutlak selama 12 detik dengan kelap-kelip warna pelangi, lari lebih kencang, dan melibas semua musuh yang disentuh!
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 flex gap-3">
                <span className="text-2xl">🐢</span>
                <div>
                  <div className="font-bold text-emerald-400">Mekanisme Tempurung Koopa</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Injak kura-kura Koopa agar masuk ke dalam tempurungnya. Dekati tempurung untuk menendangnya meluncur kencang dan menghantam deretan musuh!
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 flex gap-3">
                <span className="text-2xl">🪙</span>
                <div>
                  <div className="font-bold text-yellow-400">100 Koin = 1-Up</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Kumpulkan 100 koin emas atau temukan jamur hijau rahasia untuk mendapatkan tambahan 1 Nyawa.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              KEMBALI KE PERMAINAN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
