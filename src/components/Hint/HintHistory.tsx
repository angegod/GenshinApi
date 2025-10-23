import React, { Component, useContext } from 'react';
import SiteContext from '@/context/SiteContext';

function HintHistory(){
    //得知母元件是誰
    const {mode} = useContext(SiteContext);

    //根據母元件為simulator或importer顯示不同的內容
    return(
        <div className='flex flex-col max-w-[250px] p-1'>
            <div>
                <span className='text-white'>此區塊可以查看過往查詢紀錄，腳色頭像下方數字代表為
                    {(mode === "Importer")?'全部聖遺物的平均分數':'單一聖遺物的分數'},
                    如果要查看詳細的數據滑鼠移動到腳色頭像上即可查看，也可以透過裏頭的按鈕做進一步操作
                </span>
            </div>
            <div className='mt-2 flex flex-col'>
                <span className='text-md font-bold text-white'>檢視</span>
                <span className='text-stone-400'>點擊腳色頭像即可查看曾經查詢出來的資訊、包括遺器、評分標準等</span>
            </div>
            {(mode === "Importer")?
                <div className='mt-2 flex flex-col'>
                    <div>
                        <span className='text-white font-bold'>更新</span>
                    </div>
                    <div>
                        <span className='text-stone-400'>點選該按鈕後會根據該紀錄原本的參數再查詢一次，並且將新結果同步更新至該筆紀錄中。</span>
                    </div>
                </div>:null
            }
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-md font-bold text-white'>刪除</span>
                </div>
                <div>
                    <span className='text-stone-400'>刪除該筆紀錄</span>
                </div>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-md font-bold text-white'>注意事項</span>
                </div>
                <div className='flex flex-col'>
                    <span className='!text-red-500'>"過往紀錄"最多只保留6筆</span>
                    <span className='!text-yellow-500'>如果在已有6筆資料的情況再新增，則會從最舊的紀錄開始覆蓋掉</span>
                </div>
            </div>
        </div>
    )
}

export default HintHistory;