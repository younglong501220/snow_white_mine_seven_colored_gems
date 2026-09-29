import React from 'react';
import { Scroll, Award, CheckCircle2, Gift, BookOpen, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quest } from '../types/game';
import { sounds } from '../utils/audio';

interface QuestsPanelProps {
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  unlockedLogs: string[];
  friendshipLv: number;
}

export const QuestsPanel: React.FC<QuestsPanelProps> = ({
  quests,
  onClaimQuest,
  unlockedLogs,
  friendshipLv,
}) => {
  const handleClaim = (quest: Quest) => {
    sounds.play('levelUp');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#10b981'],
    });
    onClaimQuest(quest.id);
  };

  const defaultStories = [
    '第 1 頁：穿過濃霧繚繞的夢幻星谷入口，我在閃耀的蘋果樹下遇見了白雪公主。她的歌聲驅散了所有陰霾。',
    '第 2 頁：七個小矮人揮動著小稿子，熱情地引導我走進七彩寶石礦坑。愛生氣雖然嘴上抱怨，卻默默把最趁手的鐵鎬遞給了我。',
    '第 3 頁：在城堡後花園砌下了第一座水晶噴泉，小青鳥們在天鵝雕塑上方歡快盤旋，整個花園彷彿甦醒了。',
    friendshipLv >= 3 ? '第 4 頁：白雪公主親自分享了小木屋祖傳的星光蘋果派秘方，那抹肉桂與紅寶石精華的甘甜，令星谷的夜晚格外溫馨。' : null,
    friendshipLv >= 5 ? '第 5 頁：金色蘋果神樹在花園中綻放璀璨光華，七個小矮人圍坐在一起大聲歡笑，星谷的魔力已重獲新生！' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Quests Header */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <Scroll className="w-5 h-5 text-amber-400" />
          <h2 className="font-['Cinzel',_serif] text-lg md:text-xl font-bold text-amber-200">
            白雪公主的每日皇家心願 (Royal Wishlist)
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-400">
          完成白雪公主與星谷居民的委託，可獲得豐厚星光幣與好感度經驗
        </p>

        {/* Quests List */}
        <div className="space-y-3 mt-6">
          {quests.map((quest) => {
            const isFinished = quest.currentCount >= quest.targetCount;
            return (
              <div
                key={quest.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between flex-wrap gap-4 ${
                  quest.claimed
                    ? 'bg-slate-800/30 border-slate-800 opacity-60'
                    : isFinished
                    ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {quest.claimed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isFinished ? (
                      <Award className="w-5 h-5 text-amber-400 animate-bounce" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{quest.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{quest.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="text-slate-400">
                        進度: <span className="font-mono text-slate-200">{quest.currentCount}/{quest.targetCount}</span>
                      </span>
                      <span className="text-slate-700" aria-hidden="true">·</span>
                      <span className="text-amber-400 font-mono">🪙 +{quest.rewardCoins} 星光幣</span>
                      <span className="text-slate-700" aria-hidden="true">·</span>
                      <span className="text-rose-400 font-mono">💖 +{quest.rewardExp} EXP</span>
                    </div>
                  </div>
                </div>

                <div>
                  {quest.claimed ? (
                    <span className="text-xs text-slate-500 font-medium">已領取</span>
                  ) : isFinished ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>領取賞賜</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">進行中</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fairytale Memory Diary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="font-['Cinzel',_serif] text-base md:text-lg font-bold text-slate-200">
            星谷童話回憶手札 (Valley Memories Diary)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          記錄著你在星谷與白雪公主、七個小矮人共同經歷的每個溫馨時刻
        </p>

        <div className="space-y-2.5">
          {defaultStories.map((story, sIdx) => (
            <div
              key={sIdx}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs md:text-sm text-slate-300 leading-relaxed font-serif"
            >
              {story}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
