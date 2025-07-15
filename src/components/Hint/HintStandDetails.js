import React, { Component } from 'react';

//加權指數
function HintStandDetails(){
    return(
        <div className='flex flex-col w-[300px]'>
            <span>此區會顯示匹配這筆資料時所使用的詞條加權指數以及指定優先級</span>
            <span className='text-stone-400'>下方詞條左側如果有出現鎖頭加一個數字，代表你曾經指定該詞條為優先指定詞條</span>
            <span className='text-yellow-400 font-bold'>數字越大則優先級越高</span>
        </div>
    )
}

export default HintStandDetails