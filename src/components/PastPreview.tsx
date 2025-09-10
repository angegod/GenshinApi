import React, { useContext } from 'react';
import SiteContext from '../context/SiteContext';
import dynamic from "next/dynamic";
import { historyData, hisoryDataSimulate } from '@/data/RelicData';
const LazyImage = dynamic(() => import("./LazyImage"), { ssr: false });

//簡易瀏覽props
interface PastPreviewProps {
    index:number,
    data:historyData
}

interface PastPrevieSimulatewProps {
    index:number,
    data:hisoryDataSimulate
}

//簡易瀏覽
const PastPreview=React.memo(({index,data}:PastPreviewProps)=>{
    const {checkDetails,deleteHistoryData,updateDetails,isChangeAble} = useContext(SiteContext);
    
    const hue = (data.avgRate/100) * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;

    const BaseLink=`https://enka.network/ui/UI_AvatarIcon_${data.char.name}.png`;
    
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    const shield =  `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/shield.svg`;
    const charBgColor = `rarity-${data.char.rarity}`;

    /*<div className='absolute right-0 bottom-0 rounded-[5px] w-[20px] h-[20px] bg-black/70 text-white z-10 flex justify-center items-center'>
                        <img src={shield} width={22} height={22} alt='shield' className='absolute' title='保底次數'/>
                        <span className='text-[12px]'>{data.limit}</span>
                    </div>*/

    return(
        <div className={`PastPreview clip-both-corners`}>
            <div className='flex flex-col mt-2 max-[500px]:mt-0'>
                <div className={`w-[75px] h-[75px] rounded-[10px] ${charBgColor} overflow-hidden`}>
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
            <div className={`flex flex-col ml-2 min-w-[190px] max-[900px]:min-w-[150px]`} >
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>查詢時間:</span>
                    <span className='pl-1 text-white text-sm'>{formatRelativeDate(data.calDate)}</span>
                </div>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>玩家UID:</span>
                    <span className='pl-1 text-white text-sm'>{data.userID}</span>
                </div>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>平均期望:</span>
                    <span className='pl-1 font-bold text-sm' style={{color:textColor}}>{data.avgRate}%</span>
                </div>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>保底次數:</span>
                    <span className='pl-1 font-bold text-sm text-white'>{data.limit}</span>
                </div>
                <div className='[&>button]:text-sm flex flex-row max-[400px]:justify-evenly'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='processBtn mr-2 px-1' onClick={()=>updateDetails(index)} disabled={!isChangeAble}>更新</button>
                    <button className='deleteBtn px-1' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>        
    )
});

//簡易瀏覽_模擬器版本
const PastPreview_simulator=React.memo(({index,data}:PastPrevieSimulatewProps)=>{
    const {checkDetails,deleteHistoryData,isChangeAble} = useContext(SiteContext);
    const hue = data.expRate * 120;

    const textColor =`hsl(${hue}, 100%, 50%)`;  
    const BaseLink=`https://enka.network/ui/UI_AvatarIcon_${data.char.name}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    const charBgColor = `rarity-${data.char.rarity}`;

    return(
        <div className='PastPreview clip-both-corners'>
            <div className='flex flex-col mr-1 mt-2'>
                <div className={`w-[75px] rounded-[10px] ${charBgColor} overflow-hidden`}>
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
            </div>
            <div className='flex flex-col min-w-[190px] max-[900px]:min-w-[150px]'>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>部位:</span>
                    <span className='pl-1 text-white text-sm'>{data.part}</span>
                </div>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>主詞條:</span>
                    <span className='pl-1 text-white text-sm'>{data.mainaffix}</span>
                </div>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>期望機率:</span>
                    <span style={{color:textColor}} className='pl-1 text-white text-sm font-bold'>{(data.expRate*100).toFixed(1)}%</span>
                </div>
                <div className='PastPreviewSection'>
                    <span className='PastPreviewTitle'>保底次數:</span>
                    <span className='pl-1 text-white text-sm font-bold'>{data.limit}</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm'>
                    <button className='processBtn mr-2 px-1 text-sm' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='deleteBtn px-1 text-sm' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>
    
    )
});

//日期字串
function formatRelativeDate(dateString:string):string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    //const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    let relative = "";
    if (diffDays === 0) {
        relative = "今天";
    } else if (diffDays === 1) {
        relative = "昨天";
    } else {
        relative = `${diffDays} 天前`;
    }

    // 格式化日期 → YYYY/MM/DD
    const formattedDate = `${date.getFullYear()}/${
        String(date.getMonth() + 1).padStart(2, "0")
    }/${String(date.getDate()).padStart(2, "0")}`;

    return `${formattedDate}`;
}
export {PastPreview,PastPreview_simulator};