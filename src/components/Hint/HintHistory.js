import React, { Component } from 'react';


function HintHistory(){
    return(
        <div className='flex flex-col max-w-[250px] p-1'>
            <div>
                <span className='text-white'>此區塊可以查看過往查詢紀錄，下面為個別功能相關簡述。</span>
            </div>
            <div className='mt-2 flex flex-col'>
                <span className='text-md font-bold text-white'>檢視</span>
                <span className='text-stone-400'>可以查看曾經查詢出來的資訊、包括遺器、評分標準等</span>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-white font-bold'>更新</span>
                </div>
                <div>
                    <span className='text-stone-400'>點選後會根據該紀錄原本的參數再查詢一次，並且將新結果更新至該筆紀錄中。</span>
                </div>
            </div>
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