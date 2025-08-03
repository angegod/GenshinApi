'use client';
import React, { useContext } from 'react';
import AffixName, { AffixItem } from '../data/AffixName';
import EquipType from '@/data/EquipType';
import { Tooltip } from 'react-tooltip';
import { useRouter } from 'next/navigation';
import EnchantDataStore from '@/model/enchantDataSlice';
import SiteContext from '../context/SiteContext';
import RelicDataHint from './Hint/RelicDataHint';
import { standDetailItem, SubData, SubDataItem, SubSimulateDataItem } from '@/data/RelicData';


//顯示儀器分數區間
const RelicData=()=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble,partArr,limit,mode,button} = useContext(SiteContext);
    const router = useRouter();

    //獲取enchant資料
    const {setEnchantData} = EnchantDataStore();
    
    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            limit:limit,
            mode:mode
        }
        setEnchantData(sendData);
        
        router.push('./enchant');
    }

    if(relic!==undefined){
        const MainAffixName:string = AffixName.find((a)=>a.fieldName===relic.flat.reliquaryMainstat.mainPropId)!.name;
        //主詞條是否要顯示百分比?
        const isMainPercent:boolean = AffixName.find((a)=>a.fieldName === relic.flat.reliquaryMainstat.mainPropId)!.percent;
        const list:any=[];
        relic.flat.reliquarySubstats.forEach((s:any)=>{
            let targetAffix:AffixItem|undefined = AffixName.find((a)=>a.fieldName===s.appendPropId);
            let showAffix = targetAffix!.name;
            let isBold=(standDetails.find((st:standDetailItem)=>st.name===showAffix)!==undefined)?true:false;

            list.push(
                <div className='flex flex-row' key={'Subaffix_'+s.appendPropId}>
                    <div className='w-[150px] flex flex-row'>
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{showAffix}</span>
                    </div>
                    <div className='flex w-[70px]'>
                        <span className='mr-1'>:</span>
                        <span className='text-right text-white '>{s.statValue}{(targetAffix!.percent)?'%':''}</span>
                    </div>
                </div>
            )
        });
        
        
        return(
            <div className={`w-[100%] my-1 ${(relic!==undefined)?'':'hidden'} max-[500px]:w-[330px] max-[400px]:w-[100%]`}>
                <div className='flex flex-row items-center'>
                    <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    <div className='hintIcon ml-2 overflow-visible' data-tooltip-id="RelicDataHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span className='text-stone-400'>部位</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>
                            {typeof EquipType[relic.flat?.equipType as keyof typeof EquipType] === 'number'
                                ? partArr[EquipType[relic.flat?.equipType as keyof typeof EquipType]! - 1]
                                : '未知部位'}
                        </span>   
                    </div>
                </div>
                <div className='mt-1'>
                    <span className='text-stone-400'>主詞條</span><br/>
                    <div className='flex flex-row'>
                        <div className='flex flex-row max-w-[140px]'>
                            <span className='text-white whitespace-nowrap overflow-hidden text-ellipsis'>{MainAffixName}</span>
                        </div>
                        <span className='text-stone-400'>:{relic.flat.reliquaryMainstat.statValue}{(isMainPercent)?'%':''}</span>
                    </div>
                </div>
                <div className='mt-2 flex flex-col'>
                    <span className='text-stone-400'>強化保底次數</span>
                    <span className='text-white'>{limit}</span>
                </div>
                <div className='mt-2'>
                    <span className='text-stone-400'>副詞條</span>
                    <div className='flex flex-col w-[190px]'>
                        {list}
                    </div>
                </div>
                
                {(button)?
                    <div className='mt-3'>
                        <button className='processBtn' onClick={navEnchant} disabled={!isChangeAble}>重洗模擬</button>
                    </div>:<></>}
                <Tooltip id="RelicDataHint"  
                        place="right-start"
                        style={{ zIndex: 99 }}
                        render={()=>
                            <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
                                <div>
                                    <span className='text-white'>下方會顯示出該遺器的</span>
                                </div>
                                <ul className='[&>li]:text-stone-400'>
                                    <li>1.所屬套裝</li>
                                    <li>2.主屬性及其數值</li>
                                    <li>3.副屬性及其數值</li>
                                    <li>4.個別副屬性強化次數</li>
                                </ul>
                                <div className='mt-2'>
                                    <span className='text-white'>此外下方有個重洗模擬按鈕，此功能將會帶入這個遺器的資訊進行重洗模擬</span>
                                </div>
                            </div>
                        }/>
            </div>
        )
    }else{
        return null
    }
};

const RelicData_simulate=()=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble,partArr,limit,mode,button} = useContext(SiteContext);
    const router = useRouter();

    //獲取enchant資料
    const {setEnchantData} = EnchantDataStore();

    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode,
            limit:limit
        }
        setEnchantData(sendData);
        
        router.push('./enchant');
    }
    
    if(relic!==undefined){
        const list:any=[];
        relic.subaffix.forEach((s:SubSimulateDataItem)=>{
            let isBold=(standDetails.find((st:standDetailItem)=>st.name===s.subaffix)!==undefined)?true:false;
            let markcolor="";

            switch(s.count){
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
                <div className='flex flex-row' key={'Data'+s.subaffix}>
                    <div className='flex justify-center items-center'>
                        <span className='mr-0.5 text-white w-[20px] h-[20px] rounded-[20px]
                            flex justify-center items-center' style={{backgroundColor:markcolor}}>
                            {s.count}
                        </span>
                    </div>
                    <div className='w-[160px] flex flex-row'>
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{s.subaffix}</span>
                    </div>
                    <span className='flex w-[80px]'>:<span className='ml-2 text-white '>{s.display}</span></span>
                </div>    
            )
        })
        
        return(
            <div className={`w-[100%] my-1 max-[500px]:min-w-[250px]`}>
                <div className='flex flex-row items-center'>
                    <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="RelicDataHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span className='text-stone-400'>部位</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{partArr[relic.type-1]}</span>   
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span className='text-stone-400'>主詞條</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{relic.main_affix}</span>   
                    </div>
                </div>
                <div className='mt-2 flex flex-col'>
                    <span className='text-stone-400'>強化保底次數</span>
                    <span className='text-white'>{limit}</span>
                </div>
                <div className='mt-2'>
                    <span className='text-stone-400 font-bold'>副詞條</span>
                    <div className='flex flex-col w-[200px]'>
                        {list}
                    </div>
                </div>
                {(button)?<div className='mt-3'>
                    <button className='processBtn' onClick={()=>navEnchant()}  disabled={!isChangeAble}>重洗模擬</button>
                </div>:null}
                <Tooltip id="RelicDataHint"  
                        place="right-start"
                        render={()=>
                            <RelicDataHint />
                        }/>
            </div>
        )
    }else{
        return(<></>)
    }
}

export  {RelicData,RelicData_simulate};