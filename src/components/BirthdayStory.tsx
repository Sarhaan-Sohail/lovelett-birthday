import React, { useState, useEffect } from 'react';
import type { BirthdayData } from '../types/birthday';
import { PhotoSlot } from './PhotoSlot';
import { MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdayStoryProps {
  data: BirthdayData;
  isEditable?: boolean;
  onUpdatePhoto: (index: number, url: string | undefined) => void;
}

export const BirthdayStory: React.FC<BirthdayStoryProps> = ({
  data,
  isEditable = true,
  onUpdatePhoto,
}) => {
  const [scene, setScene] = useState<number>(0);
  const [leaving, setLeaving] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(false);

  // Scene 2 Cake state
  const [cp, setCp] = useState<'light' | 'wish' | 'blow' | 'done' | 'cut' | 'sliced'>('light');
  const [lit, setLit] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [outCount, setOutCount] = useState<number>(0);
  const [wishCount, setWishCount] = useState<number>(3);

  // Subscene states (Scene 3 polaroids, Scene 5 reasons, Scene 6 gift)
  const [sub, setSub] = useState<number>(0);

  // Scene 5 Reasons Scratch/Flip
  const [rev, setRev] = useState<boolean>(false);
  const [scratchedTiles, setScratchedTiles] = useState<boolean[]>(Array(40).fill(false));

  const COLS = 8;
  const ROWS = 5;

  // Palette colors
  const PALS = {
    sunset: {
      ink: '#1F1A3D', ink2: '#2E2766', deep: '#15112D', paper: '#FFF6E5',
      card: '#FFD9A8', card2: '#F5BE85', pop: '#FF7A59', soft: '#FFD9A8',
    },
    mint: {
      ink: '#0B3B3A', ink2: '#115E59', deep: '#072827', paper: '#F0FDF4',
      card: '#BDF2D5', card2: '#9BE3BB', pop: '#FF6B8A', soft: '#BDF2D5',
    },
    plum: {
      ink: '#3B0A2E', ink2: '#561042', deep: '#2A0620', paper: '#FFF1F4',
      card: '#F8C9D4', card2: '#F2B3C3', pop: '#FF5F6D', soft: '#F8C9D4',
    },
  };
  const c = PALS[data.palette] || PALS.sunset;

  const themes = [
    { bg: c.ink, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.ink, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.deep, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.ink2, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.deep, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.ink, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.deep, fg: c.soft, btnBg: c.pop, btnFg: c.ink },
    { bg: c.pop, fg: c.ink, btnBg: c.ink, btnFg: c.card },
  ];
  const th = themes[scene] || themes[0];

  // Navigation transitions
  const go = (n: number) => {
    if (leaving || n < 0 || n > 7) return;
    setLeaving(true);
    setTimeout(() => {
      setScene(n);
      setLeaving(false);
      setOpened(false);
      setCp('light');
      setLit([false, false, false]);
      setOutCount(0);
      setWishCount(3);
      setSub(n === 3 || n === 5 ? 1 : 0);
      setRev(false);
      setScratchedTiles(Array(40).fill(false));
    }, 320);
  };

  const handleOpenEnvelope = () => {
    if (opened || leaving) return;
    setOpened(true);
    setTimeout(() => go(1), 1100);
  };

  // Scene 2: Cake Logic
  const lightCandle = (idx: number) => {
    if (cp !== 'light' || lit[idx]) return;
    const next: [boolean, boolean, boolean] = [...lit];
    next[idx] = true;
    setLit(next);
    if (next.every(Boolean)) {
      setCp('wish');
      setWishCount(3);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cp === 'wish') {
      if (wishCount > 0) {
        timer = setTimeout(() => setWishCount((w) => w - 1), 1000);
      } else {
        setCp('blow');
      }
    }
    return () => clearTimeout(timer);
  }, [cp, wishCount]);

  const tapCake = () => {
    if (cp === 'blow') {
      const nextOut = outCount + 1;
      setOutCount(nextOut);
      if (nextOut >= 3) {
        setCp('done');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setCp('cut'), 2200);
      }
    } else if (cp === 'cut') {
      setCp('sliced');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    }
  };

  // Scene 5: Scratch move
  const handleScratchMove = (e: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (rev || scene !== 5) return;
    const target = e.currentTarget;
    if (!target) return;
    const r = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - r.left) / r.width;
    const y = (clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    const cx = Math.min(COLS - 1, Math.floor(x * COLS));
    const cy = Math.min(ROWS - 1, Math.floor(y * ROWS));

    const updated = [...scratchedTiles];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && Math.abs(dx) + Math.abs(dy) <= 1) {
          updated[ny * COLS + nx] = true;
        }
      }
    }
    setScratchedTiles(updated);
    const cleared = updated.filter(Boolean).length;
    if (cleared >= COLS * ROWS * 0.5) {
      setRev(true);
    }
  };

  const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const cardMode = data.cardMode === 'scratch' || data.cardMode === 'flip' ? data.cardMode : (isCoarse ? 'scratch' : 'flip');

  // Primary button logic
  let showPrimary = true;
  let primaryLabel = 'Next';
  let handlePrimary = () => go(scene + 1);

  if (scene === 0) {
    showPrimary = !opened;
    primaryLabel = 'Open it';
    handlePrimary = handleOpenEnvelope;
  } else if (scene === 2) {
    showPrimary = cp === 'sliced';
  } else if (scene === 3) {
    if (sub < 3) {
      primaryLabel = 'Next photo';
      handlePrimary = () => setSub((s) => s + 1);
    }
  } else if (scene === 5) {
    if (!rev) {
      primaryLabel = cardMode === 'flip' ? 'Flip it' : 'Reveal it';
      handlePrimary = () => setRev(true);
    } else if (sub < 4) {
      primaryLabel = 'Next reason';
      handlePrimary = () => {
        setSub((s) => s + 1);
        setRev(false);
        setScratchedTiles(Array(40).fill(false));
      };
    }
  } else if (scene === 6) {
    if (sub === 0) {
      primaryLabel = 'Pull the ribbon';
      handlePrimary = () => setSub(1);
    } else if (sub === 1) {
      primaryLabel = 'Open the box';
      handlePrimary = () => setSub(2);
    }
  } else if (scene === 7) {
    showPrimary = false;
  }

  // Helper words animator
  const renderAnimatedWords = (text: string) => {
    let charIdx = 0;
    return text.split(' ').map((word, wIdx) => (
      <span key={wIdx} className="inline-block whitespace-nowrap mx-[0.14em]">
        {word.split('').map((ch, cIdx) => {
          const delay = `${(0.3 + charIdx++ * 0.07).toFixed(2)}s`;
          return (
            <span key={cIdx} className="ch" style={{ animationDelay: delay }}>
              {ch}
            </span>
          );
        })}
      </span>
    ));
  };

  const cakeHints = {
    light: `Tap each candle to light it (${lit.filter(Boolean).length} of 3)`,
    wish: `Close your eyes and make a wish… ${wishCount}`,
    blow: outCount === 0 ? 'Now tap the cake to blow them out' : `${3 - outCount} left. Keep blowing!`,
    done: 'Wish made. Happy birthday!',
    cut: 'Now tap the cake to cut it',
    sliced: 'The first slice is yours',
  };

  const activeFlames = [0, 1, 2].filter((i) => lit[i] && i >= outCount).length;
  const glowOpacity = cp === 'wish' ? 0.35 : activeFlames * 0.09;

  return (
    <div
      style={{
        backgroundColor: th.bg,
        color: th.fg,
      }}
      className="relative overflow-hidden w-full min-h-screen flex flex-col font-dm transition-colors duration-500 selection:bg-pink-300 selection:text-black"
    >
      {/* Scene 1 Balloons */}
      {scene === 1 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[
            { left: '8%', w: 42, color: c.pop, delay: '0s', dur: '7s' },
            { left: '26%', w: 50, color: c.card, delay: '0.6s', dur: '8.5s' },
            { left: '44%', w: 46, color: '#FFC857', delay: '1.2s', dur: '7.8s' },
            { left: '62%', w: 52, color: c.card2, delay: '1.8s', dur: '8s' },
            { left: '80%', w: 44, color: c.pop, delay: '2.4s', dur: '7.2s' },
          ].map((b, idx) => (
            <div
              key={idx}
              className="balloon"
              style={{
                left: b.left,
                width: `${b.w}px`,
                height: `${Math.round(b.w * 1.25)}px`,
                backgroundColor: b.color,
                animationDelay: b.delay,
                animationDuration: b.dur,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-[560px] mx-auto px-5 pt-4 flex items-center justify-between min-h-[60px]">
        {/* Progress Dots */}
        <div className="flex items-center gap-1.5" aria-label={`Scene ${scene + 1} of 8`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === scene ? '28px' : '8px',
                opacity: i <= scene ? 1 : 0.35,
                backgroundColor: th.fg,
              }}
              className="h-2 rounded-full transition-all duration-400"
            />
          ))}
        </div>

        {/* Skip button */}
        {scene < 7 && (
          <button
            type="button"
            onClick={() => go(7)}
            style={{ borderColor: th.fg, color: th.fg }}
            className="min-h-[44px] px-4 rounded-full border bg-transparent text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
          >
            Skip
          </button>
        )}
      </header>

      {/* Main Stage Container */}
      <main className={`relative z-10 flex-1 w-full max-w-[560px] mx-auto px-6 py-4 flex flex-col items-center justify-center text-center ${leaving ? 'leave' : 'enter'}`}>
        
        {/* SCENE 0: Envelope */}
        {scene === 0 && (
          <div className="w-full flex flex-col items-center gap-6">
            <p className="up d1 m-0 text-xs tracking-widest uppercase font-medium">A gift for you</p>
            
            <div className="float w-[min(72vw,300px)]">
              <svg viewBox="0 0 220 170" className="w-full h-auto block overflow-visible">
                {/* Opened flap */}
                <g style={{ opacity: opened ? 1 : 0 }} className="transition-opacity duration-250">
                  <polygon points="20,70 110,22 200,70" fill={c.card2} />
                  <g transform="translate(0 -22) scale(1 0.95)">
                    <path
                      className={opened ? 'heartUp' : 'heartIdle'}
                      d="M110 128s-40-24-52-48c-10-22 4-44 26-44 12 0 20 6 26 16 6-10 14-16 26-16 22 0 36 22 26 44-12 24-52 48-52 48z"
                      fill="none"
                      stroke={c.pop}
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>

                {/* Envelope Base */}
                <rect x="20" y="70" width="180" height="95" fill={c.card} />
                <polygon points="20,165 110,105 200,165" fill={c.card2} opacity="0.6" />

                {/* Closed flap */}
                <g style={{ opacity: opened ? 0 : 1 }} className="transition-opacity duration-250">
                  <polygon points="20,70 110,128 200,70" fill={c.card2} />
                  <circle className="seal cursor-pointer" cx="110" cy="122" r="13" fill={c.pop} onClick={handleOpenEnvelope} />
                  <path transform="translate(100.4 112.4) scale(0.8)" d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z" fill={c.paper} />
                </g>
              </svg>
            </div>

            <h1 className="font-script font-semibold text-5xl sm:text-6xl md:text-7xl leading-tight">
              {renderAnimatedWords(`For ${data.herName}`)}
            </h1>
            <p className="up d3 text-base opacity-90">Tap the button when you're ready.</p>
          </div>
        )}

        {/* SCENE 1: Happy Birthday Callout */}
        {scene === 1 && (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="up d1 text-xs tracking-widest uppercase font-medium">Today is all yours</p>
            <h1 className="font-script font-semibold text-5xl sm:text-7xl leading-none">
              <span className="block">{renderAnimatedWords('Happy Birthday')}</span>
              <span className="block" style={{ color: c.pop }}>
                {renderAnimatedWords(`${data.herName}!`)}
              </span>
            </h1>
            <svg viewBox="0 0 200 20" width="200" height="20" className="block">
              <path className="swash" d="M4 12 C40 2, 80 20, 120 8 S180 6, 196 12" fill="none" stroke={c.pop} strokeWidth="4" strokeLinecap="round" strokeDasharray="260" />
            </svg>
            <p className="up d3 text-lg opacity-90">Let's celebrate properly.</p>
          </div>
        )}

        {/* SCENE 2: Interactive Birthday Cake */}
        {scene === 2 && (
          <div className="w-full flex flex-col items-center gap-4">
            <h2 className="font-script font-semibold text-4xl sm:text-5xl">
              {renderAnimatedWords('Make a wish')}
            </h2>

            <div className="cakeIn relative w-[min(78vw,300px)]">
              <svg viewBox="0 0 240 240" className="w-full h-auto block overflow-visible">
                <defs>
                  <g id="cakeBody">
                    <rect x="30" y="150" width="180" height="60" rx="10" fill={c.card} />
                    <path d="M30 160 q15 14 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V150 H30Z" fill={c.pop} />
                    <rect x="60" y="100" width="120" height="52" rx="10" fill={c.paper} />
                    <path d="M60 110 q10 12 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V100 H60Z" fill={c.pop} />
                  </g>
                  <clipPath id="sliceClip"><rect x="172" y="146" width="44" height="70" /></clipPath>
                </defs>

                {/* Glow */}
                <circle className="glow" cx="120" cy="52" r="80" fill="#FFC857" style={{ opacity: glowOpacity }} />
                <ellipse cx="120" cy="214" rx="104" ry="12" fill={c.ink2} />
                <use href="#cakeBody" />

                {/* Sliced piece */}
                <rect x="172" y="150" width="38" height="60" fill={c.card2} style={{ opacity: cp === 'sliced' ? 1 : 0 }} />
                <g className={cp === 'sliced' ? 'sliceOut' : ''}>
                  <g clipPath="url(#sliceClip)"><use href="#cakeBody" /></g>
                </g>

                {/* Candles */}
                <rect x="82" y="66" width="12" height="34" rx="2" fill={c.pop} />
                <rect x="114" y="66" width="12" height="34" rx="2" fill={c.card} />
                <rect x="146" y="66" width="12" height="34" rx="2" fill={c.pop} />

                {/* Wicks */}
                <rect x="87" y="59" width="2" height="8" fill={c.paper} />
                <rect x="119" y="59" width="2" height="8" fill={c.paper} />
                <rect x="151" y="59" width="2" height="8" fill={c.paper} />

                {/* Tap Guides for Unlit Candles */}
                <circle className="tap" cx="88" cy="46" r="5" fill={c.pop} style={{ opacity: cp === 'light' && !lit[0] ? 1 : 0 }} />
                <circle className="tap" cx="120" cy="46" r="5" fill={c.pop} style={{ opacity: cp === 'light' && !lit[1] ? 1 : 0 }} />
                <circle className="tap" cx="152" cy="46" r="5" fill={c.pop} style={{ opacity: cp === 'light' && !lit[2] ? 1 : 0 }} />

                {/* Flames */}
                <g transform="translate(88 62)">
                  <g className="flame" style={{ opacity: lit[0] && 0 >= outCount ? 1 : 0 }}>
                    <path d="M0 -22 C9 -10 8 0 0 2 C-8 0 -9 -10 0 -22Z" fill="#FFC857" />
                    <path d="M0 -12 C4 -6 4 -1 0 0 C-4 -1 -4 -6 0 -12Z" fill="#FF9F1C" />
                  </g>
                </g>
                <g transform="translate(120 62)">
                  <g className="flame f2" style={{ opacity: lit[1] && 1 >= outCount ? 1 : 0 }}>
                    <path d="M0 -22 C9 -10 8 0 0 2 C-8 0 -9 -10 0 -22Z" fill="#FFC857" />
                    <path d="M0 -12 C4 -6 4 -1 0 0 C-4 -1 -4 -6 0 -12Z" fill="#FF9F1C" />
                  </g>
                </g>
                <g transform="translate(152 62)">
                  <g className="flame f3" style={{ opacity: lit[2] && 2 >= outCount ? 1 : 0 }}>
                    <path d="M0 -22 C9 -10 8 0 0 2 C-8 0 -9 -10 0 -22Z" fill="#FFC857" />
                    <path d="M0 -12 C4 -6 4 -1 0 0 C-4 -1 -4 -6 0 -12Z" fill="#FF9F1C" />
                  </g>
                </g>

                {/* Smokes */}
                <circle className={outCount > 0 ? 'smoke' : 'smokeOff'} cx="88" cy="52" r="4" fill={c.soft} />
                <circle className={outCount > 1 ? 'smoke' : 'smokeOff'} cx="120" cy="52" r="4" fill={c.soft} />
                <circle className={outCount > 2 ? 'smoke' : 'smokeOff'} cx="152" cy="52" r="4" fill={c.soft} />
              </svg>

              {/* Candle hitboxes */}
              {cp === 'light' && (
                <>
                  <button type="button" aria-label="Light candle 1" onClick={() => lightCandle(0)} className="absolute left-[26%] top-[8%] w-12 h-18 bg-transparent cursor-pointer" />
                  <button type="button" aria-label="Light candle 2" onClick={() => lightCandle(1)} className="absolute left-[40%] top-[8%] w-12 h-18 bg-transparent cursor-pointer" />
                  <button type="button" aria-label="Light candle 3" onClick={() => lightCandle(2)} className="absolute left-[54%] top-[8%] w-12 h-18 bg-transparent cursor-pointer" />
                </>
              )}

              {/* Cake tap hitbox */}
              {(cp === 'blow' || cp === 'cut') && (
                <button type="button" onClick={tapCake} className="absolute inset-0 w-full h-full bg-transparent cursor-pointer" />
              )}
            </div>

            <p className="min-h-[48px] max-w-[360px] text-lg leading-relaxed">{cakeHints[cp]}</p>
          </div>
        )}

        {/* SCENE 3: Our Moments Polaroids */}
        {scene === 3 && (
          <div className="w-full flex flex-col items-center gap-6">
            <h2 className="font-script font-semibold text-4xl sm:text-5xl">
              {renderAnimatedWords('Our moments')}
            </h2>

            <div className="relative w-[min(82vw,300px)] h-[350px]">
              {sub >= 1 && (
                <div className="pol pol0 absolute left-1/2 -ml-[100px] w-[200px] p-3 pb-3.5 rounded-md shadow-2xl" style={{ backgroundColor: c.paper, color: c.ink }}>
                  <div className="h-[168px] p-1 border border-dashed flex items-center justify-center text-xs" style={{ backgroundColor: c.card, borderColor: c.ink }}>
                    <PhotoSlot
                      image={data.photos[0]?.url}
                      placeholderText={data.photos[0]?.placeholderText || 'Photo: added by him, encrypted'}
                      onImageChange={(url) => onUpdatePhoto(0, url)}
                      isEditable={isEditable}
                    />
                  </div>
                  <p className="m-0 mt-2 font-script text-xl font-semibold truncate">{data.photos[0]?.caption || '[Caption one]'}</p>
                </div>
              )}

              {sub >= 2 && (
                <div className="pol pol1 absolute left-1/2 -ml-[100px] w-[200px] p-3 pb-3.5 rounded-md shadow-2xl" style={{ backgroundColor: c.paper, color: c.ink }}>
                  <div className="h-[168px] p-1 border border-dashed flex items-center justify-center text-xs" style={{ backgroundColor: c.card, borderColor: c.ink }}>
                    <PhotoSlot
                      image={data.photos[1]?.url}
                      placeholderText={data.photos[1]?.placeholderText || 'Photo'}
                      onImageChange={(url) => onUpdatePhoto(1, url)}
                      isEditable={isEditable}
                    />
                  </div>
                  <p className="m-0 mt-2 font-script text-xl font-semibold truncate">{data.photos[1]?.caption || '[Caption two]'}</p>
                </div>
              )}

              {sub >= 3 && (
                <div className="pol pol2 absolute left-1/2 -ml-[100px] w-[200px] p-3 pb-3.5 rounded-md shadow-2xl" style={{ backgroundColor: c.paper, color: c.ink }}>
                  <div className="h-[168px] p-1 border border-dashed flex items-center justify-center text-xs" style={{ backgroundColor: c.card, borderColor: c.ink }}>
                    <PhotoSlot
                      image={data.photos[2]?.url}
                      placeholderText={data.photos[2]?.placeholderText || 'Photo'}
                      onImageChange={(url) => onUpdatePhoto(2, url)}
                      isEditable={isEditable}
                    />
                  </div>
                  <p className="m-0 mt-2 font-script text-xl font-semibold truncate">{data.photos[2]?.caption || '[Caption three]'}</p>
                </div>
              )}
            </div>

            <p className="text-base">{sub < 3 ? 'Tap Next photo for another moment.' : 'Three of my favourite moments.'}</p>
          </div>
        )}

        {/* SCENE 4: Parchment Letter with Wax Seal */}
        {scene === 4 && (
          <div className="w-full flex flex-col items-center gap-5">
            <p className="up d1 text-xs tracking-widest uppercase font-medium">I wrote this for you</p>

            <div className="paperIn relative w-full max-w-[440px] rounded p-6 sm:p-8 text-left shadow-2xl bg-[#F6EEDC] text-[#23232E]">
              {/* Border accents */}
              <div className="absolute inset-2 border border-[#B8923A]/50 pointer-events-none" />
              <div className="absolute top-[74px] bottom-0 left-[46px] w-[3px] border-l border-[#8B2E3C]/55 border-r border-[#8B2E3C]/35 pointer-events-none" />

              {/* Initials header */}
              <div className="flex items-center justify-center gap-3.5 h-[50px] mb-4">
                <div className="flex-1 h-[1px] bg-[#B8923A]/70" />
                <span className="font-cormorant text-lg font-semibold tracking-widest text-[#9A7424]">
                  {data.hisName[0]?.toUpperCase()} & {data.herName[0]?.toUpperCase()}
                </span>
                <div className="flex-1 h-[1px] bg-[#B8923A]/70" />
              </div>

              {/* Letter content */}
              <div className="pl-8 font-cormorant italic text-lg leading-relaxed space-y-4">
                <p className="hw h1 text-right text-sm">{data.letterDate || '[Date]'}</p>
                <p className="hw h2 font-pinyon not-italic text-3xl leading-none">My dearest {data.herName},</p>
                {data.letterParagraphs.map((para, pIdx) => (
                  <p key={pIdx} className={`hw h${pIdx + 3}`}>{para}</p>
                ))}
                <p className="hw h6 not-italic pt-2">Forever yours,</p>
                <p className="hw h7 font-pinyon not-italic text-4xl text-[#1C2A4A] leading-tight">{data.hisName}</p>
              </div>

              {/* Wax Seal Stamp */}
              <div className="stamp absolute right-6 -bottom-6 w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full block drop-shadow-md">
                  <path d="M50 5 C63 3 74 9 82 17 C91 26 97 38 94 51 C97 63 91 75 82 83 C73 92 61 97 49 95 C37 97 25 91 17 82 C8 73 3 61 6 49 C3 37 9 25 18 17 C27 9 38 7 50 5Z" fill="#7A1F2B" />
                  <circle cx="50" cy="50" r="31" fill="none" stroke="#A03C4B" strokeWidth="2" />
                  <text x="50" y="63" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="40" fontWeight="600" fill="#5A1520">
                    {data.hisName[0]?.toUpperCase()}
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 5: Reasons I Love You (Flip & Scratch) */}
        {scene === 5 && (
          <div className="w-full flex flex-col items-center gap-4">
            <h2 className="font-script font-semibold text-4xl sm:text-5xl">
              {renderAnimatedWords('Reasons I love you')}
            </h2>

            <div className="cardDeal flex flex-col items-center gap-3 w-full">
              <p className="text-xs tracking-widest uppercase opacity-80">Reason {sub} of 4</p>

              {/* Touch Scratch Card Mode */}
              {cardMode === 'scratch' ? (
                <div
                  onPointerDown={handleScratchMove}
                  onPointerMove={handleScratchMove}
                  onTouchMove={handleScratchMove}
                  style={{ backgroundColor: c.ink2, borderColor: c.pop }}
                  className="relative w-[min(86vw,380px)] h-[210px] rounded-2xl overflow-hidden touch-none select-none border-2 box-border shadow-xl cursor-crosshair"
                >
                  <div className="absolute inset-0 flex items-center justify-center gap-3.5 px-6 text-left">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill={c.pop} className="shrink-0">
                      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z" />
                    </svg>
                    <span className="text-lg leading-snug">{data.reasons[sub - 1] || '[Reason]'}</span>
                  </div>

                  {/* 8x5 Scratch Tiles Grid */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-5 pointer-events-none">
                    {scratchedTiles.map((cleared, tIdx) => (
                      <div
                        key={tIdx}
                        style={{
                          backgroundColor: (tIdx + Math.floor(tIdx / COLS)) % 2 ? c.card : c.card2,
                          opacity: rev || cleared ? 0 : 1,
                        }}
                        className="transition-opacity duration-300"
                      />
                    ))}
                  </div>

                  {/* Scratch here label */}
                  <div
                    style={{
                      opacity: rev || scratchedTiles.some(Boolean) ? 0 : 1,
                      color: c.ink,
                    }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none font-script text-3xl font-semibold transition-opacity duration-300"
                  >
                    Scratch here
                  </div>
                </div>
              ) : (
                /* Laptop Mouse Flip Card Mode */
                <div className="fWrap w-[min(86vw,380px)] h-[210px]">
                  <button
                    type="button"
                    onClick={() => setRev(true)}
                    className={`fIn ${rev ? 'flipped' : ''} relative block w-full h-full p-0 border-0 bg-transparent text-inherit cursor-pointer`}
                  >
                    <span
                      style={{ background: `linear-gradient(135deg, ${c.card}, ${c.card2})`, color: c.ink }}
                      className="fFace flex-col gap-2 shadow-xl"
                    >
                      <span className="font-script text-3xl font-semibold">A reason</span>
                      <span className="text-xs uppercase tracking-widest opacity-80">Click to flip</span>
                    </span>

                    <span
                      style={{ backgroundColor: c.ink2, borderColor: c.pop }}
                      className="fFace fBack border-2 p-6 gap-3.5 text-left shadow-xl"
                    >
                      <svg viewBox="0 0 24 24" width="26" height="26" fill={c.pop} className="shrink-0">
                        <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z" />
                      </svg>
                      <span style={{ color: c.soft }} className="text-lg leading-snug">
                        {data.reasons[sub - 1] || '[Reason]'}
                      </span>
                    </span>
                  </button>
                </div>
              )}

              <p className="text-base min-h-[24px]">
                {rev ? 'That one is true.' : cardMode === 'flip' ? 'Click the card to flip it.' : 'Scratch the foil with your finger.'}
              </p>

              {/* Progress hearts */}
              <div className="flex gap-2 text-xl" style={{ color: c.pop }}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} style={{ opacity: n < sub || (n === sub && rev) ? 1 : 0.25 }} className="transition-opacity duration-300">
                    ♥
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCENE 6: Gift Box Unwrap */}
        {scene === 6 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="cakeIn w-[min(64vw,240px)]">
              <svg viewBox="0 0 240 230" className="w-full h-auto block overflow-visible">
                {/* Light beam */}
                <polygon points="70,122 170,122 206,8 34,8" fill="#FFC857" style={{ opacity: sub >= 2 ? 0.22 : 0 }} className="transition-opacity duration-500" />

                {/* Box body */}
                <rect x="40" y="120" width="160" height="90" rx="6" fill={c.pop} />
                <rect x="110" y="120" width="20" height="90" fill={c.paper} />

                {/* Box lid */}
                <g className={sub >= 2 ? 'lidOpen' : ''}>
                  <rect x="32" y="92" width="176" height="32" rx="6" fill={c.pop} />
                  <rect x="110" y="92" width="20" height="32" fill={c.paper} />
                </g>

                {/* Bow */}
                <g className={sub >= 1 ? 'bowOff' : ''}>
                  <ellipse cx="100" cy="84" rx="20" ry="12" fill={c.paper} transform="rotate(-20 100 84)" />
                  <ellipse cx="140" cy="84" rx="20" ry="12" fill={c.paper} transform="rotate(20 140 84)" />
                  <circle cx="120" cy="88" r="8" fill={c.card2} />
                </g>

                {/* Sparkles */}
                {sub >= 2 && (
                  <>
                    <g transform="translate(40 40)"><path className="spark" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#FFC857" /></g>
                    <g transform="translate(206 52)"><path className="spark sp2" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#FFC857" /></g>
                    <g transform="translate(70 12)"><path className="spark sp3" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#FFC857" /></g>
                    <g transform="translate(176 20)"><path className="spark sp4" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#FFC857" /></g>
                  </>
                )}
              </svg>
            </div>

            {sub >= 2 ? (
              <div className="flex flex-col items-center gap-2">
                <h2 className="font-script font-semibold text-5xl">Surprise!</h2>
                <p className="up d3 max-w-[360px] text-lg leading-relaxed">{data.giftDescription}</p>
              </div>
            ) : (
              <p className="up d2 max-w-[340px] text-lg leading-relaxed">
                {sub === 0 ? 'One more thing… it is wrapped just for you.' : 'The ribbon is off. Go on, open it.'}
              </p>
            )}
          </div>
        )}

        {/* SCENE 7: Finale & WhatsApp Reply */}
        {scene === 7 && (
          <div className="w-full flex flex-col items-center gap-6">
            <h1 className="font-script font-semibold text-5xl sm:text-7xl leading-tight">
              {renderAnimatedWords(`Happy birthday, ${data.herName}`)}
            </h1>
            <p className="up d3 text-lg opacity-90">{data.closingLine}</p>

            {/* Final WhatsApp Reply Section */}
            <div className="w-full max-w-md mx-auto mt-4 p-6 rounded-3xl shadow-2xl" style={{ backgroundColor: c.card, color: c.ink }}>
              <h3 className="font-script text-3xl font-bold mb-2">Send him your reply</h3>
              <p className="text-xs opacity-75 mb-4">Tell him how you felt opening this. He will see it privately.</p>

              <button
                type="button"
                onClick={() => {
                  confetti({ particleCount: 70, spread: 60 });
                  const cleanPhone = (data.partnerPhoneNumber || '').replace(/[^0-9]/g, '');
                  const text = encodeURIComponent(`💌 Happy Birthday response for ${data.hisName}!\n\nI opened your birthday story and loved every bit of it! 💕`);
                  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
                  window.open(waUrl, '_blank');
                }}
                style={{ backgroundColor: c.ink, color: c.card }}
                className="w-full py-3.5 px-6 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle size={18} className="text-[#25D366]" />
                <span>Reply on WhatsApp</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="relative z-10 w-full max-w-[560px] mx-auto px-5 pb-7 flex items-center justify-between gap-3 min-h-[88px]">
        {scene > 0 ? (
          <button
            type="button"
            onClick={() => go(scene - 1)}
            style={{ borderColor: th.fg, color: th.fg }}
            className="min-h-[52px] px-6 rounded-full border bg-transparent text-base font-bold cursor-pointer hover:opacity-80 transition-opacity"
          >
            Back
          </button>
        ) : <div />}

        {showPrimary && (
          <button
            type="button"
            onClick={handlePrimary}
            style={{ backgroundColor: th.btnBg, color: th.btnFg }}
            className="ml-auto min-h-[52px] px-8 rounded-full border-0 text-base font-bold shadow-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            {primaryLabel}
          </button>
        )}
      </footer>

    </div>
  );
};
