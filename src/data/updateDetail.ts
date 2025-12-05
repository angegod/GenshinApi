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
    updateKey:'Genshin_20251205',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2025-12-06'),
    updateTitle:"聖遺物重洗模擬器 原神6.2更新公告",
    updateContent:[
        "新增6.2腳色:杜林、雅柯達"
    ]
};

export default updateDetails;