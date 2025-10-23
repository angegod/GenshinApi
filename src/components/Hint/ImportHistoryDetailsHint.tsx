import { useContext } from "react";
import SiteContext from "@/context/SiteContext"
import { historyData } from "@/data/RelicData"

interface PastPreviewProps {
    index:number,
    data:historyData
}

function ImportHistoryDetailsHint({index,data}:PastPreviewProps){
    const {deleteHistoryData,updateDetails,isChangeAble} = useContext(SiteContext);

    const hue = (data.avgRate/100) * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;
    return(
        <div className={`flex flex-col ml-2 w-[190px]`} >
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>查詢時間:</span>
                <span className='pl-1 text-white text-sm'>{formatRelativeDate(data.calDate)}</span>
            </div>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>玩家UID:</span>
                <span className='pl-1 text-white text-sm'>{data.userID}</span>
            </div>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>角色:</span>
                <span className='pl-1 text-white text-sm'>{data.char.cn_name}</span>
            </div>
            <div className='PastPreviewSection'>
                <span className='PastPreviewTitle'>平均分數:</span>
                <span className='pl-1 font-bold text-sm' style={{color:data.avgRank?.color}}>{data.avgScore}</span>
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
                <button className='processBtn mr-2 px-1' onClick={()=>updateDetails(index)} disabled={!isChangeAble}>更新</button>
                <button className='deleteBtn px-1' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
            </div>
        </div>
    )
}

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

export default ImportHistoryDetailsHint;