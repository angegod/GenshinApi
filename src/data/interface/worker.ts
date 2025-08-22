export interface coeEfficentItem{
    type:string,
    fieldName:string,
    num:number,
    locked:boolean
}

export interface workerRelicSubAffix{
    index:number    //索引名稱
    subaffix:string,//詞條名稱
    data:number     //詞條數值
    count:number    //詞條強化數值 
}