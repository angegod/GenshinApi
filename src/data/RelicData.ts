export interface Rank{
    label:string | undefined,
    value:number | undefined,
    color:string | undefined,
    tag:string |undefined
}

export interface Stand{
    rank:string,
    stand:number,
    color:string,
    tag:string
}

export type PieNums = Rank[] | undefined;  // PieNums 就等於一個 Rank 陣列

export interface RelicScoreStand{
    rank:string,
    stand:number,
    color:string,
    tag:string
}

export interface standDetailItem{
    name:string,
    value:number,
    SelectPriority?:number
}

export type standDetails = standDetailItem[];

export interface RelicDataItem{
    ExpRate:number|undefined,//能不能容納undefined
    PieNums:PieNums|undefined,
    Rank:Rank,
    Rscore:number,//0到100
    relic:any,//暫時先不限制該物件模樣
    standDetails:standDetails
}

export interface SimulateRelic{
    main_affix:any,
    subaffix:SubData,
    type:number|undefined
}

export interface RelicDataMap {
  [key: number]: RelicDataItem[];
}

export type RelicDataArr = RelicDataItem[][];


export interface ImporterContextType {
    charID: string;
    selfStand: any[];
    partsIndex: number;
    standDetails: any;
    partArr: any[];
    isChangeAble: boolean;
    RelicDataArr: any[];
    relicIndex: number;
    isLoad: boolean;
    limit: number;
    //RelicData
    mode:string,
    button:boolean

    relic: any;
    Rscore: number;
    Rrank: any;
    ExpRate: number;
    PieNums: any[];
    AffixCount: number;

    deleteHistoryData: () => void;
    checkDetails: () => void;
    updateDetails: () => void;

    setCharID: (id: string) => void;
    setSelfStand: (s: any[]) => void;
    setIsSaveAble: (b: boolean) => void;
    setRelicIndex: (n: number) => void;
    setRelic: (r: any) => void;
}

//歷史資料
export interface historyData{
    version:string,       //歷史紀錄版本
    calDate:string,       //紀錄創建日期
    userID:string,        //查詢對象玩家UID
    char:characters,      //腳色
    dataArr:RelicDataArr, //遺器資料陣列
    avgScore:number,      //平均分數
    avgRank:Rank|undefined, //平均分數評級
    avgRate:number,         //平均機率
    limit:number            //強化保底次數
}

export interface hisoryDataSimulate{
    version:number,   //歷史紀錄版本
    char:characters,  //對應的腳色
    part:string,      //部位
    mainaffix:string, //主詞條名稱
    expRate:number,   //期望機率
    score:string,     //聖遺物分數
    rank:Rank,        //評分   
    pieData:PieNums,  //圓餅圖相關資料
    stand:selfStand,  //標準加權配置
    relic:any,        //遺器資料
    limit:number      //強化保底次數
}

//selfstand
export interface selfStandItem{
    name:string,
    value:number,
    SelectPriority?:number,
    __index:number
}

export type selfStand = selfStandItem[] | [];

//SubData
export interface SubDataItem{
    index:number 
    subaffix:string,
    data:number //詞條數值,
    isSelect?:boolean,
    count?:number    
}

export interface SubSimulateDataItem{
    index:number     //詞條索引值 代表是第幾個副詞條
    name?:string,    //
    subaffix:string, //副詞條名稱
    data:number,     //詞條數值,
    count:number,    //強化次數
    display?:string, //對應數值
    isSelect:boolean //是否被指定為保底詞條   
}

export type SubData = SubDataItem[]|SubSimulateDataItem[];

export interface AffixItem {
    fieldName: string;  //專屬名稱
    icon: string;       //圖片logo位置 暫時不會用到這個
    type: string;       //詞條種類
    name: string;       //詞條名稱
    percent: boolean;   //是否需要帶%數
    range?: number[];   //副詞條可能數值範圍 
    isMain?: boolean;   //是否只出現在主詞條中
}

export interface AffixListItem {
    id:number,
    main: string[];
    sub: string[];
}


export interface characters {
    charId:string,
    name:string,
    cn_name:string,
    element:"Fire"|"Ice"|"Wind"|"Electric"|"Water"|"Rock"|"Grass",
    rarity:4 | 5,
}

export interface sendData{
    uid:string,
    charID:string,
    partsIndex?:number
}

//計算總共有幾個詞條
export interface caltype{
    type:string,       //詞條種類名稱
    affixmutl:number   //對應有效詞條名稱
}




