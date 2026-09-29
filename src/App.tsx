/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { TopBar } from './components/TopBar';
import { StatusBar } from './components/StatusBar';
import { SnowWhitePanel } from './components/SnowWhitePanel';
import { MinePanel } from './components/MinePanel';
import { GardenPanel } from './components/GardenPanel';
import { CraftPanel } from './components/CraftPanel';
import { QuestsPanel } from './components/QuestsPanel';
import { GameState, GemType, Recipe, DecorItem } from './types/game';
import { DWARFS, INITIAL_QUESTS } from './data/gameData';
import { sounds } from './utils/audio';

const STORAGE_KEY = 'dreamlight_snowwhite_save_v1';

const defaultState: GameState = {
  stamina: 100,
  maxStamina: 100,
  coins: 200,
  friendshipLv: 1,
  friendshipExp: 0,
  selectedDwarfId: 'doc',
  sneezyCharge: 0,
  comboCount: 0,
  inventory: {
    gems: {
      ruby: 2,
      sapphire: 1,
      emerald: 0,
      topaz: 0,
      amethyst: 0,
      diamond: 0,
      prismatic: 0,
    },
    pies: 2,
    honeyCandies: 0,
    herbalTeas: 0,
    royalTarts: 0,
    furniture: ['rose_arch'],
  },
  garden: [
    'rose_arch',
    'fountain_swan',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  activeBuff: null,
  quests: INITIAL_QUESTS,
  unlockedStoryLog: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to guard against schema changes
        return {
          ...defaultState,
          ...parsed,
          inventory: {
            ...defaultState.inventory,
            ...(parsed.inventory || {}),
            gems: {
              ...defaultState.inventory.gems,
              ...((parsed.inventory && parsed.inventory.gems) || {}),
            },
          },
          garden: parsed.garden && parsed.garden.length === 16 ? parsed.garden : defaultState.garden,
        };
      }
    } catch {
      // Fallback to default
    }
    return defaultState;
  });

  const [activeTab, setActiveTab] = useState<'snow' | 'mine' | 'decor' | 'craft' | 'quests'>('snow');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmActive, setIsBgmActive] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // Ignore quota errors
    }
  }, [gameState]);

  // Gentle passive stamina recovery (every 10 seconds recover 1 stamina if not full)
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.stamina < prev.maxStamina) {
          return {
            ...prev,
            stamina: Math.min(prev.maxStamina, prev.stamina + 1),
          };
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Update Quests Helper
  const updateQuestProgress = (type: 'mine' | 'chat' | 'gift' | 'decor' | 'craft', amount = 1) => {
    setGameState((prev) => {
      const updatedQuests = prev.quests.map((q) => {
        if (q.type === type && !q.completed) {
          const newCount = q.currentCount + amount;
          return {
            ...q,
            currentCount: newCount,
            completed: newCount >= q.targetCount,
          };
        }
        return q;
      });
      return { ...prev, quests: updatedQuests };
    });
  };

  // Add Friendship EXP & Level Up Handler
  const handleAddFriendship = (exp: number, source: string) => {
    setGameState((prev) => {
      let newExp = prev.friendshipExp + exp;
      let newLv = prev.friendshipLv;
      let bonusCoins = 0;

      while (newExp >= 100) {
        newLv += 1;
        newExp -= 100;
        bonusCoins += 150;
      }

      if (newLv > prev.friendshipLv) {
        sounds.play('levelUp');
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7'],
        });
      }

      return {
        ...prev,
        friendshipLv: newLv,
        friendshipExp: newExp,
        coins: prev.coins + bonusCoins,
      };
    });

    if (source === '溫馨交談') {
      updateQuestProgress('chat', 1);
    } else if (source.includes('蘋果派') || source.includes('蛋糕')) {
      updateQuestProgress('gift', 1);
    } else if (source.includes('花園')) {
      updateQuestProgress('decor', 1);
    }
  };

  // Sound Controls
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const toggleBgm = () => {
    const active = sounds.toggleAmbientBgm();
    setIsBgmActive(active);
  };

  // Food consumption
  const handleEatFood = (foodType: 'pie' | 'candy' | 'tea') => {
    setGameState((prev) => {
      if (foodType === 'pie') {
        if (prev.inventory.pies <= 0) return prev;
        sounds.play('heart');
        return {
          ...prev,
          stamina: Math.min(prev.maxStamina, prev.stamina + 50),
          inventory: {
            ...prev.inventory,
            pies: prev.inventory.pies - 1,
          },
        };
      } else if (foodType === 'candy') {
        if (prev.inventory.honeyCandies <= 0) return prev;
        sounds.play('heart');
        return {
          ...prev,
          stamina: Math.min(prev.maxStamina, prev.stamina + 30),
          inventory: {
            ...prev.inventory,
            honeyCandies: prev.inventory.honeyCandies - 1,
          },
        };
      } else if (foodType === 'tea') {
        if (prev.inventory.herbalTeas <= 0) return prev;
        sounds.play('heart');
        return {
          ...prev,
          stamina: prev.maxStamina,
          inventory: {
            ...prev.inventory,
            herbalTeas: prev.inventory.herbalTeas - 1,
          },
        };
      }
      return prev;
    });
  };

  // Mining Gem Action
  const handleMineGem = (gem: GemType, amount: number, staminaCost: number, coinsBonus: number) => {
    setGameState((prev) => {
      const currentCount = prev.inventory.gems[gem] || 0;
      return {
        ...prev,
        stamina: Math.max(0, prev.stamina - staminaCost),
        coins: prev.coins + coinsBonus,
        comboCount: prev.comboCount + 1,
        inventory: {
          ...prev.inventory,
          gems: {
            ...prev.inventory.gems,
            [gem]: currentCount + amount,
          },
        },
      };
    });

    updateQuestProgress('mine', 1);
  };

  // Sneeze Blast
  const handleSneezeBlast = (blastGems: { type: GemType; amount: number }[]) => {
    setGameState((prev) => {
      const updatedGems = { ...prev.inventory.gems };
      blastGems.forEach((g) => {
        updatedGems[g.type] = (updatedGems[g.type] || 0) + g.amount;
      });
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          gems: updatedGems,
        },
      };
    });
    updateQuestProgress('mine', 2);
  };

  // Bakery Crafting
  const handleCraft = (recipe: Recipe) => {
    setGameState((prev) => {
      // Deduct ingredients
      const updatedGems = { ...prev.inventory.gems };
      Object.entries(recipe.ingredients).forEach(([gemKey, count]) => {
        const k = gemKey as GemType;
        updatedGems[k] = Math.max(0, (updatedGems[k] || 0) - (count || 0));
      });

      const updatedInventory = { ...prev.inventory, gems: updatedGems };
      if (recipe.id === 'pie') updatedInventory.pies += 1;
      else if (recipe.id === 'honey_candy') updatedInventory.honeyCandies += 1;
      else if (recipe.id === 'herbal_tea') updatedInventory.herbalTeas += 1;
      else if (recipe.id === 'royal_tart') updatedInventory.royalTarts += 1;

      return {
        ...prev,
        inventory: updatedInventory,
      };
    });

    updateQuestProgress('craft', 1);
  };

  // Selling Gems for Coins
  const handleSellGem = (gem: GemType, count: number) => {
    const gemInfo = defaultState.inventory.gems;
    if (!gemInfo) return;

    setGameState((prev) => {
      const current = prev.inventory.gems[gem] || 0;
      if (current < count) return prev;

      // Sell prices
      const prices: Record<GemType, number> = {
        ruby: 20,
        sapphire: 25,
        emerald: 30,
        topaz: 40,
        amethyst: 60,
        diamond: 120,
        prismatic: 300,
      };

      const gainCoins = (prices[gem] || 20) * count;

      return {
        ...prev,
        coins: prev.coins + gainCoins,
        inventory: {
          ...prev.inventory,
          gems: {
            ...prev.inventory.gems,
            [gem]: current - count,
          },
        },
      };
    });
  };

  // Garden Actions
  const handlePlaceDecor = (slotIndex: number, decorId: string) => {
    setGameState((prev) => {
      const updatedGarden = [...prev.garden];
      updatedGarden[slotIndex] = decorId;

      // Remove 1 instance of decorId from backpack
      const bp = [...prev.inventory.furniture];
      const foundIdx = bp.indexOf(decorId);
      if (foundIdx > -1) {
        bp.splice(foundIdx, 1);
      }

      return {
        ...prev,
        garden: updatedGarden,
        inventory: {
          ...prev.inventory,
          furniture: bp,
        },
      };
    });
  };

  const handleRemoveDecor = (slotIndex: number) => {
    setGameState((prev) => {
      const decorId = prev.garden[slotIndex];
      if (!decorId) return prev;

      const updatedGarden = [...prev.garden];
      updatedGarden[slotIndex] = null;

      return {
        ...prev,
        garden: updatedGarden,
        inventory: {
          ...prev.inventory,
          furniture: [...prev.inventory.furniture, decorId],
        },
      };
    });
  };

  const handleBuyDecor = (item: DecorItem) => {
    setGameState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        furniture: [...prev.inventory.furniture, item.id],
      },
    }));
  };

  const handleSpendCoins = (cost: number): boolean => {
    if (gameState.coins >= cost) {
      setGameState((prev) => ({ ...prev, coins: prev.coins - cost }));
      return true;
    }
    return false;
  };

  // Quest Claiming
  const handleClaimQuest = (questId: string) => {
    setGameState((prev) => {
      const quest = prev.quests.find((q) => q.id === questId);
      if (!quest || quest.claimed) return prev;

      const updatedQuests = prev.quests.map((q) =>
        q.id === questId ? { ...q, claimed: true } : q
      );

      return {
        ...prev,
        coins: prev.coins + quest.rewardCoins,
        quests: updatedQuests,
      };
    });

    const quest = gameState.quests.find((q) => q.id === questId);
    if (quest) {
      handleAddFriendship(quest.rewardExp, '完成每日心願');
    }
  };

  // Reset Game
  const handleConfirmReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(defaultState);
    setShowResetModal(false);
    sounds.play('place');
  };

  const activeDwarf = DWARFS.find((d) => d.id === gameState.selectedDwarfId) || DWARFS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',_system-ui,_sans-serif]">
      {/* Top Bar Header */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isBgmActive={isBgmActive}
        onToggleBgm={toggleBgm}
        onReset={() => setShowResetModal(true)}
      />

      {/* Status Bar */}
      <StatusBar
        stamina={gameState.stamina}
        maxStamina={gameState.maxStamina}
        coins={gameState.coins}
        friendshipLv={gameState.friendshipLv}
        friendshipExp={gameState.friendshipExp}
        activeDwarf={activeDwarf}
        pieCount={gameState.inventory.pies}
        onQuickRecover={() => handleEatFood('pie')}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'snow' && (
          <SnowWhitePanel
            friendshipLv={gameState.friendshipLv}
            friendshipExp={gameState.friendshipExp}
            pieCount={gameState.inventory.pies}
            cakeCount={gameState.inventory.royalTarts}
            stamina={gameState.stamina}
            maxStamina={gameState.maxStamina}
            onAddExp={handleAddFriendship}
            onUsePie={() => {
              if (gameState.inventory.pies > 0) {
                setGameState((prev) => ({
                  ...prev,
                  inventory: { ...prev.inventory, pies: prev.inventory.pies - 1 },
                }));
                return true;
              }
              return false;
            }}
            onUseCake={() => {
              if (gameState.inventory.royalTarts > 0) {
                setGameState((prev) => ({
                  ...prev,
                  inventory: { ...prev.inventory, royalTarts: prev.inventory.royalTarts - 1 },
                }));
                return true;
              }
              return false;
            }}
            onRecoverStamina={(amt) => {
              setGameState((prev) => ({
                ...prev,
                stamina: Math.min(prev.maxStamina, prev.stamina + amt),
              }));
            }}
          />
        )}

        {activeTab === 'mine' && (
          <MinePanel
            stamina={gameState.stamina}
            maxStamina={gameState.maxStamina}
            coins={gameState.coins}
            selectedDwarfId={gameState.selectedDwarfId}
            onSelectDwarf={(id) => setGameState((prev) => ({ ...prev, selectedDwarfId: id }))}
            onMineGem={handleMineGem}
            onSneezeBlast={handleSneezeBlast}
            sneezyCharge={gameState.sneezyCharge}
            onSetSneezyCharge={(updater) => {
              setGameState((prev) => ({
                ...prev,
                sneezyCharge: typeof updater === 'function' ? updater(prev.sneezyCharge) : updater,
              }));
            }}
          />
        )}

        {activeTab === 'decor' && (
          <GardenPanel
            coins={gameState.coins}
            onSpendCoins={handleSpendCoins}
            gardenSlots={gameState.garden}
            furnitureBackpack={gameState.inventory.furniture}
            onPlaceDecor={handlePlaceDecor}
            onRemoveDecor={handleRemoveDecor}
            onBuyDecor={handleBuyDecor}
            onAddFriendship={handleAddFriendship}
          />
        )}

        {activeTab === 'craft' && (
          <CraftPanel
            gems={gameState.inventory.gems}
            pies={gameState.inventory.pies}
            honeyCandies={gameState.inventory.honeyCandies}
            herbalTeas={gameState.inventory.herbalTeas}
            royalTarts={gameState.inventory.royalTarts}
            furniture={gameState.inventory.furniture}
            onCraft={handleCraft}
            onSellGem={handleSellGem}
            onEatFood={handleEatFood}
          />
        )}

        {activeTab === 'quests' && (
          <QuestsPanel
            quests={gameState.quests}
            onClaimQuest={handleClaimQuest}
            unlockedLogs={gameState.unlockedStoryLog}
            friendshipLv={gameState.friendshipLv}
          />
        )}
      </main>

      {/* Reset Modal Confirmation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-['Cinzel',_serif] text-lg font-bold text-amber-300">
              重新開始星谷童話旅程？
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              這將重置所有開採的寶石、花園擺設、白雪公主好感度與烘焙料理，一切將重回最初的純淨起點。確定要繼續嗎？
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors cursor-pointer"
              >
                確認重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <span>《迪士尼夢幻星谷：白雪公主與七彩寶石礦坑》· 網頁冒險版</span>
          <span className="text-slate-400 font-serif">願星光與善良常伴心間 ✨</span>
        </div>
      </footer>
    </div>
  );
}
