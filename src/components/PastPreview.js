import React, { useContext } from 'react';
import '../css/main.css';
import SiteContext from '../context/SiteContext';
import HistoryStore from '@/model/historyStore';


//簡易瀏覽
const PastPreview=React.memo(({index,data})=>{
    const {checkDetails,deleteHistoryData,updateDetails,isChangeAble} = useContext(SiteContext);
    const hue = data.expRate * 120;
    //const textColor =`hsl(${hue}, 100%, 50%)`;
    let BaseLink=`https://enka.network/ui/UI_AvatarIcon_${data.char.name}.png`;
    
    return(
        <div className={`PastPreview clip-both-corners`}>
            <div className='flex flex-col'>
                <div>
                    <img src={BaseLink} alt='iconChar' className='w-[70px] rounded-[50px] max-[400px]:min-w-[50px] max-[400px]:w-[50px]'/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.avgRank?.color}} className='font-bold text-xl max-[400px]:text-lg'>{data.avgScore}</span>
                </div>
            </div>
            <div className={`flex flex-col mx-1 min-w-[200px] max-[900px]:min-w-[150px]`} >
                <div className='flex flex-row [&>span]:text-white justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>查詢日期:</span>
                    <span className='pl-1'>{data.calDate}</span>
                </div>
                <div className='flex flex-row [&>span]:text-white justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>玩家UID:</span>
                    <span className='pl-1'>{data.userID}</span>
                </div>
                <div className='flex flex-row [&>span]:text-white justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>平均期望:</span>
                    <span className='pl-1'>{data.avgRate}%</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm flex flex-row max-[400px]:justify-evenly'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='processBtn mr-2 px-1' onClick={()=>updateDetails(index)} disabled={!isChangeAble}>更新</button>
                    <button className='deleteBtn px-1' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>        
    )
});

//簡易瀏覽_模擬器版本
const PastPreview_simulator=React.memo(({data,index})=>{
    const {checkDetails,deleteHistoryData,isChangeAble} = useContext(SiteContext);
    const hue = data.expRate * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;  
    let BaseLink=`https://enka.network/ui/UI_AvatarIcon_${data.char.name}.png`;

    return(<>
        <div className='PastPreview clip-both-corners'>
            <div className='flex flex-col mr-1'>
                <div>
                    <img src={BaseLink} alt='iconChar' className='w-[70px] rounded-[50px] max-[400px]:min-w-[50px] max-[400px]:w-[50px]'/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.rank.color}} className='font-bold text-xl'>{data.score}</span>
                </div>
            </div>
            <div className='flex flex-col min-w-[200px] max-[900px]:min-w-[150px]'>
                <div className='[&>span]:text-white flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>部位:</span>
                    <span>{data.part}</span>
                </div>
                <div className='[&>span]:text-white flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>主詞條:</span>
                    <span>{data.mainaffix}</span>
                </div>
                <div className='[&>span]:text-white flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep'>期望機率:</span>
                    <span style={{color:textColor}} className='pl-1 font-bold'>{(data.expRate*100).toFixed(1)}%</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='deleteBtn px-1 ' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>
    
    </>)
})

export {PastPreview,PastPreview_simulator};