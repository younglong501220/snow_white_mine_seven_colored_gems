import React, { useState } from 'react';
import { ChefHat, Sparkles, Coins, Package, ArrowRight, Heart, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GemType, Recipe } from '../types/game';
import { GEMS, RECIPES } from '../data/gameData';
import { sounds } from '../utils/audio';

interface CraftPanelProps {
  gems: Record<GemType, number>;
  pies: number;
  honeyCandies: number;
  herbalTeas: number;
  royalTarts: number;
  furniture: string[];
  onCraft: (recipe: Recipe) => void;
  onSellGem: (gem: GemType, count: number) => void;
  onEatFood: (foodType: 'pie' | 'candy' | 'tea') => void;
}

export const CraftPanel: React.FC<CraftPanelProps> = ({
  gems,
  pies,
  honeyCandies,
  herbalTeas,
  royalTarts,
  furniture,
  onCraft,
  onSellGem,
  onEatFood,
}) => {
  const [bakingRecipeId, setBakingRecipeId] = useState<string | null>(null);

  const canCraft = (recipe: Recipe) => {
    return Object.entries(recipe.ingredients).every(([gemKey, count]) => {
      return (gems[gemKey as GemType] || 0) >= (count || 0);
    });
  };

  const handleBake = (recipe: Recipe) => {
    if (!canCraft(recipe)) {
      sounds.play('crit');
      return;
    }

    setBakingRecipeId(recipe.id);
    sounds.play('bake');

    setTimeout(() => {
      onCraft(recipe);
      setBakingRecipeId(null);
      sounds.play('gem');
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ef4444', '#10b981'],
      });
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Royal Kitchen Header Stage */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 p-6 md:p-8 shadow-2xl flex flex-col justify-between">
        {/* Bakery Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url('/src/assets/images/royal_kitchen_bakery_1790692334791.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 -z-10" />

        <div className="z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-300 tracking-wider">
              ROYAL COTTAGE KITCHEN & BAKERY
            </span>
            <h2 className="font-['Cinzel',_serif] text-xl md:text-2xl font-bold text-amber-200">
              白雪小木屋烘焙坊與夢幻背包
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              將在七彩礦坑開採出的純淨寶石結晶，提煉成香甜可口的星光蘋果派、矮人蜂蜜硬糖與皇家千層蛋糕！
            </p>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 flex items-center gap-3">
            <span className="text-2xl">🥧</span>
            <div>
              <div className="text-[11px] text-slate-400">目前庫存蘋果派</div>
              <div className="font-mono text-base font-bold text-amber-300">
                {pies} 塊
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 z-10">
          {RECIPES.map((recipe) => {
            const affordable = canCraft(recipe);
            const isBaking = bakingRecipeId === recipe.id;

            return (
              <div
                key={recipe.id}
                className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-4 border border-slate-700/70 hover:border-amber-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{recipe.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{recipe.name}</h4>
                        <div className="text-[11px] text-amber-300/90 font-medium">
                          {recipe.effect.buffDesc}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Required Ingredients */}
                  <div className="mt-3 bg-slate-800/60 p-2 rounded-xl flex items-center gap-3 flex-wrap text-xs">
                    <span className="text-slate-400 text-[11px]">所需材料:</span>
                    {Object.entries(recipe.ingredients).map(([gemKey, reqCount]) => {
                      const gemInfo = GEMS[gemKey as GemType];
                      const userHas = gems[gemKey as GemType] || 0;
                      const hasEnough = userHas >= (reqCount || 0);

                      return (
                        <div
                          key={gemKey}
                          className={`flex items-center gap-1 font-mono px-2 py-0.5 rounded text-xs ${
                            hasEnough
                              ? 'bg-slate-700/60 text-slate-200'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                          }`}
                        >
                          <span>{gemInfo.symbol}</span>
                          <span>{gemInfo.name}</span>
                          <span>
                            ({userHas}/{reqCount})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => handleBake(recipe)}
                    disabled={!affordable || isBaking}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isBaking
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : affordable
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-102'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>{isBaking ? '烘烤中...' : '立即烘焙 (+1)'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backpack & Gemstone Vault */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-['Cinzel',_serif] text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>星谷夢幻背包與寶石金庫 (Gemstone Vault & Bag)</span>
            </h3>
            <p className="text-xs text-slate-400">
              檢視持有的七彩礦石晶體、料理與家具，可將多餘的寶石兌換成星光幣
            </p>
          </div>
        </div>

        {/* Ready-to-eat Delicacies */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>已料理餐點 (點擊直接食用回覆體力)：</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥧</span>
                <div>
                  <div className="font-bold text-slate-200">星光蘋果派</div>
                  <div className="text-[11px] text-amber-400 font-mono">庫存: {pies}</div>
                </div>
              </div>
              <button
                onClick={() => onEatFood('pie')}
                disabled={pies <= 0}
                className="mt-3 w-full py-1 text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded border border-rose-500/40 disabled:opacity-40 cursor-pointer"
              >
                食用 (+50 體力)
              </button>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍯</span>
                <div>
                  <div className="font-bold text-slate-200">矮人蜂蜜糖</div>
                  <div className="text-[11px] text-amber-400 font-mono">庫存: {honeyCandies}</div>
                </div>
              </div>
              <button
                onClick={() => onEatFood('candy')}
                disabled={honeyCandies <= 0}
                className="mt-3 w-full py-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 disabled:opacity-40 cursor-pointer"
              >
                食用 (+30 體力)
              </button>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🫖</span>
                <div>
                  <div className="font-bold text-slate-200">青鳥草本茶</div>
                  <div className="text-[11px] text-amber-400 font-mono">庫存: {herbalTeas}</div>
                </div>
              </div>
              <button
                onClick={() => onEatFood('tea')}
                disabled={herbalTeas <= 0}
                className="mt-3 w-full py-1 text-[11px] font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded border border-teal-500/40 disabled:opacity-40 cursor-pointer"
              >
                飲用 (+80 體力)
              </button>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍰</span>
                <div>
                  <div className="font-bold text-slate-200">彩虹星雲蛋糕</div>
                  <div className="text-[11px] text-amber-400 font-mono">庫存: {royalTarts}</div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-400 text-center py-1">
                (白雪公主專屬尊榮禮品)
              </div>
            </div>
          </div>
        </div>

        {/* 7 Gemstones Grid */}
        <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>七彩寶石礦藏儲量：</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {(Object.keys(GEMS) as GemType[]).map((gemId) => {
            const gem = GEMS[gemId];
            const count = gems[gemId] || 0;

            return (
              <div
                key={gemId}
                className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/70 flex flex-col justify-between text-center"
              >
                <div>
                  <div className="text-3xl mb-1">{gem.symbol}</div>
                  <div className="font-bold text-xs text-slate-200 truncate">{gem.name}</div>
                  <div className="text-xs font-mono font-bold text-amber-400 my-1">
                    × {count}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    單價: 🪙 {gem.sellValue}
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (count > 0) {
                        sounds.play('coin');
                        onSellGem(gemId, 1);
                      }
                    }}
                    disabled={count <= 0}
                    className="w-full py-1 text-[10px] font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded disabled:opacity-30 cursor-pointer"
                  >
                    賣出 1 顆
                  </button>
                  {count > 1 && (
                    <button
                      onClick={() => {
                        sounds.play('coin');
                        onSellGem(gemId, count);
                      }}
                      className="w-full py-0.5 text-[9px] text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      全賣 ({count * gem.sellValue}🪙)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
