"use client";
import React, { useEffect, useReducer , createContext } from 'react';
import characters from '../../data/characters';
import AffixName from '../../data/AffixName';
import EquipType from '@/data/EquipType';
import { useState ,useRef,useCallback } from 'react';
import '@/css/simulator.scss';
import axios from 'axios';
import { Tooltip } from 'react-tooltip'
import { usePathname } from 'next/navigation';

import {PastPreviewList} from '@/components/PastPreviewList';
import Result from '@/components/Result';
import { StandDetails, ShowStand } from '@/components/StandDetails';
import { RelicData } from '@/components/RelicData';
import { StandardSelect,   CharSelect ,RelicSelect, RelicDataModeSelect } from '@/components/Select';

import SiteContext from '@/context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import HistoryStore from '@/model/historyStore';

import HintHistory from '@/components/Hint/HintHistory';
import HintImporter from '@/components/Hint/HintImporter';
import HintParams from '@/components/Hint/HintParams';
import { AffixItem, PieNums, Rank, RelicDataArr, RelicDataItem, Stand, selfStand, selfStandItem, sendData, SubData, SubDataItem, historyData, SubDataEnchanceCombinations } from '@/data/RelicData';
import updateDetailsWindow from '@/model/updateDetailsStatus';
import ProcessBtn from '@/components/ProcessBtn';
import { filterInvalidCombinations, findSubDatacombinations } from '@/data/combination';


