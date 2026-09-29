import React from 'react';
import { Volume2, VolumeX, Music, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TopBarProps {
  activeTab: 'snow' | 'mine' | 'decor' | 'craft' | 'quests';
  onTabChange: (tab: 'snow' | 'mine' | 'decor' | 'craft' | 'quests') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
  onReset: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  isBgmActive,
  onToggleBgm,
  onReset,
}) => {
  const navTabs: { id: 'snow' | 'mine' | 'decor' | 'craft' | 'quests'; label: string; icon: string }[] = [
    { id: 'snow', label: '白雪公主', icon: '🍎' },
    { id: 'mine', label: '七矮人礦坑', icon: '⛏️' },
    { id: 'decor', label: '城堡花園布置', icon: '🏰' },
    { id: 'craft', label: '烘焙與背包', icon: '🥧' },
    { id: 'quests', label: '皇家心願清單', icon: '📜' },
  ];

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-['Cinzel',_serif] text-base md:text-xl font-bold tracking-wide text-amber-300 whitespace-nowrap">
            迪士尼夢幻星谷
          </span>
        </div>

        {/* Zone 2: Navigation tabs */}
        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto py-1 no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.play('place');
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Audio & Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBgm}
            title={isBgmActive ? '暫停背景仙境音樂' : '播放背景仙境音樂 (豎琴旋律)'}
            className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer border ${
              isBgmActive
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">{isBgmActive ? '音樂開' : '音樂關'}</span>
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? '解除音效靜音' : '音效靜音'}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onReset}
            title="重新開始新旅程"
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
