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
    updateKey:'Genshin_20260118',
    updateType:'GenshinUpdateDetails',
    updateDate: new Date('2026-01-18'),
    updateTitle:"聖遺物重洗模擬器 原神6.3更新公告",
    updateContent:[
        "新增6.3腳色:少女(哥倫比婭)、茲白、葉洛亞",
        "替換背景圖片為挪德卡萊相關",
        "細項文本改動",
        "修正保底詞條有概率誤植之錯誤"
    ]
};

export default updateDetails;