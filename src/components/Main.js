"use client"
import React, { Component, use } from 'react';
import { useState,useEffect,useRef } from 'react';
import { MainAffixSelect,PartSelect,StandardSelect,SubAffixSelect } from './Select';
import { ShowStand } from './StandDetails';
import { useStatusToast } from '@/context/StatusMsg';
import { RelicData_simuldate as RelicData } from './RelicData';
import { StandDetails } from './StandDetails';
import Result from './Result';
import '@/css/main.css';
import SiteContext from '@/context/SiteContext';

function Main(){
    const version = 1.1;

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
    
    
    useEffect(()=>{
        init();
    },[])

    function init(){
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

    //計算聖遺物分數
    function calScore(){
        //先驗證選擇是否有誤
        //副詞條是否有空值?
        //副詞條是否有跟主詞條重複?
        //選定副詞條是否是兩個
        let errors=false;
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
        });

        let LimitSelect = SubData.filter((s,i)=>s.isSelect).length;
        if(LimitSelect!==2){
            updateStatus(`您指定詞條數未滿2個!!`,'error');
        }

        if(errors) return;
        //輸入的副詞條之間是否重複?
        const seen = new Set();
        for (const obj of SubData) {
            if (seen.has(obj['subaffix'])) {
                alert(`副詞條之間不可以選擇重複\n請再重新選擇!!`);
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
            standard:selfStand
        };
        //將按鈕disable
        setIsSaveAble(false);
        setProcessBtn(false);
        setIsChangeAble(false);
        showStatus('數據計算處理中!!');
        clearData();
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            console.log(event.data);
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            updateStatus('計算完畢!!','success');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            saveRelic();
            standDetails.current=selfStand;
            
            //恢復點擊
            updateStatus('計算完畢!!','success');
            setProcessBtn(true);
            setIsSaveAble(true);
            setIsChangeAble(true);
            //將視窗往下滾
            /*requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            });*/
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
        Rrank:Rrank,
        Rscore:Rscore,
        relic:relic,
        selfStand:selfStand,

        //提供state更新
        setMainSelectOptions:setMainSelectOptions,
        setPartsIndex:setPartsIndex,
        setIsChangeAble:setIsChangeAble,
        setIsSaveAble:setIsSaveAble,
        setSelfStand:setSelfStand,
        setSubData:setSubData
    }

    //<button className='processBtn mr-2 whitespace-nowrap' onClick={()=>saveRecord()} disabled={!isSaveAble}>儲存紀錄</button>
    return(
        <SiteContext.Provider value={MainStatus}>
            <div className='w-4/5 mx-auto mt-3'>
                <div className='w-1/2'>
                    <div>
                        <span className='text-2xl text-red-500 font-bold'>原神測試</span>
                    </div>
                    <div>
                        <div className='flex flex-row my-3'>
                            <div className='w-[200px] text-right'>
                                <span className='text-white'>部位:</span>
                            </div>
                            <div className='ml-1'>
                                <PartSelect />
                            </div>
                        </div>
                        <div className={`flex flex-row my-3 ${(partsIndex===undefined)?'hidden':''}`}>
                            <div className='w-[200px] text-right'>
                                <span className='text-white'>Main 主詞條:</span>
                            </div>
                            <div className='ml-1'>
                                <MainAffixSelect />
                            </div>
                        </div>
                        <div className={`flex flex-row my-3 ${(!MainSelectOptions)?'hidden':''}`}>
                            <div className='w-[200px] text-right'>
                                <span className='text-white'>Sub 副詞條:</span>
                            </div>
                            <SubAffixList />
                        </div>
                        <div className={`flex flex-row my-3 ${(!MainSelectOptions)?'hidden':''}`}>
                            <div className='w-[200px] text-right'>
                                <span className='text-white'>Affix 有效詞條:</span>
                            </div>
                            <StandardSelect />
                        </div>
                        <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`} >
                            <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                <span className='text-white'>Params 參數:</span>
                            </div>
                            <ShowStand />
                        </div>
                        <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 mb-2 max-w-[400px] flex flex-row [&>*]:mr-2 justify-end max-[400px]:justify-start`}>
                             <div className='flex flex-row mt-1'>
                                <button className='processBtn mr-2 whitespace-nowrap' 
                                    onClick={()=>calScore()} 
                                    disabled={!processBtn}>計算分數</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full'>
                    <div className={`w-full flex flex-row flex-wrap ${(PieNums===undefined)?'hidden':''}`}>
                        <div className={`flex flex-row flex-wrap w-[18vw]  max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                            <RelicData  mode={'Simulator'} button={true}/>
                        </div>
                        <div className={`w-1/4 max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                            <StandDetails />
                        </div>
                        <div className='flex flex-row flex-wrap w-1/2 max-[700px]:w-[100%] max-[500px]:w-4/5 max-[500px]:mx-auto ' id="resultDetails">
                            <Result ExpRate={ExpRate} 
                                    Rscore={Rscore} 
                                    statusMsg={statusMsg} 
                                    Rrank={Rrank} 
                                    PieNums={PieNums}/>
                        </div>
                    </div>
                </div>
            </div>
        </SiteContext.Provider>
    )
}

export default Main;