import React, { useContext } from 'react';
import SiteContext from '../context/SiteContext';
import dynamic from "next/dynamic";
import Image from 'next/image';
import { historyData, historyDataSimulate } from '@/data/RelicData';
import { Tooltip } from 'react-tooltip';
const LazyImage = dynamic(() => import("./LazyImage"), { ssr: false });

//引用提示
import SimulateHistoryDetailsHint from './Hint/SimulateHistoryDetailsHint';
import ImportHistoryDetailsHint from './Hint/ImportHistoryDetailsHint';

//簡易瀏覽props
interface PastPreviewProps {
    index:number,
    data:historyData
}

interface PastPrevieSimulatewProps {
    index:number,
    data:historyDataSimulate
}

//簡易瀏覽
const PastPreview=React.memo(({index,data}:PastPreviewProps)=>{
    const {checkDetails,deleteHistoryData,updateDetails,isChangeAble} = useContext(SiteContext);
    
    const BaseLink=`https://enka.network/ui/UI_AvatarIcon_${data.char.name}.png`;
    
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    let toolTipId = 'HistoryDetails'+index;
    const charBgColor = `rarity-${data.char.rarity}`;

    return(
        <div className={`PastPreview clip-both-corners`} >
            <div className='flex flex-col justify-center mt-2 max-[500px]:mt-0' 
                data-tooltip-id={toolTipId} onClick={isChangeAble?()=>checkDetails(index):undefined}>
                <div className={`w-[75px] h-[75px] mx-auto rounded-[10px] ${charBgColor} overflow-hidden`}>
                    <LazyImage 
                        BaseLink={BaseLink} 
                        LoadImg={LoadImgLink}
                        width={75}
                        height={75}
                        style={`max-[400px]:min-w-[75px]`}/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.avgRank?.color}} className='font-bold text-xl max-[400px]:text-lg'>{data.avgScore}</span>
                </div>
            </div>
            <Tooltip
                    id={toolTipId}
                    place='bottom-start'
                    arrowColor='gray' 
                    style={{zIndex:9999}}
                    clickable={true}
                    render={()=>
                        <ImportHistoryDetailsHint index={index} data={data} />
                    } />
        </div>        
    )
});

//簡易瀏覽_模擬器版本
const PastPreview_simulator=React.memo(({index,data}:PastPrevieSimulatewProps)=>{
    const {checkDetails,isChangeAble} = useContext(SiteContext);
    const hue = data.expRate * 120;

    //const textColor =`hsl(${hue}, 100%, 50%)`;  
    const BaseLink=`https://enka.network/ui/UI_AvatarIcon_${data.char.name}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    const charBgColor = `rarity-${data.char.rarity}`;

    let toolTipId = 'HistoryDetails'+index;

    return(
        <div className='PastPreview clip-both-corners' >
            <div className='flex flex-col mt-2' data-tooltip-id={toolTipId} 
                onClick={isChangeAble?()=>checkDetails(index):undefined}>
                <div className={`w-[75px] rounded-[10px] flex mx-auto ${charBgColor} overflow-hidden`}  >
                    <LazyImage 
                        BaseLink={BaseLink} 
                        LoadImg={LoadImgLink}
                        width={75}
                        height={75}
                        style={`rounded-[10px] max-[400px]:min-w-[75px]`}/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.rank.color}} className='font-bold text-xl'>{data.score}</span>
                </div>
                <div className='flex flex-row justify-evenly [&>button]:max-[400px]:text-sm'>
                    
                </div>
            </div>
            <Tooltip
                    id={toolTipId}
                    place='bottom-start'
                    arrowColor='gray' 
                    style={{zIndex:9999}}
                    clickable={true}
                    render={()=>
                        <SimulateHistoryDetailsHint index={index} data={data} />
                    } />
        </div>
    
    )
});



export {PastPreview,PastPreview_simulator};