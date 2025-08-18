import { create } from 'zustand';

interface useUpdateDetailsWindow{
    status:boolean,
    openWindow:()=>void,
    closeWindow:()=>void

}


const updateDetailsWindow = create<useUpdateDetailsWindow>((set, get) => ({
    status:false,

    openWindow:() =>set({ status:true }),

    closeWindow:()=>set({status:false}),
}));


export default updateDetailsWindow;