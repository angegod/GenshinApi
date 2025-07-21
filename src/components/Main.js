"use client"
import React, { Component, use } from 'react';
import { useState,useEffect,useRef } from 'react';
import { CharSelect, MainAffixSelect,PartSelect,StandardSelect,SubAffixSelect } from './Select';
import { ShowStand } from './StandDetails';
import { useStatusToast } from '@/context/StatusMsg';
import { RelicData_simulate as RelicData } from './RelicData';
import { StandDetails } from './StandDetails';
import { PastPreviewList_simulator } from './PastPreviewList';
import Result from './Result';
import { findCombinations } from '@/data/combination';
import '@/css/main.css';
import SiteContext from '@/context/SiteContext';
import HistoryStore from '@/model/historyStore';
import characters from '@/data/characters';
import { Tooltip } from 'react-tooltip';

import SubAffixHint from './Hint/SubAffixHint';
import HintSimulator from './Hint/HintSimulator';

function Main(){
    //紀錄版本號
    const version = 1.1;

    //過往歷史紀錄最大筆數
    const maxHistoryLength = 6;

    //資料儲存位置
    const dataStorageLocation = 'GenshinSimulatorData';

    //腳色
    const [charID,setCharID]=useState(null);

    //聖遺物主詞條 部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState();

    //聖遺物副詞條 因為subdata還要監控元件狀態 所以要用state管理
    //const SubData=useRef([]);
    const [SubData,setSubData]=useState([]);
    const partArr = ['生之花','死之羽','時之沙','空之杯','理之冠'];

    //是否可以儲存(防呆用)、是否可以立馬變更
    const [isSaveAble,setIsSaveAble]=useState(false);
    const [isChangeAble,setIsChangeAble]=useState(true);

    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [statusMsg,setStatusMsg]=useState(undefined);
    const [processBtn,setProcessBtn]=useState(true);
    const standDetails=useRef([]);
    const [PieNums,setPieNums]=useState(undefined);

    //共用statusMsg
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);

    //找到的遺器
    const [relic,setRelic]=useState();

    //保底次數 最低為2
    const [limit,setLimit]=useState(2);

    //獲取操作歷史紀錄的function
    const {setHistory,getHistory,addHistory,deleteHistory} = HistoryStore();

    //是否記錄初始化完畢
    const [isLoad,setIsLoad] = useState(false);
    
    
    useEffect(()=>{
        init();
    },[])

    //初始化
    function init(){
        showStatus('正在載入過往紀錄中......','process');
        let initSubData =SubData;
        for(var i=0;i<=3;i++){
            let data={
                index:i, //索引
                subaffix:0,//詞條種類
                data:0, //詞條數值
                count:0, //強化次數
                isSelect:false //是否指定為共享次數
            }

            initSubData.push(data);
        }
        setSubData(initSubData);

        //先填入過往歷史紀錄
        let oldHistory = JSON.parse(localStorage.getItem(dataStorageLocation));
        console.log(oldHistory);
        setHistory((!oldHistory)?[]:oldHistory);


        if(!oldHistory)
            updateStatus('尚未有任何操作紀錄!!','default');
        else
            updateStatus('先前紀錄已匯入!!','success');

        setIsLoad(true);
    }

    //清除相關資料
    function clearData(){
        setExpRate(undefined);
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic(undefined);
    }

    //整合並儲存遺器資訊
    function saveRelic(){
        let data={
            main_affix:MainSelectOptions,
            subaffix:[]
        }

        let SubDataArr = SubData;

        SubDataArr.forEach((s,i)=>{
            if(!['生命值','攻擊力','防禦力','元素精通'].includes(s.subaffix))
                s.display=s.data+'%';
            else
                s.display=s.data;
        })
        data.subaffix=SubDataArr;
        data.type = parseInt(partsIndex);
        setSubData(SubDataArr);
        setRelic(data);
    }

    //儲存紀錄
    function saveRecord(){
        let historyData = getHistory();
        let partName=partArr[partsIndex-1];
        let selectChar=characters.find((c)=>c.charId===charID);

        //如果目前則沒有紀錄 則初始化
        if(!historyData)
            setHistory([]);
        else if(historyData.length>=maxHistoryLength)//如果原本紀錄超過6個 要先刪除原有紀錄
            console.log('limit');
        
        //如果當前沒有任何資料則不予匯入
        if(!PieNums||ExpRate===undefined||!Rrank||Rscore===undefined){
            updateStatus('當前沒有任何數據，不予儲存!!','error');
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            updateStatus("沒有選擇任何腳色!!",'error');
            return;
        }


        //儲存紀錄
        let data={
            version:version,
            char:selectChar,
            part:partName,
            mainaffix:MainSelectOptions,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums,
            stand:standDetails.current,
            relic:relic
        };
        console.log(data);
        let newHistory = [...historyData,data];
        localStorage.setItem(dataStorageLocation,JSON.stringify(newHistory));
        addHistory(data);
        updateStatus("紀錄已儲存",'success');
        setIsSaveAble(false);
    }

    //檢視過往紀錄
    function checkDetails(index){
        let data=getHistory(index);
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score);
        updateStatus('資料替換完畢!!','success');
        setPieNums(data.pieData);
        standDetails.current=data.stand;
        setRelic(data.relic);

        //清空模擬強化紀錄
        //setSimulatorData({});

        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        })
    }

    //刪除紀錄
    function deleteHistoryData(index){
        deleteHistory(index);

        //取得更動後的資料
        let history = getHistory();

        localStorage.setItem(dataStorageLocation,JSON.stringify(history));
    }

    //計算聖遺物分數
    function calScore(){
        //先驗證選擇是否有誤
        //副詞條是否有空值?
        //副詞條是否有跟主詞條重複?
        //選定副詞條是否是兩個
        let errors=false;
        let enchanceCount = 0;
        SubData.some((s,i)=>{
            if(s.subaffix===MainSelectOptions){
                //alert(`第${i+1}個詞條選擇\n副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`);
                updateStatus(`第${i+1}個詞條:副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
            else if(s.subaffix==='undefined'||s.subaffix===0){
                updateStatus(`您還有副詞條沒有選擇\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
            enchanceCount += s.count;
        });

        if(errors) return;
        
        if(enchanceCount <4 ||enchanceCount>5){
            updateStatus(`總強化次數只能為4或5次!`,'error');
            return;
        }

        let LimitSelect = SubData.filter((s,i)=>s.isSelect).length;
        if(LimitSelect!==2){
            updateStatus(`您指定詞條數未滿2個!!`,'error');
            return;
        }

        if(errors) return;
        //輸入的副詞條之間是否重複?
        const seen = new Set();
        for (const obj of SubData) {
            if (seen.has(obj['subaffix'])) {
                updateStatus(`副詞條之間不可以選擇重複\n請再重新選擇!!`,'error');
                errors=true;
                return;
            }
            seen.add(obj['subaffix']);
        }

        //檢查標準是否合法
        selfStand.forEach((s)=>{
            if(s.value===''){
                errors=true;
                alert('加權指數不可為空或其他非法型式');
            }
                
        })

        if(errors) return;
        
        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../worker/worker.js', import.meta.url));
        let postData={
            MainData:MainSelectOptions,
            SubData:SubData,
            partsIndex:parseInt(partsIndex),
            standard:selfStand,
            limit:limit,
            enchanceCount:enchanceCount
        };
        //將按鈕disable
        setIsSaveAble(false);
        setProcessBtn(false);
        setIsChangeAble(false);
        showStatus('數據計算處理中!!','process');
        clearData();
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            saveRelic();
            standDetails.current=selfStand;
            
            //恢復點擊
            updateStatus('計算完畢!!','success');
            setProcessBtn(true);
            setIsSaveAble(true);
            setIsChangeAble(true);
        };
    }

    const SubAffixList = ()=>{
        return(
            <div className='flex flex-col'>
                <SubAffixSelect index={0}/>
                <SubAffixSelect index={1}/>
                <SubAffixSelect index={2}/>
                <SubAffixSelect index={3}/>
            </div>
        )
    };


    const MainStatus = {
        partArr:partArr,
        SubData:SubData,
        MainSelectOptions:MainSelectOptions,
        isChangeAble:isChangeAble,
        isSaveAble:isSaveAble,
        partsIndex:partsIndex,
        standDetails:standDetails.current,
        
        selfStand:selfStand,
        charID:charID,
        isLoad:isLoad,

        //聖遺物資料
        Rrank:Rrank,
        Rscore:Rscore,
        relic:relic,
        ExpRate:ExpRate,
        PieNums:PieNums,
        limit:limit,

        checkDetails:checkDetails,
        deleteHistoryData:deleteHistoryData,

        //提供state更新
        setCharID:setCharID,
        setMainSelectOptions:setMainSelectOptions,
        setPartsIndex:setPartsIndex,
        setIsChangeAble:setIsChangeAble,
        setIsSaveAble:setIsSaveAble,
        setSelfStand:setSelfStand,
        setSubData:setSubData
    }

    return(
        <SiteContext.Provider value={MainStatus}>
            <div className='w-4/5 mx-auto mt-3 max-[600px]:w-[90%]'>
                <div className='flex flex-row flex-wrap'>
                    <div className='w-2/5 bg-[rgba(0,0,0,0.5)] p-2 rounded-md max-[1200px]:w-full'>
                        <div>
                            <span className='text-2xl text-red-500 font-bold'>聖遺物重洗模擬</span>
                        </div>
                        <div>
                            <div className='flex flex-row my-3 items-center'>
                                <div className='w-[200px] text-right max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Char 腳色:</span>
                                </div>
                                <div className='ml-1 flex flex-row items-center'>
                                    <CharSelect />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-row my-3'>
                                <div className='w-[200px] text-right max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Parts 部位:</span>
                                </div>
                                <div className='ml-1'>
                                    <PartSelect />
                                </div>
                            </div>
                            <div className={`flex flex-row my-3 ${(partsIndex===undefined)?'hidden':''}`}>
                                <div className='w-[200px] text-right max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Main 主詞條:</span>
                                </div>
                                <div className='ml-1'>
                                    <MainAffixSelect />
                                </div>
                            </div>
                            <div className={`flex flex-row my-3 max-[600px]:flex-wrap ${(!MainSelectOptions)?'hidden':''}`}>
                                <div className='w-[200px] text-right max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Sub 副詞條:</span>
                                </div>
                                <div className='flex flex-row max-[600px]:mx-auto'>
                                    <SubAffixList lock={false}/>
                                    <div className='hintIcon ml-2 overflow-visible'
                                        data-tooltip-id="SubAffixHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex flex-row my-3 items-center ${(!MainSelectOptions)?'hidden':''}`}>
                                <div className='w-[200px] text-right max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Affix 有效詞條:</span>
                                </div>
                                <StandardSelect />
                            </div>
                            <div className={`flex flex-row my-3 ${(!MainSelectOptions)?'hidden':''}`}>
                                <div className='w-[200px] text-right max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Limit 保底次數:</span>
                                </div>
                                <div className='pl-1 flex flex-row items-center'>
                                    <input type='text-white' className='bgInput w-[40px] text-center' 
                                            onChange={(event)=>setLimit(parseInt(event.target.value))} defaultValue={2} max={4}/>
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="LimitHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`} >
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Params 參數:</span>
                                </div>
                                <ShowStand lock={false}/>
                            </div>
                            <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 mb-2 max-w-[400px] flex flex-row [&>*]:mr-2 justify-end max-[400px]:justify-start`}>
                                <div className='flex flex-row mt-1'>
                                    <button className='processBtn mr-2 whitespace-nowrap' 
                                        onClick={()=>calScore()} 
                                        disabled={!processBtn}>計算分數</button>
                                    <button className='processBtn mr-2 whitespace-nowrap' 
                                        onClick={()=>saveRecord()} 
                                        disabled={!isSaveAble}>儲存紀錄</button>
                                </div>
                            </div>
                        </div>  
                    </div>
                    <div className='w-[55%] ml-2 bg-[rgba(0,0,0,0.5)] rounded-md p-2 h-fit max-[1200px]:w-[100%] max-[1200px]:ml-0 max-[1200px]:mt-2'>
                        <div className='flex flex-row items-baseline px-2 max-[600px]:justify-center'>
                            <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                            <div className='hintIcon ml-2 overflow-visible'
                                data-tooltip-id="HistoryHint"> 
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                        <div className='flex flex-row flex-wrap h-max max-h-[300px] overflow-y-scroll hiddenScrollBar max-[600px]:!flex-col max-[600px]:!flex-nowrap max-[600px]:items-center'>
                            <PastPreviewList_simulator />
                        </div>
                    </div>
                </div>
                <div className='w-full my-2'>
                    <div className={`w-full flex flex-row bg-[rgba(0,0,0,0.5)] p-2 rounded-md flex-wrap ${(PieNums===undefined)?'hidden':''}`}>
                        <div className={`flex flex-row flex-wrap w-[18vw]  max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                            <RelicData  mode={'Simulator'} button={false}/>
                        </div>
                        <div className={`w-1/4 max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                            <StandDetails />
                        </div>
                        <div className='flex flex-row flex-wrap w-1/2 max-[700px]:w-[100%] max-[500px]:w-4/5 max-[500px]:mx-auto ' id="resultDetails">
                            <Result />
                        </div>
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
                <Tooltip id="PartSelectHint"  
                        place="right-start" 
                        render={()=>
                            <div className='flex flex-col max-w-[230px]'>
                                <span className='text-white'>選擇遺器部位</span>
                                <span className='text-white'>"主詞條"跟"副詞條"區塊中會自動帶入該部位詞條種類</span>
                            </div>
                        }/>

                <Tooltip id="SubAffixHint"  
                        place="right-start" 
                        render={()=>
                            <SubAffixHint />
                        }/>
                <Tooltip id="HistoryHint"  
                    place="top-center"
                    render={()=>
                        <div className='flex flex-col max-w-[250px] p-1'>
                            <div>
                                <span className='text-white'>此區塊可以查看過往查詢紀錄，下面為個別功能相關簡述。</span>
                            </div>
                            <div className='mt-2 flex flex-col'>
                                <span className='text-md font-bold text-white'>檢視</span>
                                <span>可以查看曾經查詢出來的資訊、包括遺器、評分標準等</span>
                            </div>
                            <div className='mt-2 flex flex-col'>
                                <div>
                                    <span className='text-md font-bold text-white'>刪除</span>
                                </div>
                                <div>
                                    <span>刪除該筆紀錄</span>
                                </div>
                            </div>
                            <div className='mt-2 flex flex-col'>
                                <div>
                                    <span className='text-md font-bold text-white'>注意事項</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='!text-red-500'>"過往紀錄"最多只保留6筆</span>
                                    <span className='!text-yellow-500'>如果在已有6筆資料的情況再新增，則會從最舊的紀錄開始覆蓋掉</span>
                                </div>
                            </div>
                        </div>
                    }/>
                <Tooltip id="SimulatorHint"
                        place='right-start'
                        render={()=><HintSimulator/>}
                        clickable={true}/>
                <Tooltip id="LimitHint"
                        place='right-start'
                        render={()=>
                            <div>
                                <span>指定詞條強化保底次數，可以根據個人目前使用強化情況調整</span>
                            </div>
                        }
                        clickable={true}/>
                <Tooltip id="LimitHint" 
                        place='right-start'
                        render={()=>
                            <div>
                                <span>指定詞條們的共享保底次數，最低為2，最高為4</span>
                            </div>
                        }
                        clickable={true}/>
            </div>
        </SiteContext.Provider>
    )
}

export default Main;