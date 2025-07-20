
import React, {  useContext, useEffect, useState } from 'react';
import AffixName from '../data/AffixName';
import SiteContext from '../context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import Image from 'next/image';
import { Tooltip } from '@mui/material';
import AffixList from '@/data/AffixList';



const StandDetails=React.memo(()=>{
    const {standDetails} = useContext(SiteContext);
    const showLock = (standDetails.filter((s)=>s.SelectPriority > 0).length>0)?true:false;

    if(standDetails!==undefined){
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const list=standDetails.map((s)=>{
            
            return(
                <div className='flex flex-row' key={'StandDetails_'+s.name}>
                    <div className='flex justify-between w-[15vw] min-w-[150px] mt-0.5'>
                        <div className='flex flex-row'>
                            {(showLock)?
                                <div className="relative w-[20px] h-[20px]">
                                    <div
                                        className={`absolute inset-0 opacity-30 bg-center bg-no-repeat bg-contain ${
                                            s.SelectPriority > 0 ? '' : 'hidden'}`}
                                        style={{ backgroundImage: `url('${basePath}/image/lock.svg')` }}>    
                                    </div>
                                    <span className="relative top-[2px] text-xs font-bold text-stone-300 flex items-center justify-center w-full h-full">
                                        {s.SelectPriority > 0 ? s.SelectPriority : ''}
                                    </span>
                                </div>:null
                            }
                            <div className='flex flex-row'>
                                <span className='whitespace-nowrap overflow-hidden text-ellipsis text-stone-400'>{s.name}</span>
                            </div>
                        </div>
                        <div>
                            <span className='text-stone-400'>{s.value}</span>
                        </div>
                    </div>
                </div>
            )
        })

        return(
            <div className={`w-[100%] mb-5  my-1 max-[600px]:!min-w-[0px]`}>
                <div className='flex flex-row items-center'>
                    <span className='text-red-600 text-lg font-bold'>標準加權</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="StandDetailsHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div>
                    {list}
                </div>
            </div>)
    }
});


const ShowStand = React.memo(({ lock }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const { selfStand, setSelfStand, isChangeAble,partsIndex } = useContext(SiteContext);
    const { updateStatus } = useStatusToast();

    // 每次 selfStand 變動時，自動重新整理 SelectPriority（保證連續性
    useEffect(() => {
        const locked = selfStand
            .map((item, i) => ({ ...item, __index: i }))
            .filter(item => item.SelectPriority > 0)
            .sort((a, b) => a.SelectPriority - b.SelectPriority);

        // 重新排序
        locked.forEach((item, i) => {
            item.SelectPriority = i + 1;
        });

        // 將順位套回原本位置
        const updated = selfStand.map((item, i) => {
            const match = locked.find(l => l.__index === i);
            return {
                ...item,
                SelectPriority: match ? match.SelectPriority : 0
            };
        });

        setSelfStand(updated);
    }, [selfStand.length]);

    // 處理變更數值
    function changeVal(index, val, event) {
        val = Number(val);
        if (val > 1 || val < 0 || isNaN(val)) {
            event.target.value = 1;
            val = 1;
            updateStatus("加權指數只能介於 0 跟 1 之間", 'error');
        }

        const updated = [...selfStand];
        updated[index] = { ...updated[index], value: val };
        setSelfStand(updated);
    }

    // 點擊鎖定
    function lockAffix(index) {
        const updated = [...selfStand];
        const current = updated[index].SelectPriority ?? 0;
        const currentAffix = AffixName.find((a)=>a.name === updated[index].name);

        //如何該詞條只會出現在主詞條，則不予指定
        if(currentAffix.isMain){
            updateStatus('該詞條只會出現主詞條\n不可選擇!!', 'error');
            return;
        }

        if (current === 0) {
            // 新增鎖定
            const used = updated.map(s => s.SelectPriority).filter(p => p > 0);
            if (used.length >= 4) {
                updateStatus('最多只能鎖定 4 個項目', 'error');
                return;
            }

            const next = used.length > 0 ? Math.max(...used) + 1 : 1;
            updated[index].SelectPriority = next;
        } else {
            // 移除鎖定 & 向前調整其他順位
            const removed = updated[index].SelectPriority;
            updated[index].SelectPriority = 0;

            for (let i = 0; i < updated.length; i++) {
                if (updated[i].SelectPriority > removed) {
                    updated[i].SelectPriority -= 1;
                }
            }
        }

        setSelfStand(updated);
    }

    // 移除詞條
    function removeAffix(index) {
        setSelfStand(arr => arr.filter((_, i) => i !== index));
    }

    // 渲染每一項
    const list = selfStand?.map((s, i) => (
        <div className="flex flex-row" key={'StandDetails' + i}>
            <div className="flex justify-between w-[150px] max-w-[300px] mt-0.5 mr-2 max-[400px]:w-[70%]">
                <span className="whitespace-nowrap overflow-hidden text-white text-ellipsis text-left w-[100px]" title={s.name}>
                    {s.name}
                </span>
                <input
                    type="number"
                    min={0}
                    max={1}
                    className="ml-2 text-center max-h-[30px] min-w-[30px] bgInput"
                    defaultValue={s.value}
                    title="最小值為 0，最大為 1"
                    onChange={(e) => changeVal(i, e.target.value, e)}
                />
            </div>
            <div className="flex items-center">
                {lock !== false ? (
                    <div className="relative w-[20px] h-[20px] cursor-pointer group" onClick={() => lockAffix(i)}>
                        <div
                            className={`absolute inset-0 opacity-30 bg-center bg-no-repeat bg-contain pointer-events-none ${
                                s.SelectPriority > 0 ? '' : 'hidden group-hover:block'
                            }`}
                            style={{ backgroundImage: `url('${basePath}/image/lock.svg')` }}
                        ></div>
                        <span className="relative top-[2px] z-10 text-xs font-bold text-gray-300 flex items-center justify-center w-full h-full">
                            {s.SelectPriority > 0 ? s.SelectPriority : ''}
                        </span>
                    </div>
                ) : null}
                <Image
                    src={`${basePath}/image/delete.svg`}
                    alt="刪除"
                    width={20}
                    height={20}
                    className="mx-auto cursor-pointer hover:opacity-80"
                    onClick={() => removeAffix(i)}
                />
            </div>
        </div>
    ));

    return <div className="flex flex-col">{list}</div>;
});


export {StandDetails,ShowStand};