function Importer(){
    //版本序號
    const version="1.6";

    //玩家ID跟腳色ID
    const userID=useRef('');
    const [charID,setCharID]=useState(undefined);

    //部位代碼
    const partsIndex=6;

    //找到的聖遺物陣列以及目前檢視索引，預設為0
    const [relic,setRelic]=useState();
    const [relicIndex,setRelicIndex] = useState<number>(0);
    
    //顯示資訊
    //const [limit,setLimit]=useState<number>(2);
    const limit = useRef(2);
    const showLimit = useRef(2);

    //期望值、儀器分數、評級、圖表資料、以及 切換成3詞條或4詞條模擬模式
    const [ExpRate,setExpRate]=useState<number | undefined>(undefined);
    const [Rscore,setRscore]=useState<number | undefined>(undefined);
    const [Rrank,setRank]=useState<Rank>({label:undefined,tag:undefined,color:undefined,value:undefined});
    const [PieNums,setPieNums]=useState<PieNums>(undefined);
    const [AffixCount,setAffixCount]=useState<3|4>(3);

    // 找到所有聖遺物後計算的所有數據，包含期望值、分數等
    const [RelicDataArr,setRelicDataArr]=useState<RelicDataArr>([]);
    const RelicDataArrRef = useRef<RelicDataArr>(null);
    
    // 共用statusMsg 
    const {showStatus,updateStatus}=useStatusToast();

    //資料儲存位置
    const dataStorageLocation = 'GenshinImporterData';


    //獲取操作歷史紀錄的function
    const {setHistory,getHistory,addHistory,deleteHistory,resetHistory,limitHistory} = HistoryStore();
    const [isLoad,setIsLoad] = useState<boolean>(false);

    //獲取更新紀錄狀態function
    const openWindow = updateDetailsWindow((state) => state.openWindow);

    //自訂義標準
    const [selfStand,setSelfStand]=useState<selfStand>([]);
    const standDetails=useRef<selfStand>([]);

    //router相關
    const pathname = usePathname();

    //元件狀態
    const [isChangeAble,setIsChangeAble]=useState<boolean>(true);
    const [isSaveAble,setIsSaveAble]=useState<boolean>(false);
    
    const partArr = ['生之花','死之羽','時之沙','空之杯','理之冠'];

    //評級標準
    const scoreStand=[
        {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
        {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
        {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
        {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
        {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
        {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
    ];

    
    useEffect(()=>{
        //初始化歷史紀錄
        init();
    },[pathname]);

    //當聖遺物資料更新時
    useEffect(()=>{
        
        if(RelicDataArr.length !==0){
            console.log('Main:',RelicDataArr,AffixCount,relicIndex);
            const relicObj = RelicDataArr[relicIndex];

            // 3 詞條 → key 3
            // 4 詞條 → key 4

            let key = undefined;

            //根據資料情形給予key值
            if(relicObj[3] && relicObj[4]){
                key = AffixCount === 3 ? 3 : 4;
            }else if(relicObj[3]){
                key = 3;
            }else{
                key = 4;
            }

            const firstData = relicObj?.[key] as RelicDataItem | undefined;
            if (!firstData) return;

            setRelic(firstData.relic);
            setExpRate(firstData.ExpRate);
            setRscore(firstData.Rscore);
            setPieNums(firstData.PieNums);
            setRank(firstData.Rank);

            standDetails.current=JSON.parse(JSON.stringify(firstData.standDetails));
            //還原至初始狀態
            setIsChangeAble(true);

            
        }
    },[RelicDataArr,relicIndex]);

    //防止使用者更改資料後想要再儲存 而儲存到錯誤資訊
    useEffect(()=>{
        setIsSaveAble(false);
    },[charID,limit,userID])

    function init(){
        //標記歷史紀錄尚未處理完
        setIsLoad(false);
        //將保底次數設為2
        limit.current=2;

        //清空儲存的歷史紀錄
        resetHistory();
        const historyraw = localStorage.getItem(dataStorageLocation);
        let history:historyData[]=(historyraw)?JSON.parse(historyraw):null;
        if(history===null){
            setHistory([]);
            setIsLoad(true);
            updateStatus("尚未有任何操作紀錄","default");
            return;
        }

        showStatus('正在載入過往紀錄中......','process');
        
        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        history = history.filter((h)=>h.version===version);
        localStorage.setItem(dataStorageLocation,JSON.stringify(history));
        if(history != null && history.length > 0){
            setHistory(history);
            updateStatus("先前紀錄已匯入!!","success");
        }else
            updateStatus("尚未有任何操作紀錄","default");  
        
        setIsLoad(true);
    }
    
    type GetRecordParams = {
        sendData?: sendData;
        standard?: selfStand;
        sendlimit?: number;
    };

    //獲得聖遺物資料
    async function getRecord({ sendData, standard, sendlimit }: GetRecordParams){
        
        let apiLink=(window.location.origin==='http://localhost:3000')?`http://localhost:5000/artifact/get`:`https://expressapi-o9du.onrender.com/artifact/get`;
        let Limit = 0;
        //如果是非更新紀錄
        if(!sendData){
            //如果UID本身就不合理 則直接返回錯誤訊息
            if (!/^\d+$/.test(userID.current)||!userID.current) { // 僅允許數字
                updateStatus("請輸入有效的UID!!",'error');
                return ;
            }

            //腳色相關防呆
            if(!charID){
                updateStatus("未選擇任何腳色!!",'error');
                return ;
            }

            if(!selfStand||selfStand.length ===0){
                updateStatus("至少選擇一項加權!!",'error');
                return ;
            }

            //如果優先鎖定的詞條種類並未滿足兩個
            if(selfStand.filter((s:selfStandItem) => (s.SelectPriority ?? 0) > 0).length < 2){
                updateStatus("優先指定詞條至少需要兩個!","error");
                return;
            }

            if(limit.current>4||limit.current<2){
                updateStatus("保底次數只能為2,3或4次!","error");
                return;
            }

            sendData={
                uid:userID.current,
                charID:charID        
            }
        }

        if(!standard)
            standard = [...(selfStand ?? [])];

        Limit = (!sendlimit)?limit.current:sendlimit;
        //送出之前先清空一次資料
        setIsSaveAble(false);
        showStatus('正在尋找匹配資料......','process');
        setIsChangeAble(false);
        clearData();

        await axios.post(apiLink,sendData,{
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (response)=>{

            switch(response.data){
                case 800:
                    updateStatus('找不到該腳色。必須要將腳色放在展示區才可以抓到資料!!','error');
                    setIsChangeAble(true);
                    break;
                case 801:
                    updateStatus('找不到該部件的聖遺物，如果是剛剛才更新的話建議等五分鐘再使用一次!!','error');
                    setIsChangeAble(true);
                    break;
                case 802:
                    updateStatus('該聖遺物等級尚未強化至滿等，請先強化至滿等後再嘗試!','error');
                    setIsChangeAble(true);
                    break;
                case 803:
                    updateStatus('該聖遺物非五星聖遺物，請選擇部位為五星強化滿等之聖遺物','error');
                    setIsChangeAble(true);
                    break;
                case 804:
                    updateStatus('該腳色並未穿著五星聖遺物！！','error');
                    setIsChangeAble(true);
                    break;
                case 810:
                    updateStatus('溝通次數太過於頻繁 請稍後再試!!','error');
                    setIsChangeAble(true);
                    break;
                case 900:
                    updateStatus('系統正在維護\n請稍後再試!','error');
                    setIsChangeAble(true);
                    break;
                default:
                    await processData(response.data,standard,Limit);
                    break;
            }

        }).catch((error)=>{
            if(error.response){
                if(error.response.status===429){
                    updateStatus('請求次數過於頻繁\n請稍後再試!!','error');
                }else{
                    updateStatus('系統正在維護中\n請稍後再試!!','error');
                }
            }else{   
                updateStatus('系統正在維護中\n請稍後再試!!','error');
            }
            
            setIsChangeAble(true);
            return;
        })
    }

    async function processData(relicArr:any,standard:selfStand,getLimit:number){
        let temparr = [];
        
        //針對三詞條跟四詞條分別進行一次模擬
        //對應到強化次數4次跟5次
        for (const r of relicArr) {
            let calData:any= {};

            //聖遺物詞條配置
            let SubData:SubDataItem[]=[];

            r.flat.reliquarySubstats.forEach((s:any,i:number)=>{
                let typeName:AffixItem=AffixName.find((a)=>a.fieldName===s.appendPropId)!;

                let val= s.statValue;
                
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:val, //詞條數值
                    count:0    
                }

                SubData.push(data);
            });

            //1.根據詞條配置計算出所有可能的強化組合
            let relicSubDataCombinations = findSubDatacombinations(SubData);

            //2.根據強化組合排除掉違法組合
            let possibleCount:number[] = filterInvalidCombinations(relicSubDataCombinations);

            //3.計算出可能的聖遺物配置
            

            for (const p of possibleCount) {
                let copySubData = JSON.parse(JSON.stringify(SubData));

                ensureSubDataCount(copySubData, relicSubDataCombinations, p + 1);

                const ExpData = await calscore(r, standard, p + 1, getLimit, copySubData);

                calData[p] = ExpData;
            }
                        
            temparr.push(calData);
        }

        //如果是剛查詢完的 則改成可以儲存
        updateStatus('資料顯示完畢',"success");  
    
        RelicDataArrRef.current = temparr;
        showLimit.current = getLimit;
        setRelicIndex(0);
        setRelicDataArr([...temparr]);
        setIsSaveAble(true);
        setIsChangeAble(true);
    }

    //確定特定情境下的強化次數
    function ensureSubDataCount
        (SubData:SubDataItem[],relicSubDataCombinations:SubDataEnchanceCombinations[],totalCount:number){
        
        console.log(relicSubDataCombinations);
        let remainCount = totalCount;
        //遍歷所有subdata
        SubData.forEach((s,i)=>{
            let compared = relicSubDataCombinations[i];

            //如果該詞條即為初始詞條數值 則強化次數必為0
            if(compared.isinitVal)
                s.count = 0;
            else if(compared.combinations){ //如果該陣列的強度一致 則根據陣列內部單個item長度減一 給予count
                // 找出內部陣列最大長度
                const lengths = compared.combinations.map(c => c.length);
                const maxLen = Math.max(...lengths);
                const minLen = Math.min(...lengths);

                // 強化次數 = 最大長度 - 1
                if(maxLen === minLen){
                    s.count = maxLen - 1;
                    remainCount = remainCount - s.count;
                }
            }
        });


        //第二次遍歷
        let remainAffix = 
            SubData.find((s,i)=>s.count === 0 && !relicSubDataCombinations[i].isinitVal && relicSubDataCombinations[i].combinations?.length!==0)

        console.log(remainAffix);
        if(remainAffix)
            remainAffix.count = remainCount;

    }


    //切換成3詞條或4詞條模擬模式
    function changeAffixCount(){
        if(AffixCount === 3)
            setAffixCount(4);
        else if(AffixCount === 4)
            setAffixCount(3);
    }

    //刪除紀錄
    function clearData(){
        setExpRate(undefined);
        setRank({label:undefined,tag:undefined,color:undefined,value:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelicDataArr([]);
        setRelic(undefined);
    }

    //檢視過往紀錄
    const checkDetails=useCallback((index:number)=>{
        
        const result  = getHistory(index);
        let data: historyData | null = null;
        if (result && !Array.isArray(result) && 'userID' in result) {
            data = result;
        }
        
        if(data){
            setRelicDataArr([...data.dataArr]);
            setRelicIndex(0);
            //limit.current=data.limit;
            showLimit.current=data.limit;
            setAffixCount(3);
            setIsSaveAble(false);
            updateStatus('資料顯示完畢',"success"); 

            //避免第一次顯示區塊 而導致滾動失常
            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    },[getHistory()]);

    //更新紀錄
    const updateDetails=useCallback(async (index:number)=>{
        RelicDataArrRef.current=null;
        showStatus('正在更新資料中');
        const result = getHistory(index);

        let data: historyData | null = null;
        if (result && !Array.isArray(result) && 'userID' in result) {
            data = result;
        }
        if(data){
            let sendData={
                uid:data.userID,
                charID:data.char.charId,            
                partsIndex:6
            };

            let cloneDetails: selfStand = data.dataArr[0][3]?.standDetails
                ? data.dataArr[0][3].standDetails.map((item: any) => ({ ...item }))
                : data.dataArr[0][4].standDetails.map((item: any) => ({ ...item }))

            await getRecord({sendData:sendData, standard:cloneDetails, sendlimit:data.limit})
            .then(()=>{
                //計算平均分數與平均機率

                if(RelicDataArrRef.current){
                    let sum = 0;
                    let sum2 = 0;

                    //資料筆數
                    let count = 0;

                    RelicDataArrRef.current.forEach((r)=>{
                        for(var i = 3;i<=4;i++){
                            if(!r[i]) continue;

                            sum += Number(r[i].Rscore);
                            sum2 += r[i].ExpRate!;
                            count +=1;
                        }
                    });
                    let avgScore = Math.round((sum / count) * 10) / 10;
                    let calDate=new Date();
                    let avgRank:Stand|undefined = undefined;
                    let avgRate = Number((sum2*100/count).toFixed(1));
                    
                    scoreStand.forEach((stand)=>{
                        //接著去找尋這個分數所屬的區間
                        if(stand.stand<=avgScore&&avgRank===undefined)
                            avgRank=stand;
                    });

                    //儲存紀錄
                    let newHistorydata={
                        version:version,
                        calDate:calDate.toISOString().split('T')[0],
                        userID:data!.userID,
                        char:data!.char,
                        dataArr:RelicDataArrRef.current,
                        avgScore:avgScore,
                        avgRank:avgRank,
                        avgRate:avgRate,
                        limit:showLimit.current
                    };
    
                    let oldHistory=JSON.parse(JSON.stringify(getHistory()));
                    oldHistory[index]=newHistorydata;
                    localStorage.setItem(dataStorageLocation,JSON.stringify(oldHistory));
                    setHistory(oldHistory)

                    updateStatus('已更新','success');
                    setIsSaveAble(false);
                }else{
                    updateStatus('該腳色似乎不存在於展示櫃上','error');
                }   
            }).catch((error)=>{
                console.error("錯誤發生：", error);             // 原始錯誤物件
                console.error("錯誤訊息：", error.message);     // 錯誤文字
                console.error("堆疊追蹤：", error.stack);       // 🔥 鎖定發生行數
            });
        }
        
            
    },[getHistory()]);

    //刪除過往紀錄 
    const deleteHistoryData=useCallback((index:number)=>{
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的

        if(!confirm("確定要刪除紀錄嗎?")){
            return;
        }
        const result = getHistory();
        let oldHistory: historyData[] = Array.isArray(result)
            ? result.filter((item): item is historyData => 'userID' in item)
            : [];

        //呼叫store刪除該歷史紀錄
        deleteHistory(index);

        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem(dataStorageLocation,JSON.stringify(oldHistory));
        
        //強制觸發刷新紀錄
        setTimeout(() => {
            updateStatus('成功刪除該筆資料','success');
        }, 0);
    },[getHistory()]);

    function calscore(relic:any,standard:selfStand,enchanceCount:number,limit:number,SubData:SubDataItem[]){
        return new Promise((resolve)=>{
            let isCheck=true;
            //將獲得到聖遺物先儲存起來

            //將運行結果丟到背景執行
            let worker=new Worker(new URL('../../worker/worker.ts', import.meta.url));
            let MainAffix:AffixItem=AffixName.find((a)=>a.fieldName===relic.flat.reliquaryMainstat.mainPropId)!;//必不為undefined

            let postData={
                charID:charID,
                MainData:MainAffix.name,
                SubData:SubData,
                partsIndex:EquipType[relic.flat.equipType],
                standard:standard,
                limit:limit,
                enchanceCount:enchanceCount
            };
            
            if(isCheck){
                showStatus('數據計算處理中......','process');
                worker.postMessage(postData);

                // 接收 Worker 返回的訊息
                worker.onmessage = function (event) {
                    let returnData = {
                        relic:relic,
                        ExpRate:event.data.expRate,
                        Rscore:event.data.relicscore,
                        PieNums:event.data.returnData,
                        Rank:event.data.relicrank,
                        standDetails:standard,
                        SubData:SubData
                    };
                    resolve(returnData);
                };
            }
        })
        
    }

    //儲存紀錄
    function saveRecord(){
        let selectChar:characters=characters.find((c)=>c.charId===charID)!;
        
        //獲得資料
        const result = limitHistory();

        let historyGet: historyData[];

        if (Array.isArray(result)) {
            // 篩選只取 historyData 型別的資料（可依實際定義調整）
            historyGet = result.filter(
                (item): item is historyData => 'userID' in item
            );
        }

        //如果當前沒有任何資料則不予匯入
        if(RelicDataArr.length === 0){
            updateStatus("當前沒有任何數據，不予儲存!!",'error');
            return;
        }
        //如果玩家ID當前並沒有輸入成功
        if(!userID.current){
            updateStatus("沒有輸入玩家ID，請再試一次!!","error");
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            updateStatus("沒有選擇任何腳色!!","error");
            return;
        }

        if(limit.current>4||limit.current<2){
            updateStatus("保底次數有誤!!","error");
            return;
        }

        //計算平均分數與平均機率
        let sum = 0;
        let sum2 = 0;
        let count = 0;

        let copyRelicDataArr:RelicDataArr = [...RelicDataArr];
        copyRelicDataArr = copyRelicDataArr.filter((r)=>{
            for(var i = 3;i<=4;i++){
                if(!r[i]) continue;

                //如果該遺器並沒有計算出機率 則會跳過
                if(r[i].ExpRate ===null||r[i].PieNums === null)
                    return false;
            }
            return true;
        })

        copyRelicDataArr.forEach((r)=>{
           for(var i = 3;i<=4;i++){
                if(!r[i]) continue;

                sum +=Number(r[i].Rscore);
                sum2 += r[i].ExpRate!;//前面已經有過濾掉
                count +=1;
            }
        });
        let avgScore = Math.round((sum / count) * 10) / 10;
        let calDate= new Date();
        let avgRank:Stand|undefined = undefined;
        let avgRate = Number((sum2*100/count).toFixed(1));
        
        scoreStand.forEach((stand)=>{
            //接著去找尋這個分數所屬的區間
            if(stand.stand<=avgScore&&avgRank===undefined)
                avgRank=stand;
        });


        //儲存紀錄
        let data:historyData={
            version:version,
            calDate:calDate.toISOString().split('T')[0],
            userID:userID.current,
            char:selectChar,
            dataArr:RelicDataArr,
            avgScore:avgScore,
            avgRank:avgRank,
            avgRate:avgRate,
            limit:showLimit.current
        };

        //針對原紀錄做深拷貝
        let oldHistory=JSON.parse(JSON.stringify(getHistory()));
        
        //更新紀錄
        addHistory(data);
        oldHistory.push(data);
        updateStatus('已儲存','success');
        setIsSaveAble(false);

        
        //覆蓋原有紀錄
        localStorage.setItem(dataStorageLocation,JSON.stringify(oldHistory));
    }
    
    //共用context狀態
    let ImporterStatus={
        //數值資料
        charID:charID,
        selfStand:selfStand,
        partsIndex:partsIndex,
        standDetails:standDetails.current,
        partArr:partArr,
        isChangeAble:isChangeAble,
        RelicDataArr:RelicDataArr,
        relicIndex:relicIndex,
        isLoad:isLoad,
        limit:showLimit.current,
        mode:"Importer",
        button:true,

        //RelicData
        relic:relic,
        Rscore:Rscore,
        Rrank:Rrank,
        ExpRate:ExpRate,
        PieNums:PieNums,
        AffixCount:AffixCount,

        //方法
        deleteHistoryData:deleteHistoryData,
        checkDetails:checkDetails,
        updateDetails:updateDetails,
        changeAffixCount:changeAffixCount,

        //state管理
        setCharID:setCharID,
        setSelfStand:setSelfStand,
        setIsSaveAble:setIsSaveAble,
        setRelicIndex:setRelicIndex,
        setRelic:setRelic
    }
    
    return(
    <SiteContext.Provider value={ImporterStatus}>
        <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[95%] rounded-md '>
            <div className='rounded-md'>
                <div className='rowWrap max-[600px]:w-[95%]'>
                    <div className='flex flex-col w-2/5 SectionBg rounded-md max-[1250px]:w-full'>
                        <div className='flex flex-row items-center ml-2 mt-2'>
                            <h1 className='text-red-600 font-bold text-2xl'>自動匯入</h1>
                            <div className='hintIcon ml-2 overflow-visible' 
                                data-tooltip-id="ImporterHint">
                                <span className='text-white'>?</span>
                            </div>
                            <div className='relative flex flex-row ml-auto mr-3' onClick={()=>openWindow()}>
                                <img src={`${ process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/breakingNews.svg`} alt="icon"/>
                                <span className='text-white underline cursor-pointer'>最新更新</span>
                            </div>
                        </div>
                        <div className='flex flex-col px-2 rounded-md'>
                            <div className='flex flex-row [&>*]:mr-2 my-3 items-baseline max-[400px]:!flex-col'>
                                <div className='ImporterFlex'>
                                    <span className='SubTitle'>玩家UID :</span>
                                </div>
                                <input type='text' placeholder='Genshin UID' 
                                        className='h-[40px] max-w-[170px] pl-2 
                                                bg-inherit text-white outline-none border-b border-white' 
                                        id="userId"
                                        onChange={(e)=>userID.current=e.target.value}
                                        disabled={!isChangeAble}
                                        autoComplete="off"/>
                            </div>
                            <div className='flex flex-row [&>*]:mr-2 my-3 max-[400px]:!flex-col'>
                                <div className='ImporterFlex'>
                                    <span className='SubTitle whitespace-nowrap'>Characters 腳色:</span>
                                </div>                       
                                <div className='flex flex-row items-center'>
                                    <CharSelect  />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col` } >
                                <div className='ImporterFlex'>
                                    <span className='SubTitle whitespace-nowrap'>Affix 有效詞條:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <StandardSelect />
                                </div>
                            </div>
                            {
                                (selfStand&&selfStand.length!==0)?
                                <div className={`mt-3 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`}>
                                    <div className='ImporterFlex'>
                                        <span className='SubTitle'>Params 參數:</span>
                                    </div>
                                    <div className='flex flex-row items-baseline'>
                                        <ShowStand lock={true}/>
                                        <div className='hintIcon ml-2 overflow-visible'
                                            data-tooltip-id="ParamsHint">
                                            <span className='text-white'>?</span>
                                        </div>
                                    </div>
                                </div>:null
                            }
                            <div className={`flex flex-row my-3`}>
                                <div className='ImporterFlex'>
                                    <span className='SubTitle'>Limit 保底次數:</span>
                                </div>
                                <div className='pl-1 flex flex-row items-center'>
                                    <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="\d*"
                                            className="bgInput w-[40px] text-center"
                                            defaultValue={2}
                                            onChange={(event) => {
                                                    const value = event.target.value;
                                                    if (value !== '') {
                                                        const intVal = parseInt(value);
                                                        if (!isNaN(intVal)) {
                                                            limit.current=intVal;
                                                        }
                                                    }
                                                }}/>
                                    <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="LimitHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className='my-3 flex flex-row [&>*]:mr-2 justify-end max-w-[400px] max-[900px]:justify-center'>
                                <ProcessBtn text={'開始匹配'} handler={()=>getRecord({})} disabled={!isChangeAble}/>
                                <ProcessBtn text={'儲存紀錄'} handler={()=>saveRecord()} disabled={!isSaveAble}/>
                            </div>
                        </div>
                    </div>
                    <div className={`w-[55%] pb-3 pt-1 h-fit flex-wrap max-[1250px]:w-full max-[1250px]:mb-5 ml-2 SectionBg rounded-md max-[1250px]:ml-0 max-[1250px]:mt-2`}>
                        <div className='flex flex-row items-baseline px-2 max-[600px]:justify-center'>
                            <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                            <div className='hintIcon ml-2 overflow-visible'
                                data-tooltip-id="HistoryHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                        <div className='max-h-[300px] overflow-x-scroll grayScrollBar p-2 flex flex-row max-[600px]:items-center'>
                            <PastPreviewList  />
                        </div> 
                    </div>
                </div>
            </div>
            {
                (RelicDataArr && RelicDataArr.length > 0)?
                <div className={`rowWrap mt-2 w-full SectionBg shadowBox px-2 mb-5 rounded-md`} >
                    <div className={`w-full max-[500px]:w-[90%] max-[500px]:mx-auto`}>
                        <RelicSelect />
                    </div>
                    <div className={`rowWrap w-1/2 max-[800px]:w-full max-[500px]:w-[90%] max-[500px]:mx-auto`}>
                        <RelicData  />
                    </div>                
                    <div className={`mt-3 rowWrap w-1/2 max-[700px]:items-center max-[700px]:w-full ${(!Rscore)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} id="resultDetails">
                        <RelicDataModeSelect />
                        <Result />
                    </div>
                </div>:null
            }
        </div>
        <div>
            <Tooltip id="CharHint"  
                    place="right-start"
                    arrowColor='gray' 
                    render={()=>
                        <div className='flex flex-col'>
                            <span className='text-white'>選擇指定腳色，可以使用中文或英文關鍵字</span>
                            <span className='text-white'>例如:霄宮&rarr;Yoimiya</span>
                        </div>
                    }/>
            <Tooltip id="HistoryHint"  
                    place="top-start"
                    arrowColor='gray'
                    render={()=>
                        <HintHistory />
                    }/>
            <Tooltip id="RelicSelectHint"  
                    place="top-start"
                    arrowColor='gray'
                    style={{zIndex:100}}
                    render={()=>
                        <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
                            <span>下方會顯示出該腳色符合條件的所有聖遺物</span>
                            <span>點選聖遺物即可查看個別資訊</span>
                            <div className='mt-2 flex flex-col'>
                                <span className='text-white font-bold'>注意事項</span>
                                <span className='!text-red-600 font-bold'>僅顯示符合條件的五星滿等聖遺物</span>
                            </div>
                        </div>
                    }/>
            <Tooltip id="ImporterHint" 
                    place='right-start'
                    arrowColor='gray'
                    render={()=><HintImporter/>}
                    clickable={true}/>
            <Tooltip id="ParamsHint" 
                    place='right-start'
                    arrowColor='gray'
                    render={()=><HintParams />}
                    clickable={true}/>
            <Tooltip id="LimitHint" 
                    place='right-start'
                    arrowColor='gray'
                    style={{zIndex:100}}
                    render={()=>
                        <div className='flex flex-col'>
                            <span>指定詞條強化保底次數</span>
                            <span>可以根據個人目前使用強化情況調整</span>
                            <span>指定詞條們的共享保底次數，最低為2、最高為4</span>
                        </div>
                    }
                    clickable={true}/>
        </div>
            
    </SiteContext.Provider>)
}




export default Importer;
