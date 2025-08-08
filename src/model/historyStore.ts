import { historyData, hisoryDataSimulate } from '@/data/RelicData';
import { create } from 'zustand';

// 定義歷史資料的統一型別
type HistoryItem = historyData | hisoryDataSimulate;

// 定義 Store 的狀態與方法型別
interface HistoryStoreState {
    history: HistoryItem[];
    maxHistoryLength:number,

    setHistory: (data: HistoryItem[]) => void;
    getHistory: (index?: number | null) => HistoryItem[] | HistoryItem | null;
    addHistory: (data: HistoryItem) => void;
    deleteHistory: (index: number) => void;
    limitHistory: () => void;
    resetHistory: () => void;
}

const useHistoryStore = create<HistoryStoreState>((set, get) => ({
    history: [],
    maxHistoryLength:6,

    setHistory: (data) => set({ history: data }),

    getHistory: (index = null) => {
        const history = get().history;
        if (typeof index === 'number') return history[index] ?? null;
        return history;
    },

    addHistory: (data) =>
        set((state) => ({
        history: [...state.history, data],
        })),

    deleteHistory: (index) => {
        const current = get().history;
        const newList = [...current.slice(0, index), ...current.slice(index + 1)];
        set({ history: newList });
    },

    limitHistory: () => {
        const history = get().history;
        if (history.length >= get().maxHistoryLength) {
            history.shift(); // 直接移除第一筆，改變原本的 state 陣列
        }
    },


    resetHistory: () => set({ history: [] }),
}));

export default useHistoryStore;


