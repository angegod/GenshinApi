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
    updateKey:'Genshin_20260227',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2026-02-27'),
    updateTitle:"聖遺物重洗模擬器 原神6.4更新公告",
    updateContent:[
        "新增6.4腳色:法爾迦",
        "細項修正與優化"
    ]
};

export default updateDetails;