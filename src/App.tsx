import { useState } from 'react';
import type { BirthdayData } from './types/birthday';
import { defaultBirthdayData } from './types/birthday';
import { BirthdayStory } from './components/BirthdayStory';
import { Edit3, Eye, Share2, Check, Palette } from 'lucide-react';
import lovelettLogo from './assets/logo.svg';

export function App() {
  const [data, setData] = useState<BirthdayData>(() => {
    try {
      const saved = localStorage.getItem('lovelett_birthday_data');
      if (saved) return { ...defaultBirthdayData, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return defaultBirthdayData;
  });

  const [mode, setMode] = useState<'story' | 'edit'>('story');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleUpdatePhoto = (index: number, url: string | undefined) => {
    setData((prev) => {
      const updatedPhotos = [...prev.photos];
      if (updatedPhotos[index]) {
        updatedPhotos[index] = { ...updatedPhotos[index], url };
      }
      return { ...prev, photos: updatedPhotos };
    });
  };

  const handleUpdateField = (field: keyof BirthdayData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="relative min-h-screen">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between text-white">
        <div className="flex min-w-0 items-center gap-2">
  <img
    src={lovelettLogo}
    alt=""
    aria-hidden="true"
    className="h-8 w-8 shrink-0 object-contain"
  />
  <span
    className="shrink-0 text-xl leading-none"
    style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}
  >
    Lovelett
  </span>
  <span className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider sm:text-[10px]">
    Birthday Story
  </span>
</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === 'edit' ? 'story' : 'edit')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            {mode === 'edit' ? (
              <>
                <Eye size={13} />
                <span className="hidden sm:inline">View Story</span>
              </>
            ) : (
              <>
                <Edit3 size={13} />
                <span className="hidden sm:inline">Customize</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-600 hover:bg-pink-500 transition-all cursor-pointer"
          >
            {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </header>


      {mode === 'edit' ? (
        <div className="max-w-xl mx-auto py-8 px-4 text-white">
          <div className="bg-[#1E1738] border border-white/10 rounded-3xl p-6 space-y-5">
            <h2 className="text-xl font-bold">Customize Birthday Story</h2>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs opacity-70 mb-1">Her Name</label>
                <input
                  type="text"
                  value={data.herName}
                  onChange={(e) => handleUpdateField('herName', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs opacity-70 mb-1">His Name</label>
                <input
                  type="text"
                  value={data.hisName}
                  onChange={(e) => handleUpdateField('hisName', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs opacity-70 mb-1.5 flex items-center gap-1">
                <Palette size={13} />
                <span>Color Palette</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['sunset', 'mint', 'plum'] as const).map((pal) => (
                  <button
                    key={pal}
                    type="button"
                    onClick={() => handleUpdateField('palette', pal)}
                    className={`py-2 px-3 rounded-xl border text-xs capitalize cursor-pointer transition-all ${
                      data.palette === pal ? 'border-pink-400 bg-pink-500/20 font-bold' : 'border-white/10 bg-black/20'
                    }`}
                  >
                    {pal}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Interaction Mode */}
            <div>
              <label className="block text-xs opacity-70 mb-1.5">Reasons Card Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['auto', 'scratch', 'flip'] as const).map((modeOption) => (
                  <button
                    key={modeOption}
                    type="button"
                    onClick={() => handleUpdateField('cardMode', modeOption)}
                    className={`py-2 px-3 rounded-xl border text-xs capitalize cursor-pointer transition-all ${
                      data.cardMode === modeOption ? 'border-pink-400 bg-pink-500/20 font-bold' : 'border-white/10 bg-black/20'
                    }`}
                  >
                    {modeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs opacity-70 mb-1">WhatsApp # (for replies)</label>
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={data.partnerPhoneNumber || ''}
                onChange={(e) => handleUpdateField('partnerPhoneNumber', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            {/* Gift surprise */}
            <div>
              <label className="block text-xs opacity-70 mb-1">Gift Description (Scene 6)</label>
              <input
                type="text"
                value={data.giftDescription}
                onChange={(e) => handleUpdateField('giftDescription', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => setMode('story')}
              className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-full font-bold text-sm cursor-pointer"
            >
              Done & View Story
            </button>
          </div>
        </div>
      ) : (
        <BirthdayStory
          data={data}
          onUpdatePhoto={handleUpdatePhoto}
        />
      )}
    </div>
  );
}

export default App;
