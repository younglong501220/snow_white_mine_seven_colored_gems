import React, { useState } from 'react';
import { Pickaxe, Sparkles, Zap, Flame, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dwarf, GemType } from '../types/game';
import { DWARFS, GEMS } from '../data/gameData';
import { sounds } from '../utils/audio';

interface MinePanelProps {
  stamina: number;
  maxStamina: number;
  coins: number;
  selectedDwarfId: string;
  onSelectDwarf: (dwarfId: string) => void;
  onMineGem: (gem: GemType, amount: number, staminaCost: number, coinsBonus: number) => void;
  onSneezeBlast: (gems: { type: GemType; amount: number }[]) => void;
  sneezyCharge: number;
  onSetSneezyCharge: React.Dispatch<React.SetStateAction<number>>;
}

export const MinePanel: React.FC<MinePanelProps> = ({
  stamina,
  maxStamina,
  coins,
  selectedDwarfId,
  onSelectDwarf,
  onMineGem,
  onSneezeBlast,
  sneezyCharge,
  onSetSneezyCharge,
}) => {
  const [isStriking, setIsStriking] = useState(false);
  const [mineLog, setMineLog] = useState<string>('帶著鎬子敲擊深層礦脈吧！七彩水晶正在閃爍...');
  const [floatingText, setFloatingText] = useState<{ id: number; text: string; color: string; x: number; y: number }[]>([]);
  const [veinHealth, setVeinHealth] = useState<number>(100);
  const [combo, setCombo] = useState<number>(0);

  const activeDwarf = DWARFS.find((d) => d.id === selectedDwarfId) || DWARFS[0];

  // Helper to add floating texts
  const addFloating = (text: string, color: string) => {
    const id = Date.now() + Math.random();
    setFloatingText((prev) => [...prev, { id, text, color, x: 50 + (Math.random() * 20 - 10), y: 50 + (Math.random() * 20 - 10) }]);
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  const handleStrike = () => {
    // Stamina cost calculation
    let cost = 10;
    if (activeDwarf.bonus === 'stamina') {
      cost = 5; // Grumpy half cost
    }

    // Sleepy energy restore chance
    let isFreeStrike = false;
    if (activeDwarf.bonus === 'energy_restore' && Math.random() < 0.3) {
      isFreeStrike = true;
      cost = 0;
      addFloating('😴 夢中靈感! 免費揮鎬 +2體力', '#818cf8');
    }

    if (!isFreeStrike && stamina < cost) {
      sounds.play('crit');
      setMineLog('⚠️ 體力不足！請吃一塊星光蘋果派，或請白雪公主一起唱歌恢復體力！');
      return;
    }

    setIsStriking(true);
    setTimeout(() => setIsStriking(false), 220);

    // Roll gem
    const roll = Math.random();
    let pickedGem: GemType = 'ruby';

    // Rarity table
    if (activeDwarf.bonus === 'rare') {
      // Doc bonus
      if (roll < 0.05) pickedGem = 'prismatic';
      else if (roll < 0.22) pickedGem = 'diamond';
      else if (roll < 0.40) pickedGem = 'amethyst';
      else if (roll < 0.60) pickedGem = 'topaz';
      else if (roll < 0.75) pickedGem = 'emerald';
      else if (roll < 0.88) pickedGem = 'sapphire';
      else pickedGem = 'ruby';
    } else {
      if (roll < 0.02) pickedGem = 'prismatic';
      else if (roll < 0.10) pickedGem = 'diamond';
      else if (roll < 0.25) pickedGem = 'amethyst';
      else if (roll < 0.45) pickedGem = 'topaz';
      else if (roll < 0.65) pickedGem = 'emerald';
      else if (roll < 0.85) pickedGem = 'sapphire';
      else pickedGem = 'ruby';
    }

    // Amount roll
    let amount = 1;
    if (activeDwarf.bonus === 'double' && Math.random() < 0.4) {
      amount = 2;
      addFloating('🤪 糊塗蛋幸運 x2 掉落！', '#a3e635');
    }

    // Happy bonus coins
    let bonusCoins = 0;
    if (activeDwarf.bonus === 'coin') {
      bonusCoins = Math.floor(Math.random() * 15) + 15;
      sounds.play('coin');
      addFloating(`😄 開心果 +${bonusCoins} 星光幣`, '#fde047');
    }

    // Sneezy charge
    const chargeGain = activeDwarf.id === 'sneezy' ? 25 : 12;
    onSetSneezyCharge((prev) => Math.min(100, prev + chargeGain));

    // Sound
    if (pickedGem === 'prismatic' || pickedGem === 'diamond') {
      sounds.play('crit');
      setTimeout(() => sounds.play('gem'), 150);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else {
      sounds.play('mine');
      setTimeout(() => sounds.play('gem'), 100);
    }

    const gemData = GEMS[pickedGem];
    addFloating(`+${amount} ${gemData.name} ${gemData.symbol}`, gemData.color);

    // Vein damage & health
    setVeinHealth((prev) => {
      const next = prev - 20;
      if (next <= 0) {
        sounds.play('crit');
        return 100;
      }
      return next;
    });

    const newCombo = combo + 1;
    setCombo(newCombo);

    let logMessage = `⛏️ 敲擊礦石！獲得了 【${amount} 顆 ${gemData.name} ${gemData.symbol}】！`;
    if (bonusCoins > 0) logMessage += ` (開心果額外為你收集了 ${bonusCoins} 星光幣🪙)`;
    setMineLog(logMessage);

    onMineGem(pickedGem, amount, cost, bonusCoins);
  };

  const handleTriggerSneeze = () => {
    if (sneezyCharge < 100) return;
    sounds.play('blast');
    onSetSneezyCharge(0);

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7'],
    });

    const blastGems: { type: GemType; amount: number }[] = [
      { type: 'diamond', amount: 1 },
      { type: 'amethyst', amount: 2 },
      { type: Math.random() < 0.3 ? 'prismatic' : 'topaz', amount: 1 },
    ];

    onSneezeBlast(blastGems);
    setMineLog('🤧 轟隆！噴嚏精的驚天巨響震碎整座礦脈壁！崩落了傳奇鑽石與珍奇寶石群！');
    addFloating('💥 震地噴嚏連鎖大爆發！', '#fb923c');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Dwarf Companion Selection Bar */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-['Cinzel',_serif] text-base md:text-lg font-bold text-amber-200">
              選擇同行的小矮人夥伴 (The Seven Dwarfs)
            </h3>
            <p className="text-xs text-slate-400">
              每位小矮人都擁有獨一無二的採礦專長與加成效果
            </p>
          </div>
          <div className="text-xs text-slate-400">
            目前同行: <span className="text-amber-300 font-semibold">{activeDwarf.name} ({activeDwarf.title})</span>
          </div>
        </div>

        {/* 7 Dwarfs Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {DWARFS.map((dwarf) => {
            const isSelected = dwarf.id === selectedDwarfId;
            return (
              <button
                key={dwarf.id}
                onClick={() => {
                  sounds.play('place');
                  onSelectDwarf(dwarf.id);
                }}
                className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-md shadow-amber-500/20 scale-[1.03]'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <span className="text-2xl md:text-3xl mb-1">{dwarf.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap">{dwarf.name}</span>
                <span className="text-[10px] text-amber-300/90 font-medium truncate max-w-full">
                  {dwarf.skillName}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {dwarf.skillDesc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Dwarf Quote Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3 text-xs text-slate-300">
          <span className="text-xl">{activeDwarf.icon}</span>
          <span className="italic font-medium">{activeDwarf.quote}</span>
        </div>
      </div>

      {/* Main Mine Stage with Enchanted Cave Background */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl min-h-[460px] flex flex-col justify-between p-6">
        {/* Cave Image Background with Scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url('/src/assets/images/gem_mine_cave_1790692295627.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/40 -z-10" />

        {/* Top Cavern Stats & Meters */}
        <div className="flex items-center justify-between flex-wrap gap-4 z-10">
          {/* Vein Durability */}
          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>當前礦脈晶層強度</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all"
                  style={{ width: `${veinHealth}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate-200">{veinHealth}%</span>
            </div>
          </div>

          {/* Sneezy Sneez-O-Meter */}
          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <div>
              <div className="text-[11px] text-orange-300 font-semibold mb-1 flex items-center gap-1">
                <span>🤧 噴嚏精蓄力條</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                    style={{ width: `${sneezyCharge}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-orange-200">{sneezyCharge}%</span>
              </div>
            </div>

            {sneezyCharge >= 100 && (
              <button
                onClick={handleTriggerSneeze}
                className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-orange-500/40 animate-pulse hover:scale-105 cursor-pointer"
              >
                觸發大噴嚏！💥
              </button>
            )}
          </div>
        </div>

        {/* Center Interactive Mining Ore Vein */}
        <div className="relative flex flex-col items-center justify-center my-6 z-10">
          {/* Floating Indicators */}
          {floatingText.map((f) => (
            <div
              key={f.id}
              className="absolute pointer-events-none font-bold text-base md:text-lg animate-float-fade"
              style={{
                top: `${f.y}%`,
                left: `${f.x}%`,
                color: f.color,
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {f.text}
            </div>
          ))}

          {/* Glowing Crystal Rock Node Button */}
          <div className="relative flex flex-col items-center">
            {/* Sparkle halo */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-cyan-500/20 to-amber-500/20 rounded-full blur-xl animate-pulse" />

            <button
              onClick={handleStrike}
              disabled={stamina < (activeDwarf.bonus === 'stamina' ? 5 : 10)}
              className={`relative group w-40 h-40 md:w-48 md:h-48 rounded-full bg-radial from-slate-700 via-slate-800 to-slate-950 border-4 border-amber-400/60 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 ${
                isStriking ? 'scale-95 rotate-3' : 'hover:scale-105'
              } ${
                stamina < (activeDwarf.bonus === 'stamina' ? 5 : 10)
                  ? 'opacity-60 cursor-not-allowed border-rose-500/40'
                  : 'hover:border-amber-300'
              }`}
            >
              {/* Giant gemstone icon */}
              <div className="text-5xl md:text-6xl drop-shadow-lg select-none mb-1 group-hover:scale-110 transition-transform">
                💎
              </div>
              <div className="font-['Cinzel',_serif] text-xs md:text-sm font-bold text-amber-200 tracking-wider">
                七彩水晶脈
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                <Pickaxe className="w-3 h-3 text-amber-400" />
                <span>點擊揮鎬 (-{activeDwarf.bonus === 'stamina' ? 5 : 10} 體力)</span>
              </div>
            </button>
          </div>

          {/* Quick Info text */}
          <div className="mt-4 text-xs text-amber-200/90 bg-slate-950/70 px-4 py-1 rounded-full border border-amber-500/20 backdrop-blur-xs">
            ✨ 當前採礦連擊: <span className="font-mono font-bold text-amber-400">{combo} 次</span> · 有機會出產神話【七彩彩虹石】
          </div>
        </div>

        {/* Bottom Cavern Activity Log */}
        <div className="z-10 bg-slate-950/85 backdrop-blur-md rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>採礦日誌</span>
          </div>
          <div className="text-xs md:text-sm text-slate-200 font-mono">
            {mineLog}
          </div>
        </div>
      </div>
    </div>
  );
};
