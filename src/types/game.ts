export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'diamond' | 'prismatic';

export interface GemInfo {
  id: GemType;
  name: string;
  symbol: string;
  color: string;
  bgGrad: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythic';
  sellValue: number;
  description: string;
}

export type DwarfBonus = 'rare' | 'stamina' | 'double' | 'coin' | 'energy_restore' | 'perfect_gem' | 'sneeze_blast';

export interface Dwarf {
  id: string;
  name: string;
  enName: string;
  icon: string;
  avatarBg: string;
  title: string;
  skillName: string;
  skillDesc: string;
  bonus: DwarfBonus;
  quote: string;
}

export interface DecorItem {
  id: string;
  name: string;
  icon: string;
  category: 'fountain' | 'nature' | 'seating' | 'light' | 'castle';
  cost: number;
  harmony: number;
  description: string;
}

export interface GardenSlot {
  id: number;
  decorId: string | null;
  placedAt?: number;
}

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  description: string;
  ingredients: { [K in GemType]?: number };
  craftTimeSec?: number;
  effect: {
    stamina?: number;
    friendship?: number;
    coins?: number;
    buffDesc?: string;
  };
}

export interface Quest {
  id: string;
  title: string;
  desc: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardExp: number;
  type: 'mine' | 'chat' | 'gift' | 'decor' | 'craft';
}

export interface GameState {
  stamina: number;
  maxStamina: number;
  coins: number;
  friendshipLv: number;
  friendshipExp: number;
  selectedDwarfId: string;
  sneezyCharge: number; // 0 to 100 for blast
  comboCount: number;
  inventory: {
    gems: Record<GemType, number>;
    pies: number;
    honeyCandies: number;
    herbalTeas: number;
    royalTarts: number;
    furniture: string[]; // decorIds in backpack
  };
  garden: (string | null)[]; // 16 grid slots with decorId or null
  activeBuff: {
    type: string;
    expiresAt: number;
  } | null;
  quests: Quest[];
  unlockedStoryLog: string[];
}
