import { useContext } from "react";
import SiteContext from "@/context/SiteContext";
import { historyDataSimulate } from "@/data/RelicData";

interface PastPrevieSimulatewProps {
    index:number,
    data:historyDataSimulate
}

function SimulateHistoryDetailsHint({index,data}:PastPrevieSimulatewProps){
    const {deleteHistoryData,isChangeAble} = useContext(SiteContext);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const hue = data.expRate * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;  

    return(
        <div className='flex flex-col w-[180px]'>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>角色:</span>
                <span className='pl-1 text-white text-sm'>{data.char.cn_name}</span>
            </div>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>主詞條:</span>
                <span className='pl-1 text-white text-sm'>{data.mainaffix}</span>
            </div>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>期望機率:</span>
                <span style={{color:textColor}} className='pl-1 text-white text-sm font-bold'>{(data.expRate*100).toFixed(1)}%</span>
            </div>
            <div>
                <span className='PastPreviewTitle'>期望分數:</span>
                <span style={{color:data.rank.color}} className='pl-1 text-white text-sm font-bold'>{(Number(data.score))}</span>
            </div>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>保底次數:</span>
                <span className='pl-1 text-white text-sm font-bold'>{data.limit}</span>
            </div>
            <div className='mt-1'>
                <button className='deleteBtn px-1 max-w-[100px]' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
            </div>
        </div>
    )
}

export default SimulateHistoryDetailsHint;