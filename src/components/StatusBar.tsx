import React from 'react';
import { Zap, Coins, Heart, UserCheck, Plus } from 'lucide-react';
import { Dwarf } from '../types/game';

interface StatusBarProps {
  stamina: number;
  maxStamina: number;
  coins: number;
  friendshipLv: number;
  friendshipExp: number;
  activeDwarf: Dwarf;
  onQuickRecover: () => void;
  pieCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stamina,
  maxStamina,
  coins,
  friendshipLv,
  friendshipExp,
  activeDwarf,
  onQuickRecover,
  pieCount,
}) => {
  const staminaPercent = Math.min(100, Math.round((stamina / maxStamina) * 100));

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800/80 px-4 md:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4 text-xs md:text-sm">
        {/* Left meters */}
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          {/* Stamina Meter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Zap className="w-4 h-4 fill-amber-400/20" />
              <span>體力</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 md:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    stamina < 20
                      ? 'bg-rose-500'
                      : stamina < 50
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
              <span className="font-mono tabular-nums text-slate-200 text-xs">
                {stamina} / {maxStamina}
              </span>
              {stamina < 40 && pieCount > 0 && (
                <button
                  onClick={onQuickRecover}
                  className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-colors cursor-pointer"
                  title="消耗 1 塊蘋果派恢復 50 體力"
                >
                  <Plus className="w-3 h-3" />
                  <span>吃派</span>
                </button>
              )}
            </div>
          </div>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>

          {/* Starlight Coins */}
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
            <span className="text-slate-400">星光幣</span>
            <span className="font-mono tabular-nums font-bold text-amber-300 text-sm">
              {coins.toLocaleString()}
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>

          {/* Princess Friendship */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-rose-400 font-semibold">
              <Heart className="w-4 h-4 fill-rose-400" />
              <span>白雪好感</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-rose-300">Lv.{friendshipLv}</span>
              <div className="w-16 md:w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-300"
                  style={{ width: `${friendshipExp}%` }}
                />
              </div>
              <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                {friendshipExp}/100
              </span>
            </div>
          </div>
        </div>

        {/* Right Active Dwarf Companion */}
        <div className="flex items-center gap-2 text-xs bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/50">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">同行矮人夥伴:</span>
          <span className="text-base leading-none">{activeDwarf.icon}</span>
          <span className="font-semibold text-slate-200">{activeDwarf.name}</span>
          <span className="text-slate-500 hidden md:inline">({activeDwarf.skillName})</span>
        </div>
      </div>
    </div>
  );
};
