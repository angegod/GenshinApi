import { create } from 'zustand'

const HistoryStore = create((set, get) => ({
    history: [],

    // 直接整個設定 history
    setHistory: (data) => set({ history: data }),

    // 讀取 history（可有可無，直接用 useHistoryStore((s) => s.history) 也可）
    getHistory: (index = null) => {
        const history = get().history
        
        if (typeof index === 'number') return history[index] ?? null
        return history
    },

    // 加一筆資料
    addHistory: (data) =>
        set((state) => ({
            history: [...state.history, data],
        })),

    // 根據 index 刪除資料
    deleteHistory: (index) => {
        const current = get().history;
        const newList = [...current.slice(0, index), ...current.slice(index + 1)];
        set({ history: newList });
    },
    limitHistory: () => {
        set((state) => ({
            history: state.history.slice(1) // 移除第一個，不改動原陣列
        }));
    },
    resetHistory:() =>{
        set({ history: [] })
    }
}))

export default HistoryStore;



