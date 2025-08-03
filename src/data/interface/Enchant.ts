import { Rank, Stand, standDetailItem, SubData, SubDataItem } from "../RelicData";

export interface EnchantData{
    relic:any,
    Rrank:Rank,
    Rscore:number,
    standDetails:standDetailItem[],
    limit:number,
    mode:"Importer"|"Simulator"
}

export interface MinMaxScore{
    min:number|undefined,
    max:number|undefined
}

export interface RelicBackup{
    relicrank:Stand,
    relicscore:number,
    returnData:SubDataItem[],
}

export interface SimulatorData{
    oldData:RelicBackup|null,
    newData:RelicBackup|null
}

export interface Statics{
    label:string
    value:number,
    color:string,
    tag:string
}

export interface EnchantRelic{
    main_affix:string,
    subaffix:SubData,
    type:string,
}