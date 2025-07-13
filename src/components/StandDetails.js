import React, {  useContext, useState } from 'react';
import AffixName from '../data/AffixName';
import SiteContext from '../context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import Image from 'next/image';

const StandDetails=React.memo(()=>{
    const {standDetails} = useContext(SiteContext);

    if(standDetails!==undefined){
        const list=standDetails.map((s)=>{
            //var IconName = AffixName.find((a)=>a.name===s.name).icon;
            
            return(
                <div className='flex flex-row' key={'StandDetails_'+s.name}>
                    <div className='flex justify-between w-[15vw] min-w-[150px] mt-0.5'>
                        <div className='flex flex-row'>
                            <span className='whitespace-nowrap overflow-hidden text-ellipsis text-stone-400'>{s.name}</span>
                        </div>
                        <span className='text-stone-400'>{s.value}</span>
                    </div>
                </div>
            )
        })

        return(<>
            <div className={`w-[100%] mb-5  my-1 max-[600px]:!min-w-[0px]`}>
                <div>
                    <span className='text-red-600 text-lg font-bold'>標準加權</span>
                </div>
                <div>
                    {list}
                </div>
            </div>
        
        </>)
    }
});


//顯示你所輸入的標準
const ShowStand=React.memo(({lock})=>{
    const {selfStand,setSelfStand,isChangeAble} = useContext(SiteContext);
    // 共用statusMsg 
    const {showStatus,updateStatus,hideStatus}=useStatusToast();
    //目前詞條優先鎖定程度
    const [lockPriority,setLockPriority] = useState(1);

    if(selfStand !== null){
        const list=selfStand.map((s,i)=>{
            return(
            <div className='flex flex-row' key={'StandDetails'+i}>
                <div className='flex justify-between w-[170px] max-w-[300px] mt-0.5 mr-2 max-[400px]:w-[70%]'>
                    <span className='whitespace-nowrap overflow-hidden text-white text-ellipsis text-left w-[100px]' title={s.name}>{s.name}</span>
                    <input type='number' min={0} max={1} 
                        className='ml-2 text-center max-h-[30px] 
                        min-w-[40px] bgInput' 
                        defaultValue={selfStand[i].value}
                        title='最小值為0 最大為1'
                        onChange={(event)=>changeVal(i,event.target.value)}/>
                    
                </div>
                <div className='flex items-center'>
                    {(lock !== false)?
                    <div className='relative w-[20px] h-[20px] cursor-pointer group' onClick={()=>lockAffix(i)}>
                         <div
                            className={`absolute inset-0 opacity-50 bg-center bg-no-repeat bg-contain pointer-events-none
                                        ${s.SelectPriority > 0 ? '' : 'hidden group-hover:block'}`}
                            style={{ backgroundImage: "url('/image/lock.svg')" }}
                        ></div>
                        <span className={`relative z-10 text-xs font-bold text-gray-300 flex items-center justify-center w-full h-full`}>
                            {(s.SelectPriority>0)?s.SelectPriority:''}
                        </span>
                    </div>:<></>}
                    <Image 
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/delete.svg`}
                        alt="Logo"
                        width={20}
                        height={20}
                        className='mx-auto cursor-pointer hover:opacity-80'
                        onClick={()=>removeAffix(i)}/>
                </div>
                
            </div>)
        })
        
        function removeAffix(index){
            let stand = [...selfStand]; // 複製，避免直接改 state

            const removedPriority = stand[index].SelectPriority;
            stand[index].SelectPriority = 0; // 解除鎖定

            // 將所有比它大的順位往前移
            for (let i = 0; i < stand.length; i++) {
                if (stand[i].SelectPriority > removedPriority) {
                    stand[i].SelectPriority -= 1;
                }
            }

            setLockPriority((num) => num - 1);
            setSelfStand((arr)=>arr.filter((item,i)=>i!==index));
        }

        //根據目前優先級 鎖定該詞條 並給予優先級
        function lockAffix(index) {
            let stand = [...selfStand]; // 複製，避免直接改 state
            let currentPriority = stand[index].SelectPriority ?? 0;

            if (currentPriority === 0) {
                // 詞條未鎖定，嘗試加入鎖定
                if (lockPriority <= 4) {
                    stand[index].SelectPriority = lockPriority;
                    setLockPriority((num) => num + 1);
                    setSelfStand(stand);
                }
            } else {
                // 詞條已鎖定，解除鎖定並調整其他鎖定順位
                const removedPriority = stand[index].SelectPriority;
                stand[index].SelectPriority = 0; // 解除鎖定

                // 將所有比它大的順位往前移
                for (let i = 0; i < stand.length; i++) {
                    if (stand[i].SelectPriority > removedPriority) {
                        stand[i].SelectPriority -= 1;
                    }
                }

                setLockPriority((num) => num - 1);
                setSelfStand(stand);
            }
        }


    
        function changeVal(index,val){
            if(val>1||val<0){
                event.target.value = 1;
                updateStatus("加權指數只能介於0跟1之間");
                val=1;
            }
    
            let stand=selfStand;
            stand[index].value=Number(val);
    
            setSelfStand(stand);
        }
    
        return(<>
            <div className='flex flex-col'>
                {list}
            </div>
        </>)
    }
    
});

export {StandDetails,ShowStand};