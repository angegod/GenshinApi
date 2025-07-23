import { create } from 'zustand'

const EnchantDataStore = create((set, get) => ({
    enchantData: {},

    // 正確地設定 enchantData 欄位
    setEnchantData: (data) => set({ enchantData: data }),

    // 回傳整個 enchantData 內容
    getEnchantData: () => get().enchantData,
}));

export default EnchantDataStore;
