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
    updateKey:'Genshin_20260409',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2026-04-09'),
    updateTitle:"聖遺物重洗模擬器 原神6.5更新公告",
    updateContent:[
        "新增6.5腳色:莉奈婭",
        "聖遺物初始詞條數算法更新",
        "聖遺物副詞條初始值算法更新"
    ]
};

export default updateDetails;