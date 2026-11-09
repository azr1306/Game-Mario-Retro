/**
 * Super Pixel Bros - Main Application
 * Retro Pixel Art Platformer with dynamic jumping mechanics and exciting power-ups.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { sound } from './game/audio';
import { GameHUD } from './components/GameHUD';
import { VirtualController } from './components/VirtualController';
import { GameModal } from './components/GameModal';
import { GameStats, GameStatus, KeyState, PlayerForm } from './game/types';
import { Volume2, VolumeX, Maximize2, RotateCcw, HelpCircle, Pause, Play, Monitor } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    lives: 3,
    world: '1-1',
    levelIndex: 0,
    timeRemaining: 300,
    highScore: 0,
  });

  const [playerForm, setPlayerForm] = useState<PlayerForm>('small');
  const [starTimer, setStarTimer] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [enableCrt, setEnableCrt] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Initialize engine and start loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    // Native virtual resolution: 400x240 (15 vertical tiles of 16px)
    canvas.width = 400;
    canvas.height = 240;

    const engine = new GameEngine(canvas, (newStats, newStatus) => {
      setStats({ ...newStats });
      setStatus(newStatus);
      if (engineRef.current) {
        setPlayerForm(engineRef.current.player.form);
        setStarTimer(engineRef.current.player.starTimer);
      }
    });

    engineRef.current = engine;
    engine.startLoop();

    return () => {
      engine.stopLoop();
      sound.stopBgm();
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;

      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
      }

      if (code === 'ArrowLeft' || code === 'KeyA') {
        engine.setKeyState('left', true);
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        engine.setKeyState('right', true);
      } else if (code === 'ArrowUp' || code === 'Space' || code === 'KeyW' || code === 'KeyZ') {
        engine.setKeyState('jump', true);
      } else if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX' || code === 'KeyJ') {
        engine.setKeyState('run', true);
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        engine.setKeyState('down', true);
      } else if (code === 'KeyP' || code === 'Escape') {
        engine.togglePause();
      } else if (code === 'KeyM') {
        const muted = sound.toggleMute();
        setIsMuted(muted);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') {
        engine.setKeyState('left', false);
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        engine.setKeyState('right', false);
      } else if (code === 'ArrowUp' || code === 'Space' || code === 'KeyW' || code === 'KeyZ') {
        engine.setKeyState('jump', false);
      } else if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX' || code === 'KeyJ') {
        engine.setKeyState('run', false);
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        engine.setKeyState('down', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gamepad Polling Loop (Optional Gamepad API support)
  useEffect(() => {
    let animId: number;

    const pollGamepads = () => {
      const engine = engineRef.current;
      if (engine && typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp) {
          // Standard Gamepad mapping:
          // Buttons: 0=A (Jump), 1=B/2=X (Run/Fire), 14=Dpad Left, 15=Dpad Right, 13=Dpad Down
          const dpadLeft = gp.buttons[14]?.pressed || gp.axes[0] < -0.4;
          const dpadRight = gp.buttons[15]?.pressed || gp.axes[0] > 0.4;
          const dpadDown = gp.buttons[13]?.pressed || gp.axes[1] > 0.4;
          const jumpBtn = gp.buttons[0]?.pressed || gp.buttons[1]?.pressed;
          const runBtn = gp.buttons[2]?.pressed || gp.buttons[3]?.pressed;

          engine.setKeyState('left', dpadLeft);
          engine.setKeyState('right', dpadRight);
          engine.setKeyState('down', dpadDown);
          engine.setKeyState('jump', jumpBtn);
          engine.setKeyState('run', runBtn);
        }
      }
      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleVirtualKeyChange = useCallback((key: keyof KeyState, pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.setKeyState(key, pressed);
    }
  }, []);

  const handleStartGame = () => {
    setShowGuideModal(false);
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleResume = () => {
    setShowGuideModal(false);
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleRestartLevel = () => {
    setShowGuideModal(false);
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  };

  const handleSelectLevel = (levelIndex: number) => {
    if (engineRef.current) {
      engineRef.current.loadLevel(levelIndex);
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between font-sans selection:bg-yellow-400 selection:text-slate-950">
      {/* Top Header & Brand Contract */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-4 select-none z-30">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍄</span>
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-yellow-400 font-bold tracking-tight">
              SUPER PIXEL BROS
            </h1>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
              Edisi Retro 8-Bit · Warna Cerah & Power-Up
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Pause / Resume Button */}
          {status === 'PLAYING' && (
            <button
              type="button"
              onClick={() => engineRef.current?.togglePause()}
              title="Jeda Permainan (P)"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {status === 'PAUSED' && (
            <button
              type="button"
              onClick={handleResume}
              title="Lanjutkan Permainan (P)"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          {/* Restart Level */}
          <button
            type="button"
            onClick={handleRestartLevel}
            title="Ulangi Level"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* CRT Scanline Toggle */}
          <button
            type="button"
            onClick={() => setEnableCrt(!enableCrt)}
            title="Efek Layar CRT TV Retro"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              enableCrt ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* How to Play Guide Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            title="Panduan Power-Up & Kontrol"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title="Layar Penuh"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer hidden sm:block"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Arcade Cabinet / Game Canvas Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl">
        {/* Arcade Frame Container */}
        <div className="w-full relative bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Top Scoreboard HUD */}
          <GameHUD stats={stats} playerForm={playerForm} starTimer={starTimer} />

          {/* Screen Wrapper with Fixed Aspect Ratio (400:240 = 5:3) */}
          <div className="relative w-full aspect-[5/3] bg-black overflow-hidden flex items-center justify-center">
            {/* HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full pixel-art block"
              style={{
                imageRendering: 'pixelated',
              }}
            />

            {/* Optional CRT Scanline Shader Overlay */}
            {enableCrt && <div className="absolute inset-0 crt-overlay pointer-events-none z-10 opacity-70"></div>}
          </div>
        </div>

        {/* Desktop Controls Quick Reminder Strip */}
        <div className="w-full mt-2 hidden sm:flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
          <div>
            <span className="text-slate-300 font-bold">[←/→]</span> Gerak · <span className="text-slate-300 font-bold">[Space/W]</span> Lompat · <span className="text-slate-300 font-bold">[Shift/X]</span> Lari/Tembak · <span className="text-slate-300 font-bold">[↓/S]</span> Masuk Pipa
          </div>
          <div>
            <span className="text-yellow-400 font-bold">Tips:</span> Injak kura-kura lalu tendang tempurungnya untuk sapu bersih musuh!
          </div>
        </div>

        {/* Virtual Gamepad for Mobile & Touch Devices */}
        <div className="w-full mt-2 sm:hidden">
          <VirtualController onKeyChange={handleVirtualKeyChange} playerForm={playerForm} />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-2.5 px-4 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>Super Pixel Bros</span>
          <span aria-hidden="true">·</span>
          <span>Fisika Lompat Dinamis</span>
          <span aria-hidden="true">·</span>
          <span>Sistem Jamur, Bunga Api & Bintang Kebal</span>
          <span aria-hidden="true">·</span>
          <span>Audio Sintesis 8-Bit Web Audio API</span>
        </p>
      </footer>

      {/* Game Modals: Title Menu, Pause, Game Over, Won, and Guide */}
      <GameModal
        status={showGuideModal ? 'PAUSED' : status}
        stats={stats}
        onStartGame={handleStartGame}
        onResume={handleResume}
        onRestartLevel={handleRestartLevel}
        onSelectLevel={handleSelectLevel}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}
