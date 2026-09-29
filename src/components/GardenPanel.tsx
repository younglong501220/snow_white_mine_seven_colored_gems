import React, { useState } from 'react';
import { Sparkles, ShoppingBag, ArrowUpRight, RotateCcw, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecorItem } from '../types/game';
import { DECOR_ITEMS } from '../data/gameData';
import { sounds } from '../utils/audio';

interface GardenPanelProps {
  coins: number;
  onSpendCoins: (amount: number) => boolean;
  gardenSlots: (string | null)[];
  furnitureBackpack: string[];
  onPlaceDecor: (slotIndex: number, decorId: string) => void;
  onRemoveDecor: (slotIndex: number) => void;
  onBuyDecor: (decor: DecorItem) => void;
  onAddFriendship: (exp: number, source: string) => void;
}

export const GardenPanel: React.FC<GardenPanelProps> = ({
  coins,
  onSpendCoins,
  gardenSlots,
  furnitureBackpack,
  onPlaceDecor,
  onRemoveDecor,
  onBuyDecor,
  onAddFriendship,
}) => {
  const [selectedSlotForPlacement, setSelectedSlotForPlacement] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculate Garden Harmony Score
  const totalHarmony = gardenSlots.reduce((sum, decorId) => {
    if (!decorId) return sum;
    const item = DECOR_ITEMS.find((d) => d.id === decorId);
    return sum + (item ? item.harmony : 0);
  }, 0);

  // Garden Tier
  let tierName = '林間清幽花圃';
  if (totalHarmony >= 200) tierName = '皇家夢幻童話聖殿';
  else if (totalHarmony >= 120) tierName = '璀璨水晶玫瑰莊園';
  else if (totalHarmony >= 60) tierName = '典雅白雪花園';

  const handleSlotClick = (index: number) => {
    const existingDecorId = gardenSlots[index];
    if (existingDecorId) {
      // Remove back to backpack
      sounds.play('place');
      onRemoveDecor(index);
      const item = DECOR_ITEMS.find((d) => d.id === existingDecorId);
      showToast(`已將【${item ? item.name : '家具'}】收回至夢幻背包！`);
    } else {
      // Open selector
      if (furnitureBackpack.length === 0) {
        showToast('背包內目前沒有家具！請先在下方皇家工坊購買！');
        return;
      }
      setSelectedSlotForPlacement(index);
    }
  };

  const handleConfirmPlacement = (decorId: string) => {
    if (selectedSlotForPlacement === null) return;
    sounds.play('place');
    setTimeout(() => sounds.play('gem'), 120);

    onPlaceDecor(selectedSlotForPlacement, decorId);
    onAddFriendship(15, '裝潢城堡花園');

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#34d399', '#fbbf24', '#f472b6'],
    });

    const item = DECOR_ITEMS.find((d) => d.id === decorId);
    showToast(`成功在花園擺放【${item ? item.name : '家具'}】！白雪公主好感度 +15`);
    setSelectedSlotForPlacement(null);
  };

  const handleBuy = (item: DecorItem) => {
    if (coins < item.cost) {
      sounds.play('crit');
      showToast('星光幣不足！可至礦坑開採寶石或在工坊出售寶石換取金幣！');
      return;
    }
    const success = onSpendCoins(item.cost);
    if (success) {
      sounds.play('coin');
      setTimeout(() => sounds.play('gem'), 150);
      onBuyDecor(item);
      showToast(`恭喜購買【${item.name}】！已存入夢幻背包，可隨時擺放。`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Garden Header & Harmony Overview */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 p-6 md:p-8 shadow-2xl flex flex-col justify-between">
        {/* Castle Garden Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url('/src/assets/images/castle_garden_fairytale_1790692318717.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 -z-10" />

        <div className="flex items-center justify-between flex-wrap gap-4 z-10">
          <div>
            <span className="text-xs font-semibold text-emerald-300 tracking-wider">
              ROYAL CASTLE COURTYARD
            </span>
            <h2 className="font-['Cinzel',_serif] text-xl md:text-2xl font-bold text-amber-200">
              白雪公主的城堡後花園布置
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              點擊空地擺放家具，點擊已擺放家具可一鍵收回背包。打造專屬於你的夢幻仙境！
            </p>
          </div>

          {/* Harmony Score Card */}
          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">花園夢幻繁盛度</div>
              <div className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
                {totalHarmony} 点 · <span className="text-xs font-medium text-amber-300">{tierName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4x4 Garden Interactive Grid */}
        <div className="my-8 z-10 grid grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto w-full">
          {gardenSlots.map((decorId, idx) => {
            const decorItem = decorId ? DECOR_ITEMS.find((d) => d.id === decorId) : null;
            return (
              <button
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer p-2 ${
                  decorItem
                    ? 'bg-slate-900/80 border-amber-400/60 shadow-lg shadow-amber-500/10 hover:border-amber-300 hover:scale-105'
                    : 'bg-emerald-950/40 border-dashed border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400'
                }`}
              >
                {decorItem ? (
                  <>
                    <span className="text-3xl md:text-4xl select-none mb-1 drop-shadow-md">
                      {decorItem.icon}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-200 truncate w-full text-center">
                      {decorItem.name}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">
                      +{decorItem.harmony} 繁盛
                    </span>
                    <span className="absolute top-1 right-1 text-[9px] text-slate-400 bg-slate-800/80 px-1 rounded">
                      收回
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl text-emerald-400/70 font-light">+</span>
                    <span className="text-[10px] text-emerald-300/60 mt-1">空地 {idx + 1}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="z-10 bg-amber-400 text-slate-950 text-xs md:text-sm font-semibold px-4 py-2 rounded-xl text-center shadow-lg mx-auto animate-bounce">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Backpack Furniture Placement Modal / Drawer */}
      {selectedSlotForPlacement !== null && (
        <div className="bg-slate-900/95 border-2 border-amber-400/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Cinzel',_serif] text-base font-bold text-amber-300">
              選擇要擺放在【空地 #{selectedSlotForPlacement + 1}】的家具：
            </h3>
            <button
              onClick={() => setSelectedSlotForPlacement(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-md cursor-pointer"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {furnitureBackpack.map((decorId, bIdx) => {
              const item = DECOR_ITEMS.find((d) => d.id === decorId);
              if (!item) return null;
              return (
                <button
                  key={bIdx}
                  onClick={() => handleConfirmPlacement(decorId)}
                  className="flex flex-col items-center p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 hover:bg-slate-700/80 transition-all cursor-pointer text-center group"
                >
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{item.name}</span>
                  <span className="text-[11px] text-emerald-400 mt-0.5 font-mono">
                    +{item.harmony} 繁盛度
                  </span>
                  <span className="mt-2 text-[10px] text-amber-300 font-semibold bg-amber-500/20 px-2 py-0.5 rounded-full">
                    點擊擺放
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Royal Furniture Shop */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-['Cinzel',_serif] text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>皇家造景工坊商店 (Royal Furniture Workshop)</span>
            </h3>
            <p className="text-xs text-slate-400">
              花費星光幣採購精緻裝潢飾品，為星谷增添浪漫童話風采
            </p>
          </div>
          <div className="text-xs text-slate-400">
            星光幣餘額: <span className="font-mono font-bold text-amber-300 text-sm">🪙 {coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {DECOR_ITEMS.map((item) => {
            const canAfford = coins >= item.cost;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                      +{item.harmony} 繁盛度
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="font-mono text-sm font-bold text-amber-400">
                    🪙 {item.cost}
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>購買</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
