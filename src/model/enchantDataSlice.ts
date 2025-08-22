import { selfStand, Stand } from '@/data/RelicData';
import { create } from 'zustand'

interface enchantDataItem{
    relic:any,
    Rrank:Stand,
    Rscore:number,
    standDetails:selfStand,
    limit:number,
    mode:"Simulator"|"Importer"
}

interface EnchantDataState {
    enchantData: enchantDataItem | null; // 初始值可用 null 比 {} 更安全
    setEnchantData: (data: enchantDataItem) => void;
    getEnchantData: () => enchantDataItem | null;
}

const EnchantDataStore = create<EnchantDataState>((set, get) => ({
    enchantData: null,

    // 正確地設定 enchantData 欄位
    setEnchantData: (data:enchantDataItem) => set({ enchantData: data }),

    // 回傳整個 enchantData 內容
    getEnchantData: () => get().enchantData,
}));

export default EnchantDataStore;
