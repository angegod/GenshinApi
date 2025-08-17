"use client"
import React, { useContext, useEffect, useRef,createContext } from 'react';
import AffixName from '../../data/AffixName';
import EquipType from '@/data/EquipType';
import { useState } from 'react';
import '../../css/simulator.scss';
import '../../css/enchant.scss';
import { StandDetails } from '../../components/StandDetails';
import { RelicData, RelicData_simulate } from '../../components/RelicData';
import { PieChart } from '@mui/x-charts/PieChart';
import SiteContext from '@/context/SiteContext';
import EnchantDataStore from '@/model/enchantDataSlice';
import { useRouter } from 'next/navigation';
import { Tooltip } from 'react-tooltip';
import HintEnchant from '@/components/Hint/HintEnchant';
import { EnchantData, MinMaxScore, RelicBackup, SimulatorData, Statics } from '@/data/interface/Enchant';
import { PieNums, Rank, RelicScoreStand, standDetailItem, SubData, SubDataItem, SubSimulateDataItem } from '@/data/RelicData';
import { JSX } from 'react/jsx-runtime';

//此物件為單次模擬隨機強化後的結果
const Enchant=React.memo(()=>{

    //從enchantstore取得
    const [data,setData] = useState<EnchantData>();
    const {relic,standDetails,Rscore,Rrank,mode}:any=data || {};
    const {getEnchantData} = EnchantDataStore();
    
    const relicBackUp =useRef<RelicBackup|null>(null);
    const [isChangeAble,setIsChangeAble]=useState<boolean>(true);

    //是否啟用還原狀態
    const [isRecoverable,setRecoverable]=useState<boolean>(false);

    //模擬強化相關數據
    const [simulatorData,setSimulatorData]=useState<SimulatorData>({oldData:null,newData:null});
    const [statics,setStatics]=useState<Statics[]|undefined>(undefined);

    //限制及強化次數
    const [limit,setLimit] = useState<number>(2);
    const [Affix,setAffixCount]=useState<number>(3);
    const [AffixBtn,setAffixBtn] = useState<boolean>(false);
        
    //強化次數
    const [count,setCount]=useState<number>(0);

    //成功翻盤次數
    const [successCount,setSuccessCount]=useState<number>(0);

    //分數及標準
    const scoreStand:RelicScoreStand[]=[
        {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
        {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
        {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
        {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
        {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
        {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
    ];

    const partArr = ['生之花','死之羽','時之沙','空之杯','理之冠'];
    const router = useRouter();

    //最高與最低分
    const [MinMaxScore,setMinMaxScore] = useState<MinMaxScore>({min:undefined,max:undefined});

    //初始化
    useEffect(()=>{
        let simulateData = getEnchantData();
        if(!simulateData ||Object.keys(simulateData).length === 0){
            alert('沒有任何模擬數據，即將導回至主頁');
            router.push('./');
        }else{
            setData(simulateData);
            setLimit(simulateData.limit);
        }  
    },[])


    useEffect(()=>{
        //偵測初始化數據是否帶有指定屬性
        if(data !== undefined){
            if(mode==="Simulator"){
                let AffixCount = 0;
                let subArr = data.relic.subaffix as SubSimulateDataItem[];
                subArr.forEach((s)=>AffixCount+=s.count);
                (AffixCount===5)?setAffixCount(4):setAffixCount(3);
            }
        }
       
    },[data])


    //必須有data 才能計算
    useEffect(()=>{
        //調整按鈕render
        (mode==="Importer")?setAffixBtn(true):setAffixBtn(false);

        //回到畫面最上方
        requestAnimationFrame(()=>{
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        })

        //初始化紀錄
        initStatics();

        //依照執行模式執行對應模擬
        execute();
    },[data])

    useEffect(()=>{
        //新增強化紀錄
        addStatics();

        //備份
        if(relicBackUp.current === null){
            relicBackUp.current=simulatorData.oldData;
        }
        //更新最高最低分數
        changeMinMaxScore();
    },[simulatorData])


    //初始化統計數據
    function initStatics(){
        let arr:Statics[] = [];
        scoreStand.forEach((s)=>{
            arr.push({
                label:s.rank,
                value:0,
                color:s.color,
                tag:s.rank
            })
        });

        setStatics(arr);
    }

    //增加統計數據
    function addStatics() {
        const newData = simulatorData.newData;
        if (newData !== null) {
            const rank = newData.relicrank.rank;
            const match = scoreStand.find((s) => s.tag === rank);
            if (!match) return;

            if (statics === undefined) {
                const data: Statics = {
                    label: rank,
                    value: 1,
                    color: match.color,
                    tag: rank
                };
                setStatics([data]);
                return;
            }

            const target = statics.find((s) => s.label === rank);
            if (!target) {
                const data: Statics = {
                    label: rank,
                    value: 1,
                    color: match.color,
                    tag: rank
                };
                setStatics((old:Statics[]|undefined) => [...old!, data]);
            } else {
                setStatics((old:Statics[]|undefined) =>
                    old!.map((item) =>
                        item.tag === rank ? { ...item, value: item.value + 1 } : item
                    )
                );
            }
        }
    }


    //模擬強化--Importer
    function simulate(){
        let isCheck=true;

        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../../worker/worker2.ts', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.fieldName===relic.flat.reliquaryMainstat.mainPropId)!;
        let SubData:SubDataItem[]=[];
          
        if(simulatorData.oldData===null){
            relic.flat.reliquarySubstats.forEach((s:any,i:number)=>{
                let typeName=AffixName.find((a)=>a.fieldName===s.appendPropId)!;

                let val= s.statValue;
                
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:val, //詞條數值    
                }

                SubData.push(data);
            });
        }else{
            SubData = simulatorData.oldData.returnData;
        }
        

        //檢查標準是否合法
        /*standDetails.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
            }
        });*/
        
        //制定送出資料格式
        let postData={
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:EquipType[relic.flat.equipType],
            standard:standDetails,
            enchanceCount:Affix+1,
            limit:limit
        };

        if(isCheck){
            worker.postMessage(postData);
            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {
                setSimulatorData({
                    oldData:{
                        relicscore:(simulatorData.oldData===null)?parseInt(Rscore):simulatorData.oldData.relicscore,
                        relicrank:(simulatorData.oldData===null)?Rrank:simulatorData.oldData.relicrank,
                        returnData:SubData
                    },
                    newData:event.data
                });

                setCount((c)=>c+=1);

                //如果該次強化超過原有分數 則成功次數+1
                if(simulatorData.oldData!==null){ //第二次強化以後
                    if(parseInt(event.data.relicscore) > simulatorData.oldData.relicscore)
                        setSuccessCount((c)=>c+=1);
                }else{ //第一次模擬
                    if(parseInt(event.data.relicscore) > Rscore)
                        setSuccessCount((c)=>c+=1);
                }
            };

           
        }
    }

    //模擬強化--Simulator
    function simulate2(){
        let isCheck=true;
        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../../worker/worker2.ts', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.name===relic.main_affix);

        let SubData:any=[];


        if(simulatorData.oldData===null){
            console.log(relic);
            relic.subaffix.forEach((s:SubSimulateDataItem,i:number)=>{
                let typeName=AffixName.find((a)=>a.name===s.subaffix);
               
                let data={
                    index:i, 
                    subaffix:typeName!.name,
                    data:s.data, //詞條數值    
                    count:s.count,//強化次數
                    isSelect:s.isSelect
                }
    
                SubData.push(data);
            });

        }else{
            SubData = simulatorData.oldData.returnData;
        }
        

        //檢查標準是否合法
        /*standDetails.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
            }
        });*/
        

        //制定送出資料格式
        let postData={
            MainData:MainAffix!.name,
            SubData:SubData,
            partsIndex:relic.type,
            standard:standDetails,
            enchanceCount:Affix+1,
            limit:limit
        };
        
        if(isCheck){
            worker.postMessage(postData);

            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {

                setSimulatorData({
                    oldData:{
                        relicscore:(simulatorData.oldData===null)?Rscore:simulatorData.oldData.relicscore,
                        relicrank:(simulatorData.oldData===null)?Rrank:simulatorData.oldData.relicrank,
                        returnData:SubData
                    },
                    newData:event.data
                });

                setCount((c)=>c+=1);

                //如果該次強化超過原有分數 則成功次數+1
                if(simulatorData.oldData!==null){
                    if(parseInt(event.data.relicscore) > simulatorData.oldData.relicscore)
                        setSuccessCount((c)=>c+=1);
                }else{ //第一次模擬
                    if(parseInt(event.data.relicscore) > Rscore)
                        setSuccessCount((c)=>c+=1);
                }
            };
        }
    }

    //判斷是否為最小或最大分數
    function changeMinMaxScore(){
        if(simulatorData.oldData!==null&&simulatorData.newData!==null){
            //如果是初次計算 直接加入到min跟max
            if(count === 1){
                let minScore = Math.min(simulatorData.oldData.relicscore,simulatorData.newData.relicscore);
                let maxScore = Math.max(simulatorData.oldData.relicscore,simulatorData.newData.relicscore);
                setMinMaxScore({min:minScore,max:maxScore});
            }else if(count > 1){
                let score = simulatorData.newData.relicscore;
                let stand = JSON.parse(JSON.stringify(MinMaxScore));

                if(score > stand.max )
                    stand.max = score;
                else if(score < stand.min )
                    stand.min = score

                setMinMaxScore(stand);
            }
        }
        
    }

    //套用模擬強化的資料
    function changeToNew(){
        if(simulatorData.newData!==null){
            setSimulatorData({
                oldData:simulatorData.newData,
                newData:null
            });

            setSuccessCount(0);
            setRecoverable(true);
        }
    }

    function execute(){
        //根據傳入模式執行對應模擬
        switch(mode){
            case 'Importer':
                simulate();
                break;
            case 'Simulator':
                simulate2();
                break;
            default:
                break;
        }

        setRecoverable(true);
    }

    //回到初始狀態
    function reInit(){
        //將counter歸0
        setCount(0);
        setSuccessCount(0);

        //將還原按鈕關閉
        setRecoverable(false);

        //還原至一開始記錄
        console.log(relicBackUp.current);
        setSimulatorData({oldData:relicBackUp.current,newData:null});
        setMinMaxScore({min:undefined,max:undefined});

        //還原強化紀錄
        initStatics();
    }

    //切換成3詞條或4詞條檢視方式
    function AffixCountChange(){
        if(Affix===3)
            setAffixCount(4);
        else if(Affix===4)
            setAffixCount(3);

        //切換模式後要回到初始狀態
        reInit();
    }

    const ResultSection=(simulatorData.newData!==undefined&&simulatorData.oldData!==undefined)?(
        <div className='flex flex-row flex-wrap  max-[600px]:!flex-col'>
            <DataList standDetails={standDetails} data={simulatorData.oldData} title={'重洗前'} />
            <div className={`flex my-auto w-[30px] moveAnimate moveAnimate2 max-[600px]:w-full h-[30px] ${(simulatorData.newData===null)?'hidden':''}`} >
                <svg xmlns="http://www.w3.org/2000/svg" className='max-[600px]:hidden mx-auto'
                    height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className='min-[600px]:hidden mx-auto'
                    height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
            </div>
            <DataList standDetails={standDetails} data={simulatorData.newData} title={'重洗後'} />          
        </div>
    ):null;

    const EnchantStatus ={
        relic:relic,
        Rrank:Rrank,
        Rscore:Rscore,
        standDetails:standDetails,
        isChangeAble:isChangeAble,
        partArr:partArr,
        PieNums:statics,
        successCount:successCount,
        count:count,
        limit:limit,
        MinMaxScore:MinMaxScore
    };
    
    return(
        <SiteContext.Provider value={EnchantStatus}>
            <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[90%]'>
                <div className="w-full border-gray-600 my-4 justify-center flex flex-row flex-wrap max-[900px]:flex-col">
                    <div className='flex flex-row flex-wrap w-1/2 max-[900px]:w-full justify-evenly max-[900px]:mb-2'>
                        <div className='w-[45%] h-fit flex flex-row max-[900px]:w-fit bg-[rgba(0,0,0,0.5)] p-2 rounded-md'>
                            {(mode==="Importer")?
                                <RelicData  />:
                                <RelicData_simulate />}
                        </div>
                        <div className='w-[45%] h-fit max-[900px]:w-fit bg-[rgba(0,0,0,0.5)] p-2 rounded-md ml-1 max-[900px]:ml-0 max-[900px]:my-2'>
                            <StandDetails />
                        </div>
                    </div>
                    <div className='w-1/2 bg-[rgba(0,0,0,0.5)] h-fit p-2 rounded-md max-[900px]:w-full flex flex-col max-[900px]:items-center'>
                        <div className='flex flex-row max-[600px]:!flex-col'>
                            <div className='items-center flex flex-row max-[600px]:justify-center max-[600px]:mb-3'>
                                <span className='text-red-600 text-lg font-bold'>模擬強化</span>
                                <div className='hintIcon ml-2 overflow-visible' data-tooltip-id="EnchantHint">
                                    <span className='text-white'>?</span>
                                </div>
                            </div>
                            <div>
                                <button className='processBtn ml-2' onClick={()=>execute()} >再洗一次</button>
                                <button className='processBtn ml-2' onClick={()=>changeToNew()}>套用新強化</button>
                                {
                                    (AffixBtn)
                                        ?<button className='processBtn ml-2' onClick={()=>AffixCountChange()}>更改模式</button>
                                        :null
                                }
                                <button className='processBtn ml-2' onClick={()=>reInit()} disabled={!isRecoverable}>還原</button>
                            </div>
                        </div>
                        <div className='my-2 flex flex-row'>
                            <span>目前重洗次數:<span className='text-white ml-1'>{count}</span></span>
                            <span className='ml-2'>目前模式:<span className='text-white ml-1'>{Affix+"詞條"}</span></span>
                        </div>
                        <div>
                            {ResultSection}
                        </div>
                        <div>
                            <Pie /> 
                        </div>
                    </div>
                </div>
                
            </div>
            <Tooltip id="EnchantHint"  
                    place="right-start" 
                    render={()=>
                        <HintEnchant />
                    }/>
        </SiteContext.Provider>
    )
     
});

interface DataListInterface{
    standDetails:standDetailItem[],
    data:RelicBackup|null,
    title:string
}

//強化前後的數據顯示
const DataList=React.memo(({standDetails,data,title}:DataListInterface)=>{
    let list:JSX.Element[]=[];
    if(data!==null){
        data.returnData.map((d,i)=>{
            let markcolor="";
            var targetAffix = AffixName.find((a)=>a.name===d.subaffix);
            let isBold=(standDetails.find((st)=>st.name===d.subaffix)!==undefined)?true:false;
            let showData = undefined;
            //檢查是否要顯示%數
            if(targetAffix!.percent&&!d.data.toString().includes('%'))
                showData=d.data+'%';
            else
                showData=d.data;
    
            switch(d.count){
                case 0:
                    markcolor='rgb(122, 122, 122)';
                    break;
                case 1:
                    markcolor='rgb(67, 143, 67)';
                    break;
                case 2:
                    markcolor='rgb(23, 93, 232)';
                    break;
                case 3:
                    markcolor='rgb(67, 17, 184)';
                    break;
                case 4:
                    markcolor='rgb(219, 171, 15)';
                    break;
                case 5:
                    markcolor='#FF55FF';
                    break;
                default:
                    break;
            }
    
            list.push(
                <div className='flex flex-row' key={'Subaffix_'+d.subaffix}>
                    {(d.count!==undefined)
                        ?<div className='flex justify-center items-center'>
                            <span className='mr-0.5 text-white w-[20px] h-[20px] rounded-[20px]
                                flex justify-center items-center' style={{backgroundColor:markcolor}}>
                                {d.count}
                            </span>
                        </div>
                        :null
                    }
                    <div className='w-[120px] flex flex-row'>
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{d.subaffix}</span>
                    </div>
                    <span className='flex w-[70px]'>:<span className='ml-2 text-white '>{showData}</span></span>
                </div>
                
            )
        });
        return(
            <div className='flex flex-col mx-1'>
                <div>
                    <span className='text-amber-700 font-bold text-lg'>{title}</span>
                    <div className='flex flex-row'>
                        <span>遺器評級:</span>
                        <span className='pl-2' style={{color:data.relicrank.color}}>
                            {data.relicrank.rank} {data.relicscore}/100 
                        </span>
                    </div>
                </div>
                <div>
                    {list}
                </div>
            </div>
        )
    }else{
        return null
    }    
});

const Pie=React.memo(()=>{
    const {PieNums,successCount,count,MinMaxScore} =useContext(SiteContext);
    if(PieNums!==undefined){
        const pieParams = {
            height: (count === 0)?0:200,
            margin:{ top: 10, right: 0, bottom: 0, left: 0 },
            egend: { hidden: true }
        };

        return(
           <div className='w-full flex flex-row flex-wrap justify-evenly max-[500px]:flex-col-reverse'>
                <div className='w-[200px]'>
                    <PieChart  
                        series={[
                            {
                                innerRadius: 20,
                                arcLabelMinAngle: 35,
                                arcLabel: (item) => `${item.value}次`,
                                data: PieNums,
                            }
                        ]}  {...pieParams} />
                </div>
                <div className={`flex-col w-2/5 max-[500px]:w-full mt-2 ${(PieNums.find((p:Rank)=>p.value!==0)===undefined)?'hidden':''}`}>
                    <div className='flex flex-row items-center max-[600px]:w-3/5 max-[600px]:mx-auto'>
                        <div className='flex justify-start'>
                            <span className='text-stone-400'>翻盤次數</span>
                        </div>
                        <div className='flex justify-start text-center ml-2'>
                            <span className='text-white'>{successCount}次</span>
                        </div>
                    </div>
                    <div className='flex flex-row items-center max-[600px]:w-3/5 max-[600px]:mx-auto'>
                        <div className='flex justify-start'>
                            <span className='text-stone-400'>最高分數</span>
                        </div>
                        <div className='flex justify-start text-center ml-2'>
                            <span className='text-white'>{MinMaxScore.max}</span>
                        </div>
                    </div>
                    <div className='flex flex-row items-center max-[600px]:w-3/5 max-[600px]:mx-auto'>
                        <div className='flex justify-start'>
                            <span className='text-stone-400'>最低分數</span>
                        </div>
                        <div className='flex justify-start text-center ml-2'>
                            <span className='text-white'>{MinMaxScore.min}</span>
                        </div>
                    </div>
                </div>
               
           </div>
        );

    }else{
        return null
    }
});

export default Enchant;

//data資料包含著 既定結果跟模擬結果
//兩個都需要 1.詞條數據 2.強化次數 3.遺器分數跟評級