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
export interface hisoryData{
    version:string,
    calDate:string,
    userID:string,
    char:characters,
    dataArr:RelicDataArr,
    avgScore:number,
    avgRank:Rank|undefined,
    avgRate:number,
    limit:number
}

export interface hisoryDataSimulate{
    version:number,
    char:characters,
    part:string,
    mainaffix:string,
    expRate:number,
    score:string,
    rank:Rank,
    pieData:PieNums,
    stand:Stand,
    relic:any
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
    isSelect?:boolean    
}

export interface SubSimulateDataItem{
    index:number
    name?:string, 
    subaffix:string,
    data:number,//詞條數值,
    count:number,
    display?:string,
    isSelect:boolean    
}

export type SubData = SubDataItem[]|SubSimulateDataItem[];

export interface AffixItem {
    fieldName: string;
    icon: string;
    type: string;
    name: string;
    percent: boolean;
    range?: number[];    
    isMain?: boolean;   
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
    type:string,
    affixmutl:number
}




