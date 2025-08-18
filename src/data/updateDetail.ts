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
    updateKey:'Genshin_20250817',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2025-08-17'),
    updateTitle:"聖遺物重洗模擬器 原神5.8公告",
    updateContent:[
        "新增5.8腳色:伊涅芙",
        "新增保底詞條指定功能",
        "操作UI優化"
    ]
};

export default updateDetails;