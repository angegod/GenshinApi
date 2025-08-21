import { create } from 'zustand';

interface useUpdateDetailsWindow{
    status:boolean,
    openWindow:()=>void,
    closeWindow:()=>void
}

//最新更新消息視窗狀態
const updateDetailsWindow = create<useUpdateDetailsWindow>((set, get) => ({
    status:false,
    
    //打開視窗
    openWindow:() =>set({ status:true }),
    //關閉視窗
    closeWindow:()=>set({status:false}),
}));


export default updateDetailsWindow;