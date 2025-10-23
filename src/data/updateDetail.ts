//最新公告訊息
interface updateDetailsItem {
    type:"Simulator"|"Importer",
    updateKey:string,
    updateType:string,
    updateDate:Date,
    updateTitle:string,
    updateContent:string[]
}


let updateDetails:updateDetailsItem = {
    type:"Importer",
    updateKey:'Genshin_20251024',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2025-10-24'),
    updateTitle:"聖遺物重洗模擬器 原神6.1更新公告",
    updateContent:[
        "新增6.1腳色:奈芙爾",
        "優化歷史紀錄數值呈現以及相關排版"
    ]
};

export default updateDetails;