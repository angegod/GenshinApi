import { EnchantData } from '@/data/interface/Enchant';
import { selfStand, Stand } from '@/data/RelicData';
import { create } from 'zustand'


interface EnchantDataState {
    enchantData: EnchantData | null; // 初始值可用 null 比 {} 更安全
    setEnchantData: (data: EnchantData) => void;
    getEnchantData: () => EnchantData | null;
}

const EnchantDataStore = create<EnchantDataState>((set, get) => ({
    enchantData: null,

    // 正確地設定 enchantData 欄位
    setEnchantData: (data:EnchantData) => set({ enchantData: data }),

    // 回傳整個 enchantData 內容
    getEnchantData: () => get().enchantData,
}));

export default EnchantDataStore;
