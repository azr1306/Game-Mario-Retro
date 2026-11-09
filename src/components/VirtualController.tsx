/**
 * Super Pixel Bros - Virtual Controller
 * Mobile & Touch arcade gamepad controls with tactile feedback and multi-touch support.
 */

import React, { useCallback } from 'react';
import { KeyState } from '../game/types';

interface VirtualControllerProps {
  onKeyChange: (key: keyof KeyState, pressed: boolean) => void;
  playerForm: string;
}

export const VirtualController: React.FC<VirtualControllerProps> = ({ onKeyChange, playerForm }) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const handlePointerDown = useCallback(
    (key: keyof KeyState) => (e: React.PointerEvent) => {
      e.preventDefault();
      triggerHaptic();
      onKeyChange(key, true);
    },
    [onKeyChange]
  );

  const handlePointerUp = useCallback(
    (key: keyof KeyState) => (e: React.PointerEvent) => {
      e.preventDefault();
      onKeyChange(key, false);
    },
    [onKeyChange]
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between select-none touch-none">
      {/* Directional D-Pad */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* D-Pad Cross Background */}
        <div className="absolute w-12 h-36 bg-slate-800 rounded-lg shadow-inner"></div>
        <div className="absolute w-36 h-12 bg-slate-800 rounded-lg shadow-inner"></div>
        <div className="absolute w-10 h-10 bg-slate-900 rounded-full z-10 shadow"></div>

        {/* Left Button */}
        <button
          type="button"
          aria-label="Gerak Kiri"
          onPointerDown={handlePointerDown('left')}
          onPointerUp={handlePointerUp('left')}
          onPointerCancel={handlePointerUp('left')}
          onPointerLeave={handlePointerUp('left')}
          className="absolute left-1 w-12 h-12 bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-200 rounded-l-lg flex items-center justify-center z-20 shadow-md font-bold text-lg border border-slate-600 transition-transform"
        >
          ◀
        </button>

        {/* Right Button */}
        <button
          type="button"
          aria-label="Gerak Kanan"
          onPointerDown={handlePointerDown('right')}
          onPointerUp={handlePointerUp('right')}
          onPointerCancel={handlePointerUp('right')}
          onPointerLeave={handlePointerUp('right')}
          className="absolute right-1 w-12 h-12 bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-200 rounded-r-lg flex items-center justify-center z-20 shadow-md font-bold text-lg border border-slate-600 transition-transform"
        >
          ▶
        </button>

        {/* Down Button (Crouch / Enter Pipe) */}
        <button
          type="button"
          aria-label="Jongkok atau Masuk Pipa"
          onPointerDown={handlePointerDown('down')}
          onPointerUp={handlePointerUp('down')}
          onPointerCancel={handlePointerUp('down')}
          onPointerLeave={handlePointerUp('down')}
          className="absolute bottom-1 w-12 h-12 bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-200 rounded-b-lg flex items-center justify-center z-20 shadow-md font-bold text-lg border border-slate-600 transition-transform"
        >
          ▼
        </button>
      </div>

      {/* Action Buttons Cluster (B and A) */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* B Button: Run / Fireball */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label="Lari Cepat atau Tembak Bola Api"
            onPointerDown={handlePointerDown('run')}
            onPointerUp={handlePointerUp('run')}
            onPointerCancel={handlePointerUp('run')}
            onPointerLeave={handlePointerUp('run')}
            className="w-16 h-16 rounded-full bg-red-600 active:bg-red-700 active:scale-90 text-white font-pixel font-bold text-sm flex flex-col items-center justify-center shadow-lg border-2 border-red-400 transition-transform"
          >
            <span>B</span>
            <span className="text-[9px] font-mono mt-0.5 opacity-90">
              {playerForm === 'fire' ? 'TEMBAK' : 'LARI'}
            </span>
          </button>
        </div>

        {/* A Button: Jump */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label="Lompat"
            onPointerDown={handlePointerDown('jump')}
            onPointerUp={handlePointerUp('jump')}
            onPointerCancel={handlePointerUp('jump')}
            onPointerLeave={handlePointerUp('jump')}
            className="w-16 h-16 rounded-full bg-emerald-600 active:bg-emerald-700 active:scale-90 text-white font-pixel font-bold text-sm flex flex-col items-center justify-center shadow-lg border-2 border-emerald-400 transition-transform"
          >
            <span>A</span>
            <span className="text-[9px] font-mono mt-0.5 opacity-90">LOMPAT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
