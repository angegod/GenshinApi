'use client';
import React, { useContext } from 'react';
import AffixName from '../data/AffixName';
import EquipType from '@/data/EquipType';
import { Tooltip } from 'react-tooltip';
import { useRouter } from 'next/navigation';
import SiteContext from '../context/SiteContext';
import RelicDataHint from './Hint/RelicDataHint';


//顯示儀器分數區間
const RelicData=React.memo(({mode,button})=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble,partArr} = useContext(SiteContext);
    const router = useRouter();
    
    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode
        }
        console.log(sendData);
        localStorage.setItem('EnchantData',JSON.stringify(sendData));
        router.push('./enchant');
    }

    if(relic!==undefined){
        const MainAffixName = AffixName.find((a)=>a.fieldName===relic.flat.reliquaryMainstat.mainPropId).name;
        const reliclink = `https://enka.network/ui/${relic.flat.icon}.png`;
        const list=[];
        relic.flat.reliquarySubstats.forEach((s)=>{
            let markcolor="";
            let isBold=(standDetails.find((st)=>st.name===s.name)!==undefined)?true:false;
            let targetAffix = AffixName.find((a)=>a.fieldName===s.appendPropId)
            
            s.name = targetAffix.name;

            list.push(
                <div className='flex flex-row' key={'Subaffix_'+s.name}>
                    <div className='w-[150px] flex flex-row'>
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{s.name}</span>
                    </div>
                    <div className='flex w-[70px]'>
                        <span className='mr-1'>:</span>
                        <span className='text-right text-white '>{s.statValue}{(targetAffix.percent)?'%':''}</span>
                    </div>
                </div>
                
            )
        })
        
        
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
                        <span className='text-white'>{partArr[EquipType[relic.flat.EQUIP_BRACER]]}</span>   
                    </div>
                </div>
                <div className='mt-1'>
                    <span className='text-stone-400'>主詞條</span><br/>
                    <div className='flex flex-row'>
                        <div className='flex flex-row max-w-[140px]'>
                            <span className='text-white whitespace-nowrap overflow-hidden text-ellipsis'>{MainAffixName}</span>
                        </div>
                        <span className='text-stone-400'>:{relic.flat.reliquaryMainstat.statValue}</span>
                    </div>
                       
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
        return(<></>)
    }
});

const RelicData_simuldate=React.memo(({mode,button})=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble,partArr} = useContext(SiteContext);
    const router = useRouter();
    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode
        }

        localStorage.setItem('EnchantData',JSON.stringify(sendData));

        router.push('./enchant');
    }

    if(relic!==undefined){
        const list=[];

        relic.subaffix.forEach((s)=>{
            let isBold=(standDetails.find((st)=>st.name===s.subaffix)!==undefined)?true:false;
            
            let markcolor="";

            var IconName = AffixName.find((a)=>a.name===s.subaffix).icon;

            //var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
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
                    <span className='text-stone-400 font-bold'>部位</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{partArr[relic.type-1]}</span>   
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span className='text-stone-400 font-bold'>主詞條</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{relic.main_affix}</span>   
                    </div>
                </div>
                <div className='mt-2'>
                    <span className='text-stone-400 font-bold'>副詞條</span>
                    <div className='flex flex-col w-[200px]'>
                        {list}
                    </div>
                </div>
                {(button)?<div className='mt-3'>
                    <button className='processBtn' onClick={()=>navEnchant()}  disabled={!isChangeAble}>重洗模擬</button>
                </div>:<></>}
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
})

export  {RelicData,RelicData_simuldate};