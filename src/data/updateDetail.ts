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
    updateKey:'Genshin_20250910',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2025-09-10'),
    updateTitle:"聖遺物重洗模擬器 原神6.0更新公告",
    updateContent:[
        "新增6.0腳色:菈烏瑪、愛諾、菲林斯",
        "歷史紀錄標記保底次數",
        "操作UI優化"
    ]
};

export default updateDetails;