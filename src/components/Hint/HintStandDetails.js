import React, { Component } from 'react';

//加權指數
function HintStandDetails(){
    return(
        <div className='flex flex-col w-[300px]'>
            <div className='flex flex-col [&>span]:mb-1'>
                <span>此區會顯示匹配這筆資料時所使用的詞條、其加權指數以及其指定優先級</span>
                <span>下面講述加權指數跟指定優先級使用</span>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-white font-bold'>加權指數</span>
                </div>
                <div>
                    <span className='text-stone-400'>每個詞條的分數占比，占比越高代表你越看重這個詞條。</span>
                </div>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-md font-bold text-white'>指定優先級</span>
                </div>
                <div className='flex flex-col'>
                    <span className='text-stone-400'>系統看到該種類的副屬性詞條，被選定為強化保底詞條的優先級</span>
                    <span className='text-yellow-400 font-bold'>數字越大則優先級越高</span>
                </div>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='font-bold'>注意事項</span>
                </div>
                <div>
                    <span className='text-red-500 font-bold'>如果該詞條只會出現在主詞條上，則該詞條不可被指定</span>
                    <span className='text-red-500 font-bold'>如果該聖遺物無法經過你指定的詞條種類標記兩個指定詞條，則系統自動給予其中一個非指定詞條為指定詞條。</span>
                </div>
            </div>          
        </div>
    )
}

export default HintStandDetails