"use client";
import React, { useEffect, useReducer , createContext } from 'react';
import characters from '../../data/characters';
import AffixName from '../../data/AffixName';
import EquipType from '@/data/EquipType';
import { useState ,useRef,useCallback } from 'react';
import '../../css/simulator.css';
import axios from 'axios';
import { Tooltip } from 'react-tooltip'
import { usePathname } from 'next/navigation';

import {PastPreviewList} from '@/components/PastPreviewList';
import Result from '@/components/Result';
import { StandDetails, ShowStand } from '@/components/StandDetails';
import { RelicData } from '@/components/RelicData';
import { StandardSelect,   CharSelect ,RelicSelect } from '@/components/Select';

import SiteContext from '@/context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import HistoryStore from '@/model/historyStore';

import HintHistory from '@/components/Hint/HintHistory';
import HintImporter from '@/components/Hint/HintImporter';
import HintStandDetails from '@/components/Hint/HintStandDetails';


function Importer(){
    //版本序號
    const version="1.4";
    const maxHistoryLength = 6;

    //玩家ID跟腳色ID
    const userID=useRef('');
    const [charID,setCharID]=useState(undefined);

    //部位代碼
    const partsIndex=6;

    //找到的聖遺器陣列以及目前檢視索引，預設為0
    const [relic,setRelic]=useState();
    const [relicIndex,setRelicIndex] = useState(0);
    
    const [limit,setLimit]=useState(2);

    //期望值、儀器分數、評級、圖表資料、以及 切換成3詞條或4詞條模擬模式
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [PieNums,setPieNums]=useState(undefined);
    const [AffixCount,setAffixCount]=useState(3);

    // 找到所有遺器後計算的所有數據，包含期望值、分數等
    const [RelicDataArr,setRelicDataArr]=useState([]);
    const RelicDataArrRef = useRef(null);
    
    // 共用statusMsg 
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    //資料儲存位置
    const dataStorageLocation = 'GenshinImporterData';


    //獲取操作歷史紀錄的function
    const {setHistory,getHistory,addHistory,deleteHistory,resetHistory,limitHistory} = HistoryStore();
    const [isLoad,setIsLoad] = useState(false);

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);
    const standDetails=useRef([]);

    //router相關
    const pathname = usePathname();

    //元件狀態
    const [isChangeAble,setIsChangeAble]=useState(true);
    const [isSaveAble,setIsSaveAble]=useState(false);
    
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

    //當遺器資料更新時
    useEffect(()=>{
        if(RelicDataArr.length !==0){
            //顯示第一個儀器 並顯示三詞條
            setRelic(RelicDataArr[relicIndex][AffixCount].relic)
            setExpRate(RelicDataArr[relicIndex][AffixCount].ExpRate);
            setRscore(RelicDataArr[relicIndex][AffixCount].Rscore)
            setPieNums(RelicDataArr[relicIndex][AffixCount].PieNums);
            setRank(RelicDataArr[relicIndex][AffixCount].Rank);
            updateStatus('資料顯示完畢',"success");

            standDetails.current=RelicDataArr[relicIndex][AffixCount].standDetails;

            //還原至初始狀態
            setIsChangeAble(true);
        }
    },[RelicDataArr,relicIndex,AffixCount]);

    //當遺器被選擇時
    useEffect(()=>{
        if(relic){
            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    },[relic]);


    function init(){
        //標記歷史紀錄尚未處理完
        setIsLoad(false);
        //將保底次數設為2
        setLimit(2);

        //清空儲存的歷史紀錄
        resetHistory();

        let history=JSON.parse(localStorage.getItem(dataStorageLocation));
        if(history===null){
            setHistory([]);
            setIsLoad(true);
            return;
        }

        showStatus('正在載入過往紀錄中......');
        
        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        history=history.filter((h)=>h.version===version);
        localStorage.setItem(dataStorageLocation,JSON.stringify(history));

        if(history != null && history.length > 0){
            setHistory(history);
            updateStatus("先前紀錄已匯入!!","success");
        }else
            updateStatus("尚未有任何操作紀錄","default");  
        
        setIsLoad(true);
    }
    

    //獲得遺器資料
    async function getRecord(sendData = undefined ,standard = undefined){
        
        let apiLink=(window.location.origin==='http://localhost:3000')?`http://localhost:5000/artifact/get`:`https://expressapi-o9du.onrender.com/artifact/get`;

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
            if(selfStand.filter((s)=>s.SelectPriority>0).length<2){
                updateStatus("優先指定詞條至少需要兩個!","error");
                return;
            }

            if(limit>4||limit<2){
                updateStatus("保底次數只能為2,3或4次!","error");
                return;
            }

            sendData={
                uid:userID.current,
                charID:charID        
            }
        }

        if(!standard)
            standard = selfStand;

        //送出之前先清空一次資料
        setIsSaveAble(false);
        showStatus('正在尋找匹配資料......');
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
                    updateStatus('該聖遺物非五星遺器，請選擇部位為五星強化滿等之聖遺物','error');
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
                    await process(response.data,standard);
                    break;
            }

        }).catch((error)=>{
            console.log(error);
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

    async function process(relicArr,standard = undefined){
        let temparr = [];

        //檢查加權標準
        standard.forEach((s)=>{
            if(s.value===''){
                updateStatus('加權指數不可為空或其他非法型式','error');
                return;
            }
        });

        //針對三詞條跟四詞條分別進行一次模擬
        //對應到強化次數4次跟5次
        for (const r of relicArr) {
            let calData = {};
            let checkSubstat = checkRelic(r,standard);
            if(!checkSubstat){
                continue;
            }
                
            for(var i=3;i<=4;i++){
                
                const ExpData = await calscore(r,standard,i+1);  
            
                calData[i]= ExpData;
            }
            
            temparr.push(calData);
        }
        //如果是剛查詢完的 則改成可以儲存
        if(temparr.length === 0){
            updateStatus("該腳色身上的聖遺物不符合重洗條件!!","default");
            setIsChangeAble(true);
        }
        setRelicDataArr(temparr);
        RelicDataArrRef.current=temparr;
        //如果全部的遺器都不符合條件 則直接回傳訊息
        
        setIsSaveAble(true);
       
    }

    //檢查該遺器是否含有至少指定副詞條2個以上
    function checkRelic(targetRelic, standard) {
        const substats = targetRelic.flat.reliquarySubstats;
        const matched = substats.filter(sub => 
            standard.some(std => std.name === AffixName.find((a)=>a.fieldName ===sub.appendPropId).name)
        );

        return matched.length >= 2;
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
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic();
    }

    //檢視過往紀錄
    const checkDetails=useCallback((index)=>{
        
        let data= getHistory(index);
        
        setRelicDataArr([...data.dataArr]);
        setRelicIndex(0);
        setLimit(data.limit);
        setAffixCount(3);
        setIsSaveAble(false); 

        //避免第一次顯示區塊 而導致滾動失常
        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    },[getHistory()]);

    //更新紀錄
    const updateDetails=useCallback(async (index)=>{
        showStatus('正在更新資料中');
        let data = getHistory(index);

        let sendData={
            uid:data.userID,
            charID:data.char.charId,            
            partsIndex:6
        };

        let cloneDetails = data.dataArr[0][3].standDetails.map(item => ({ ...item }));
        setLimit(data.limit);

        await getRecord(sendData,cloneDetails)
        .then(()=>{
            console.log(RelicDataArrRef.current);
            //計算平均分數與平均機率

            if(RelicDataArrRef.current){
                let sum = 0;
                let sum2 = 0;

                RelicDataArrRef.current.forEach((r)=>{
                    for(var i = 3;i<=4;i++){
                        sum +=Number(r[i].Rscore);
                        sum2 += r[i].ExpRate;
                    }
                });
                let avgScore = Number(parseFloat(sum/(RelicDataArrRef.current.length*2)).toFixed(1));
                let calDate=new Date();
                let avgRank = undefined;
                let avgRate = Number((sum2*100/(RelicDataArrRef.current.length*2)).toFixed(1));
                
                scoreStand.forEach((stand)=>{
                    //接著去找尋這個分數所屬的區間
                    if(stand.stand<=avgScore&&avgRank===undefined)
                        avgRank=stand;
                });

                //儲存紀錄
                let newHistorydata={
                    version:version,
                    calDate:calDate.toISOString().split('T')[0],
                    userID:data.userID,
                    char:data.char,
                    dataArr:RelicDataArrRef.current,
                    avgScore:avgScore,
                    avgRank:avgRank,
                    avgRate:avgRate
                };
 
                let oldHistory=JSON.parse(JSON.stringify(getHistory()));
                oldHistory[index]=newHistorydata;
                localStorage.setItem(dataStorageLocation,JSON.stringify(oldHistory));
                setHistory(oldHistory)

                updateStatus('已更新','success');
                setIsSaveAble(false);
            }


            
        }).catch((error)=>{
            console.error("錯誤發生：", error);             // 原始錯誤物件
            console.error("錯誤訊息：", error.message);     // 錯誤文字
            console.error("堆疊追蹤：", error.stack);       // 🔥 鎖定發生行數
        });
            
    },[getHistory()]);

    //刪除過往紀錄 
    const deleteHistoryData=useCallback((index)=>{
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        let oldHistory=getHistory();

        //呼叫store刪除該歷史紀錄
        deleteHistory(index);

        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem(dataStorageLocation,JSON.stringify(oldHistory));
        
        //強制觸發刷新紀錄
        setTimeout(() => {
            updateStatus('成功刪除該筆資料','success');
        }, 0);
    },[getHistory()]);

    function calscore(relic,standard,enchanceCount){
        return new Promise((resolve)=>{
            let isCheck=true;
            //將獲得到遺器先儲存起來

            //將運行結果丟到背景執行
            let worker=new Worker(new URL('../../worker/worker.js', import.meta.url));
            let MainAffix=AffixName.find((a)=>a.fieldName===relic.flat.reliquaryMainstat.mainPropId);
            let SubData=[];

            relic.flat.reliquarySubstats.forEach((s,i)=>{
                let typeName=AffixName.find((a)=>a.fieldName===s.appendPropId);

                let val= s.statValue;
                
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:val, //詞條數值    
                }

                SubData.push(data);
            });
            
            //如果篩選有速度詞條 需給予0.5誤差計算 
            /*let deviation=(SubData.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
            SubData.forEach(s=>{
                if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                    deviation+=0.2;
            })*/
            //制定送出資料格式
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
                showStatus('數據計算處理中......');
                worker.postMessage(postData);

                // 接收 Worker 返回的訊息
                worker.onmessage = function (event) {
                    let returnData = {
                        relic:relic,
                        ExpRate:event.data.expRate,
                        Rscore:event.data.relicscore,
                        PieNums:event.data.returnData,
                        Rank:event.data.relicrank,
                        standDetails:standard
                    };

                    resolve(returnData);
                };
            }
        })
        
    }

    //儲存紀錄
    function saveRecord(){
        let selectChar=characters.find((c)=>c.charId===charID);

        //如果原本紀錄超過6個 要先刪除原有紀錄
        if(getHistory().length>=maxHistoryLength)
            limitHistory();

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

        //計算平均分數與平均機率
        let sum = 0;
        let sum2 = 0;
        RelicDataArr.forEach((r)=>{
           for(var i = 3;i<=4;i++){
                sum +=Number(r[i].Rscore);
                sum2 += r[i].ExpRate;
           }
        });
        let avgScore = Number(parseFloat(sum/(RelicDataArr.length*2)).toFixed(1));
        let calDate=new Date();
        let avgRank = undefined;
        let avgRate = Number((sum2*100/(RelicDataArr.length*2)).toFixed(1));
        
        scoreStand.forEach((stand)=>{
            //接著去找尋這個分數所屬的區間
            if(stand.stand<=avgScore&&avgRank===undefined)
                avgRank=stand;
        });


        //儲存紀錄
        let data={
            version:version,
            calDate:calDate.toISOString().split('T')[0],
            userID:userID.current,
            char:selectChar,
            dataArr:RelicDataArr,
            avgScore:avgScore,
            avgRank:avgRank,
            avgRate:avgRate,
            limit:limit
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
        limit:limit,
        
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
                <div className='flex flex-row flex-wrap max-[600px]:w-[95%] '>
                    <div className='flex flex-col w-2/5 bg-[rgba(0,0,0,0.5)] rounded-md max-[1250px]:w-[100%] test'>
                        <div className='flex flex-row items-center ml-2 mt-2'>
                            <h1 className='text-red-600 font-bold text-2xl'>遺器匯入</h1>
                            <div className='hintIcon ml-2 overflow-visible' 
                                data-tooltip-id="ImporterHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                        <div className='flex flex-col px-2 rounded-md'>
                            <div className='flex flex-row [&>*]:mr-2 my-3 items-baseline max-[400px]:!flex-col'>
                                <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'><span className='text-white'>玩家UID :</span></div>
                                <input type='text' placeholder='HSR UID' 
                                        className='h-[40px] max-w-[170px] pl-2 
                                                bg-inherit text-white outline-none border-b border-white' 
                                        id="userId"
                                        onChange={(e)=>userID.current=e.target.value}
                                        disabled={!isChangeAble}
                                        autoComplete="off"/>
                            </div>
                            <div className='flex flex-row items-center [&>*]:mr-2 my-3 max-[400px]:!flex-col'>
                                <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white whitespace-nowrap'>Characters 腳色:</span>
                                </div>                       
                                <div className='flex flex-row items-center'>
                                    <CharSelect  />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col` } >
                                <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white whitespace-nowrap'>Affix 有效詞條:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <StandardSelect />
                                </div>
                            </div>
                            <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`}>
                                <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Params 參數:</span>
                                </div>
                                <ShowStand />
                            </div>
                            <div className={`flex flex-row my-3`}>
                                <div className='w-[200px] text-right'>
                                    <span className='text-white'>Limit 保底次數:</span>
                                </div>
                                <div className='pl-1 flex flex-row items-center'>
                                    <input type='text-white' className='bgInput w-[40px] text-center' 
                                            onChange={(event)=>setLimit(parseInt(event.target.value))} defaultValue={2}/>
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="LimitHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className='my-3 flex flex-row [&>*]:mr-2 justify-end max-w-[400px] max-[900px]:justify-center'>
                                <button className='processBtn' onClick={()=>getRecord()}  disabled={!isChangeAble}>開始匹配</button>
                                <button className='processBtn' onClick={()=>saveRecord()} disabled={!isSaveAble}>儲存紀錄</button>
                            </div>
                            
                        </div>
                    </div>
                    <div className={`w-[55%] pb-3 pt-1 h-fit flex-wrap max-[1250px]:w-[100%] max-[1250px]:mb-5 ml-2 bg-[rgba(0,0,0,0.5)] rounded-md max-[1250px]:ml-0 max-[1250px]:mt-2`}>
                        <div className='flex flex-row items-baseline px-2 max-[600px]:justify-center'>
                            <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                            <div className='hintIcon ml-2 overflow-visible'
                                data-tooltip-id="HistoryHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                        <div className='max-h-[300px] overflow-y-scroll p-2  hiddenScrollBar flex flex-row flex-wrap max-[600px]:!flex-col max-[600px]:!flex-nowrap max-[600px]:items-center'>
                            <PastPreviewList  />
                        </div> 
                    </div>
                </div>
            </div>
            <div className={`flex flex-row flex-wrap mt-2 w-[100%] ${(!PieNums)?'hidden':''} bg-[rgba(0,0,0,0.5)] shadowBox px-2 mb-5 rounded-md`} >
                <div className={`w-[100%] ${(PieNums===undefined)?'hidden':''} max-[500px]:justify-center`}>
                    <RelicSelect />
                </div>
                <div className={`mt-3 flex flex-row flex-wrap w-1/4  max-[700px]:w-[50%] ${(!PieNums)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`}>
                    <RelicData  mode={'Importer'} button={false}/>
                </div>
                <div className={`mt-3 w-1/4 max-[700px]:w-[50%] ${(!PieNums)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                    <StandDetails />
                </div>
                <div className={`mt-3 flex flex-col flex-wrap w-1/2 max-[700px]:w-[100%] ${(!PieNums)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} id="resultDetails">
                    <div>
                        <button className='underline cursor-pointer' onClick={()=>changeAffixCount()}>{(AffixCount===3)?'目前為3詞條':'目前為4詞條'}</button>
                    </div>
                    <Result />
                </div>
            </div>
        </div>
        <div>
            <Tooltip id="CharHint"  
                    place="right-start" 
                    render={()=>
                        <div className='flex flex-col'>
                            <span className='text-white'>選擇指定腳色，可以使用中文或英文關鍵字</span>
                            <span className='text-white'>例如:Jingliu&rarr;鏡流</span>
                        </div>
                    }/>
            <Tooltip id="HistoryHint"  
                    place="top-center"
                    render={()=>
                        <HintHistory />
                    }/>
            <Tooltip id="RelicSelectHint"  
                    place="top-start"
                    render={()=>
                        <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
                            <span>下方會顯示出該腳色符合條件的所有遺器</span>
                            <span>點選遺器即可查看個別資訊</span>
                            <span className='!text-red-600 font-bold'>僅顯示符合條件的五星滿等遺器遺器</span>
                        </div>
                    }/>
            <Tooltip id="ImporterHint" 
                    place='right-start'
                    render={()=><HintImporter/>}
                    clickable={true}/>
            <Tooltip id="LimitHint" 
                    place='right-start'
                    render={()=>
                        <div>
                            <span>指定詞條們的共享保底次數，最低為2，最高為4</span>
                        </div>
                    }
                    clickable={true}/>
            <Tooltip id="StandDetailsHint" 
                    place='right-start'
                    render={()=><HintStandDetails />}/>
        </div>
            
    </SiteContext.Provider>)
}




export default Importer;
