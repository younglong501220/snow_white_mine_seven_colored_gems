import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, Utensils, Music, Gift, Award, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { SNOW_WHITE_DIALOGUES } from '../data/gameData';

interface SnowWhitePanelProps {
  friendshipLv: number;
  friendshipExp: number;
  pieCount: number;
  cakeCount: number;
  stamina: number;
  maxStamina: number;
  onAddExp: (exp: number, source: string) => void;
  onUsePie: () => boolean;
  onUseCake: () => boolean;
  onRecoverStamina: (amount: number) => void;
}

export const SnowWhitePanel: React.FC<SnowWhitePanelProps> = ({
  friendshipLv,
  friendshipExp,
  pieCount,
  cakeCount,
  stamina,
  maxStamina,
  onAddExp,
  onUsePie,
  onUseCake,
  onRecoverStamina,
}) => {
  const [currentDialogue, setCurrentDialogue] = useState<string>(
    '「你好，親愛的星谷守護者！今天天氣真好，要和我一起在城堡花園散步，或是聽聽小矮人們在礦坑的新發現嗎？」'
  );
  const [isSinging, setIsSinging] = useState<boolean>(false);
  const [showMilestones, setShowMilestones] = useState<boolean>(false);

  const handleTalk = () => {
    sounds.play('heart');
    const available = SNOW_WHITE_DIALOGUES.filter((d) => d.minLv <= friendshipLv);
    const chosen = available[Math.floor(Math.random() * available.length)];
    setCurrentDialogue(chosen.text);
    onAddExp(20, '溫馨交談');
  };

  const handleGiftPie = () => {
    const success = onUsePie();
    if (success) {
      sounds.play('heart');
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fbbf24', '#f472b6'],
      });
      setCurrentDialogue(
        '「哇！熱騰騰的星光蘋果派！外皮金黃酥脆，裡面的紅寶石果醬香甜無比...謝謝你，這是我今天收到最棒的禮物！」'
      );
      onAddExp(45, '贈送星光蘋果派');
    }
  };

  const handleGiftCake = () => {
    const success = onUseCake();
    if (success) {
      sounds.play('levelUp');
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#ec4899', '#a855f7'],
      });
      setCurrentDialogue(
        '「天哪！這難道是傳說中的皇家彩虹星雲蛋糕？！這七彩光澤就像童話仙境一樣夢幻...我太感動了，守護者，你就是星谷的奇蹟！」'
      );
      onAddExp(120, '奉上皇家彩虹蛋糕');
    }
  };

  const handleSing = () => {
    if (stamina >= maxStamina) {
      sounds.play('bird');
      setCurrentDialogue('「你的精神看起來飽滿極了！我們隨時可以一起去礦坑或花園逛逛喔！」');
      return;
    }

    setIsSinging(true);
    sounds.play('bird');
    setTimeout(() => sounds.play('heart'), 350);

    onRecoverStamina(35);
    setCurrentDialogue(
      '🎶 你和白雪公主一起哼唱著經典口哨旋律，小青鳥展翅在肩頭起舞，微風拂面，體力恢復了 35 點！'
    );

    setTimeout(() => {
      setIsSinging(false);
    }, 2000);
  };

  const milestones = [
    { lv: 1, title: '初識星谷守護者', reward: '解鎖七矮人礦坑同行', unlocked: friendshipLv >= 1 },
    { lv: 2, title: '小木屋的茶話會', reward: '萬事通贈送 150 星光幣', unlocked: friendshipLv >= 2 },
    { lv: 3, title: '森林生靈的信賴', reward: '解鎖【水晶天鵝噴泉】購買權', unlocked: friendshipLv >= 3 },
    { lv: 4, title: '甜蜜工坊秘方', reward: '解鎖【皇家彩虹星雲蛋糕】傳奇配方', unlocked: friendshipLv >= 4 },
    { lv: 5, title: '真摯的知心好友', reward: '獲贈【金色蘋果神樹】紀念飾品', unlocked: friendshipLv >= 5 },
    { lv: 7, title: '星谷永恆守護誓約', reward: '七矮人全體採礦額外產出 +20%', unlocked: friendshipLv >= 7 },
    { lv: 10, title: '純潔與真愛之冕', reward: '星谷至高無上徽章與傳奇白雪雕像', unlocked: friendshipLv >= 10 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Snow White Character Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-indigo-950/90 via-slate-900/90 to-purple-950/90 border border-amber-400/30 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        {/* Fairy Tale Ornamental Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Princess Portrait Box */}
          <div className="relative group mb-4">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-rose-300 to-yellow-200 shadow-xl shadow-amber-500/20 animate-pulse">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-rose-100 via-amber-50 to-pink-100 flex flex-col items-center justify-center border-2 border-white/60 relative overflow-hidden">
                {/* Stylized Storybook Snow White Avatar */}
                <div className="text-5xl md:text-6xl select-none transform transition-transform group-hover:scale-110 duration-300">
                  👸🏻
                </div>
                <div className="absolute bottom-2 text-[10px] tracking-wider text-rose-800 font-bold bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
                  SNOW WHITE
                </div>
              </div>
            </div>

            {/* Floating Bluebird Mascot */}
            <div
              className={`absolute -top-1 -right-2 text-2xl select-none transition-transform duration-500 ${
                isSinging ? 'animate-bounce scale-125' : 'hover:rotate-12'
              }`}
              title="森林小青鳥"
            >
              🐦
            </div>
            {/* Sparkle badge */}
            <div className="absolute -bottom-1 -left-1 text-xl select-none">
              ✨
            </div>
          </div>

          {/* Name & Title */}
          <h2 className="font-['Cinzel',_serif] text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100">
            白雪公主 (Snow White)
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-md">
            迪士尼星谷中最純真溫暖的公主 · 森林生靈與七個小矮人的守護摯友
          </p>

          {/* Level Progress */}
          <div className="w-full max-w-sm mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-rose-300 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                好感等級: Lv.{friendshipLv}
              </span>
              <span className="font-mono tabular-nums text-slate-400">
                {friendshipExp} / 100 EXP
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 transition-all duration-500"
                style={{ width: `${friendshipExp}%` }}
              />
            </div>
          </div>

          {/* Dialogue Speech Box */}
          <div className="w-full mt-6 p-4 md:p-5 rounded-2xl bg-slate-800/80 border border-amber-400/20 text-slate-200 text-sm md:text-base leading-relaxed shadow-inner transition-all min-h-[90px] flex items-center justify-center">
            <p className="italic font-medium">{currentDialogue}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-6">
            <button
              onClick={handleTalk}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl bg-gradient-to-b from-indigo-600/90 to-indigo-800 text-white font-medium hover:from-indigo-500 hover:to-indigo-700 shadow-md shadow-indigo-900/40 border border-indigo-400/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-indigo-200" />
              <span className="text-xs md:text-sm font-semibold">溫馨交談</span>
              <span className="text-[11px] text-indigo-200 font-mono">+20 EXP</span>
            </button>

            <button
              onClick={handleGiftPie}
              disabled={pieCount <= 0}
              className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl font-medium shadow-md border transition-all cursor-pointer ${
                pieCount > 0
                  ? 'bg-gradient-to-b from-rose-600 to-rose-800 text-white hover:from-rose-500 hover:to-rose-700 border-rose-400/30 shadow-rose-900/40 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Utensils className="w-5 h-5 text-rose-200" />
              <span className="text-xs md:text-sm font-semibold">
                送星光蘋果派 ({pieCount})
              </span>
              <span className="text-[11px] text-rose-200 font-mono">+45 EXP</span>
            </button>

            <button
              onClick={handleSing}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl bg-gradient-to-b from-teal-600 to-teal-800 text-white font-medium hover:from-teal-500 hover:to-teal-700 shadow-md shadow-teal-900/40 border border-teal-400/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Music className="w-5 h-5 text-teal-200" />
              <span className="text-xs md:text-sm font-semibold">與青鳥哼唱</span>
              <span className="text-[11px] text-teal-200 font-mono">+35 體力</span>
            </button>

            <button
              onClick={() => setShowMilestones(!showMilestones)}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl bg-gradient-to-b from-amber-600 to-amber-800 text-white font-medium hover:from-amber-500 hover:to-amber-700 shadow-md shadow-amber-900/40 border border-amber-400/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Award className="w-5 h-5 text-amber-200" />
              <span className="text-xs md:text-sm font-semibold">好感度里程碑</span>
              <span className="text-[11px] text-amber-200">查看解鎖</span>
            </button>
          </div>

          {/* Special Cake Action if available */}
          {cakeCount > 0 && (
            <div className="w-full mt-4 p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-pink-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <span className="text-3xl">🍰</span>
                <div>
                  <div className="text-xs md:text-sm font-bold text-pink-200">
                    背包裡有傳奇【皇家彩虹星雲蛋糕】！
                  </div>
                  <div className="text-[11px] text-pink-300">
                    送給白雪公主可獲得極致好評與巨額獎勵
                  </div>
                </div>
              </div>
              <button
                onClick={handleGiftCake}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-slate-950 font-bold text-xs rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                立即奉上 (+120 EXP)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Friendship Milestones Accordion */}
      {showMilestones && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-['Cinzel',_serif] text-base md:text-lg font-bold text-slate-100">
              白雪公主的好感特權與羈絆進度
            </h3>
          </div>
          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.lv}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  m.unlocked
                    ? 'bg-amber-500/10 border-amber-400/30 text-slate-100'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      m.unlocked
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    Lv.{m.lv}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{m.title}</div>
                    <div className="text-xs text-slate-400">{m.reward}</div>
                  </div>
                </div>
                <div>
                  {m.unlocked ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" />
                      已解鎖
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">
                      需 Lv.{m.lv}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
