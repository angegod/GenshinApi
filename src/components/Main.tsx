"use client"
import React, { Component, use, useContext } from 'react';
import { useState,useEffect,useRef } from 'react';
import { CharSelect, MainAffixSelect,PartSelect,StandardSelect,SubAffixSelect } from './Select';
import { ShowStand } from './StandDetails';
import { useStatusToast } from '@/context/StatusMsg';
import { RelicData_simulate as RelicData } from './RelicData';
import { StandDetails } from './StandDetails';
import { PastPreviewList_simulator } from './PastPreviewList';
import Result from './Result';
import SiteContext from '../context/SiteContext';
import HistoryStore from '@/model/historyStore';
import characters from '@/data/characters';
import { Tooltip } from 'react-tooltip';
import '../css/simulator.scss';
import SubAffixHint from './Hint/SubAffixHint';
import HintSimulator from './Hint/HintSimulator';
import HintParams from './Hint/HintParams';
import {hisoryDataSimulate, PieNums, Rank, selfStand, selfStandItem, SimulateRelic, SubData, SubDataItem, SubSimulateDataItem} from '../data/RelicData';
import HintHistory from './Hint/HintHistory';
import updateDetailsWindow from '@/model/updateDetailsStatus';

function Main(){
    //紀錄版本號
    const version = 1.2;

    //過往歷史紀錄最大筆數
    const maxHistoryLength = 6;

    //資料儲存位置
    const dataStorageLocation = 'GenshinSimulatorData';
    
    //腳色
    const [charID,setCharID]=useState(null);

    //聖遺物主詞條 部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState<number|undefined>(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState();

    //聖遺物副詞條 因為subdata還要監控元件狀態 所以要用state管理
    const [SubData,setSubData]=useState<SubSimulateDataItem[]>([]);
    const partArr = ['生之花','死之羽','時之沙','空之杯','理之冠'];

    //是否可以儲存(防呆用)、是否可以立馬變更
    const [isSaveAble,setIsSaveAble]=useState(false);
    const [isChangeAble,setIsChangeAble]=useState(true);

    const [ExpRate,setExpRate]=useState<number|undefined>(undefined);
    const [Rscore,setRscore]=useState<string|undefined>(undefined);
    const [Rrank,setRank]=useState<Rank>({label:undefined,tag:undefined,color:undefined,value:undefined});
    const [processBtn,setProcessBtn]=useState<boolean>(true);
    const standDetails=useRef<selfStand>([]);
    const [PieNums,setPieNums]=useState<PieNums>(undefined);

    //共用statusMsg
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    //自訂義標準
    const [selfStand,setSelfStand]=useState<selfStand>([]);

    //找到的遺器
    const [relic,setRelic]=useState<SimulateRelic>();

    //保底次數 最低為2
    const [limit,setLimit]=useState(2);
    const limitRef = useRef(2);

    //獲取操作歷史紀錄的function
    const {setHistory,getHistory,addHistory,deleteHistory,limitHistory} = HistoryStore();

    //獲取更新紀錄狀態function
    const openWindow = updateDetailsWindow((state) => state.openWindow);

    //是否記錄初始化完畢
    const [isLoad,setIsLoad] = useState(false);
    
    
    useEffect(()=>{
        init();
    },[])

    //初始化
    function init(){
        showStatus('正在載入過往紀錄中......','process');
        //這邊直接取空陣列 避免出bug
        let initSubData:SubSimulateDataItem[] = [];
        for(var i=0;i<=3;i++){
            let data:SubSimulateDataItem={
                index:i, 
                subaffix:"",
                data:0, 
                count:0, 
                isSelect:false
            }

            initSubData.push(data);
        }
        setSubData(initSubData);

        //先填入過往歷史紀錄
        let history = JSON.parse(localStorage.getItem(dataStorageLocation)!);
        setHistory((!history)?[]:history);

        if(history!=null&&history.length>0){
            history=history.filter((h:hisoryDataSimulate)=>h.version===version);
            localStorage.setItem('HistoryData',JSON.stringify(history));
            setHistory(history);

            updateStatus('先前紀錄已匯入!!','success');
        }else{
            updateStatus('尚未有任何操作紀錄!!','default');
        }

        setIsLoad(true);
    }

    //清除相關資料
    function clearData(){
        setExpRate(undefined);
        setRank({label:undefined,tag:undefined,color:undefined,value:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic(undefined);
    }

    //整合並儲存遺器資訊
    function saveRelic() {
        const data = {
            main_affix: MainSelectOptions,
            subaffix: [] as SubSimulateDataItem[],
            type: partsIndex!
        };

        const newSubData = SubData.map((s) => {
            const updated = { ...s }; // 複製一份
            if (!['生命值', '攻擊力', '防禦力', '元素精通'].includes(updated.subaffix))
                updated.display = updated.data + '%';
            else
                updated.display = updated.data.toString();
            return updated;
        });

        data.subaffix = newSubData;
        setSubData(newSubData);
        setRelic(data);
    }


    //儲存紀錄
    function saveRecord(){
        const historyraw = localStorage.getItem(dataStorageLocation);
        let historyData:hisoryDataSimulate[]=(historyraw)?JSON.parse(historyraw):null;
        let partName=partArr[partsIndex!-1];
        let selectChar:characters=characters.find((c)=>c.charId===charID)!;

        //如果目前則沒有紀錄 則初始化
        if(!historyData)
            setHistory([]);
        
        limitHistory();
        
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
        let data:hisoryDataSimulate={
            version:version,
            char:selectChar,
            part:partName,
            mainaffix:MainSelectOptions!,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums,
            stand:standDetails.current,
            relic:relic,
            limit:limitRef.current
        };
        let newHistory = [...historyData,data];
        localStorage.setItem(dataStorageLocation,JSON.stringify(newHistory));
        addHistory(data);
        updateStatus("紀錄已儲存",'success');
        setIsSaveAble(false);
    }

    //檢視過往紀錄
    function checkDetails(index:number){
        const result = getHistory(index);

        let data:hisoryDataSimulate|null = null;
        if (result && !Array.isArray(result) && 'part' in result) {
            data = result;
        }
        if(data){
            setRank(data.rank);
            setExpRate(data.expRate);
            setRscore(data.score.toString());
            updateStatus('資料替換完畢!!','success');
            setPieNums(data.pieData);
            standDetails.current = data.stand;
            limitRef.current = data.limit;
            setRelic(data.relic);

            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            })
        }

        
    }

    //刪除紀錄
    function deleteHistoryData(index:number){
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
        SubData.some((s:SubSimulateDataItem,i:number)=>{
            if(s.subaffix===MainSelectOptions){
                updateStatus(`第${i+1}個詞條:副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
            else if(s.subaffix==='undefined'||s.subaffix===""){
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
        selfStand.forEach((s:selfStandItem)=>{
            if(!Number(s.value)){
                errors=true;
                alert('加權指數不可為空或其他非法型式');
            }     
        });

        if(errors) return;
        
        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../worker/worker.ts', import.meta.url));
        let postData={
            MainData:MainSelectOptions,
            SubData:SubData,
            partsIndex:partsIndex,
            standard:selfStand,
            limit:limit,
            enchanceCount:enchanceCount
        };
        console.log(postData);
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
            standDetails.current = selfStand;
            limitRef.current = limit;
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
                <SubAffixSelect index={0} />
                <SubAffixSelect index={1} />
                <SubAffixSelect index={2} />
                <SubAffixSelect index={3} />
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
        limit:limitRef.current,
        
        //RelicData 那邊認的模式
        mode:"Simulator",
        button:true,

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
    };

    
    return(
        <SiteContext.Provider value={MainStatus}>
            <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[95%]'>
                <div>
                    <div className='flex flex-row flex-wrap max-[600px]:w-[95%]'>
                        <div className='w-2/5 SectionBg rounded-md max-[1200px]:w-full'>
                            <div className='flex flex-row items-center ml-2 mt-2'>
                                <span className='text-2xl text-red-500 font-bold'>手動輸入</span>
                                <div className='hintIcon ml-2 overflow-visible' 
                                    data-tooltip-id="SimulatorHint">
                                    <span className='text-white'>?</span>
                                </div>
                                <div className='flex flex-row relative ml-auto mr-3' onClick={()=>openWindow()}>
                                    <img src={`${ process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/breakingNews.svg`} alt="icon"/>
                                    <span className='text-white underline cursor-pointer'>最新更新</span>
                                </div>
                            </div>
                            <div className='flex flex-col px-2'>
                                <div className='flex flex-row my-3 items-center max-[400px]:!flex-col max-[600px]:items-baseline'>
                                    <div className='SimulatorFlex'>
                                        <span className='SubTitle'>Char 腳色:</span>
                                    </div>
                                    <div className='ml-1 flex flex-row items-center'>
                                        <CharSelect />
                                        <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                            <span className='text-white'>?</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-row my-3 max-[400px]:!flex-col'>
                                    <div className='SimulatorFlex'>
                                        <span className='SubTitle'>Parts 部位:</span>
                                    </div>
                                    <div className='ml-1'>
                                        <PartSelect />
                                    </div>
                                </div>
                                {
                                    (partsIndex!==undefined)?
                                    <div className={`flex flex-row my-3 max-[400px]:!flex-col`}>
                                        <div className='SimulatorFlex'>
                                            <span className='SubTitle'>Main 主詞條:</span>
                                        </div>
                                        <div className='ml-1'>
                                            <MainAffixSelect />
                                        </div>
                                    </div>:null
                                }
                                {
                                    (MainSelectOptions)?
                                    <>
                                        <div className={`flex flex-row my-3 max-[600px]:flex-wrap max-[400px]:!flex-col`}>
                                            <div className='SimulatorFlex'>
                                                <span className='SubTitle'>Sub 副詞條:</span>
                                            </div>
                                            <div className='flex flex-row max-[600px]:mx-auto'>
                                                <SubAffixList />
                                                <div className='hintIcon ml-2 overflow-visible'
                                                    data-tooltip-id="SubAffixHint">
                                                    <span className='text-white'>?</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex flex-row my-3 items-center max-[400px]:!flex-col max-[600px]:items-baseline`}>
                                            <div className='SimulatorFlex'>
                                                <span className='SubTitle'>Affix 有效詞條:</span>
                                            </div>
                                            <StandardSelect />
                                        </div>
                                        <div className={`flex flex-row my-3 max-[400px]:!flex-col`}>
                                            <div className='SimulatorFlex'>
                                                <span className='SubTitle'>Limit 保底次數:</span>
                                            </div>
                                            <div className='pl-1 flex flex-row items-center'>
                                                <input type='text-white' className='bgInput w-[40px] text-center' 
                                                        onChange={(event)=>{
                                                            if(!isNaN(parseInt(event.target.value)))
                                                                setLimit(parseInt(event.target.value))
                                                        }} 
                                                        defaultValue={2} max={4}/>
                                                <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="LimitHint">
                                                    <span className='text-white'>?</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>:null
                                }
                                {
                                    (selfStand&&selfStand.length!==0)?
                                    <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''} max-[400px]:!flex-col`} >
                                        <div className='SimulatorFlex'>
                                            <span className='SubTitle'>Params 參數:</span>
                                        </div>
                                        <div className='flex flex-row'>
                                            <ShowStand lock={false} />
                                            <div className='hintIcon ml-2 overflow-visible'
                                                data-tooltip-id="ParamsHint"> 
                                                <span className='text-white'>?</span>
                                            </div>
                                        </div>
                                    </div>:null
                                }
                                {
                                    (partsIndex!==undefined)?
                                    <div className={`mt-2 mb-2 max-w-[400px] flex flex-row [&>*]:mr-2 justify-end max-[400px]:justify-start`}>
                                        <div className='flex flex-row mt-1'>
                                            <button className='processBtn mr-2 whitespace-nowrap' 
                                                onClick={()=>calScore()} 
                                                disabled={!processBtn}>計算分數</button>
                                            <button className='processBtn mr-2 whitespace-nowrap' 
                                                onClick={()=>saveRecord()} 
                                                disabled={!isSaveAble}>儲存紀錄</button>
                                        </div>
                                    </div>:null
                                }
                            </div>  
                        </div>
                        <div className='w-[55%] ml-2 SectionBg rounded-md p-2 h-fit max-[1200px]:w-[100%] max-[1200px]:ml-0 max-[1200px]:mt-2'>
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
                    {
                        (PieNums)?
                        <div className='w-full my-2'>
                            <div className={`w-full flex flex-row SectionBg p-2 rounded-md flex-wrap`}>
                                <div className={`flex flex-row flex-wrap w-[18vw] max-[700px]:w-[50%] max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                                    <RelicData  />
                                </div>
                                <div className={`w-1/4 max-[800px]:w-[50%] max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                                    <StandDetails />
                                </div>
                                <div className='flex flex-row flex-wrap w-1/2 max-[800px]:w-[100%] max-[500px]:w-4/5 max-[500px]:mx-auto' id="resultDetails">
                                    <Result />
                                </div>
                            </div>
                        </div>:null
                    }
                </div>
                
            </div>
            <div>
                <Tooltip id="CharHint"  
                        place="right-start" 
                        render={()=>
                            <div className='flex flex-col'>
                                <span className='text-white'>選擇指定腳色，可以使用中文或英文關鍵字</span>
                                <span className='text-white'>例如:霄宮&rarr;Yoimiya</span>
                            </div>
                        }/>
                <Tooltip id="PartSelectHint"  
                        place="right-start" 
                        render={()=>
                            <div className='flex flex-col max-w-[230px]'>
                                <span className='text-white'>選擇聖遺物部位</span>
                                <span className='text-white'>"主詞條"跟"副詞條"區塊中會自動帶入該部位詞條種類</span>
                            </div>
                        }/>

                <Tooltip id="SubAffixHint"  
                        place="right-start" 
                        render={()=>
                            <SubAffixHint />
                        }/>
                <Tooltip id="ParamsHint"  
                        place="right-start" 
                        render={()=>
                            <HintParams />
                        }/>
                <Tooltip id="HistoryHint"  
                    place="top-start"
                    render={()=><HintHistory/>}/>
                <Tooltip id="SimulatorHint"
                        place='right-start'
                        render={()=><HintSimulator/>}
                        clickable={true}/>
                <Tooltip id="LimitHint"
                        place='right-start'
                        render={()=>
                            <div className='flex flex-col'>
                                <span>指定詞條強化保底次數，可以根據個人目前使用強化情況調整</span>
                                <span>指定詞條們的共享保底次數，最低為2、最高為4</span>
                            </div>
                        }
                        clickable={true}/>
            </div>
        </SiteContext.Provider>
    )
}

export default Main;