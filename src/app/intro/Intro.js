"use client"
import React, { Component } from 'react';
import "@/css/intro.css";
//闡述為啥要使用這個工具 
function Intro(){
    //之後intro頁面可能會改成json控管
    return(
        <div className='w-4/5 mx-auto'>
            <div className='intro p-[1rem] mb-3 rounded-md [&>div]:my-1 w-1/2 flex flex-col h-[90vh] justify-around max-[800px]:!w-[95%] max-[800px]:h-fit'>
                <div className='flex flex-col'>
                    <span className='text-2xl text-red-500 font-bold'>常見Q&A</span>
                    <span className='text-white'>這裡列出比較常見的幾個問題，如果有其他問題也歡迎利用巴哈私訊我</span>
                </div>
                <div className='flex flex-col [&>div]:my-1'>
                    <div className='flex flex-row items-center'>
                        <span className='question'>Q:甚麼是重洗?</span>
                        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/good.png`}
                            alt="icon"
                            className="inline align-middle h-[25px] w-auto ml-1"/>
                    </div>
                    <div className='[&>span]:text-white flex flex-col'>
                        <span>A:原神5.7版本中推出了一個道具叫<span className='text-yellow-500 font-bold'>啟聖之塵</span></span>
                        <span className="text-md leading-tight">
                            此道具可以針對強化至滿等的五星聖遺物做詞條隨機重新分配                        
                        </span>
                    </div>
                </div>
                <div className='flex flex-col [&>div]:my-1'>
                    <div className='flex flex-row items-center'>
                        <span className='question'>Q:為啥需要重洗?</span>
                        <img    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/yulin.png`}
                                alt="Good.png" width={25} height={25}
                                className='inline'/>
                    </div>
                    <div>
                        <span className='text-white'>A:原神雖然自定義聖遺物道具，但成本昂貴且素材不能隨時取得，更何況使用後也不能保證獲得高品質的聖遺物。</span>
                        <span className='text-white flex flex-row items-center'>這個道具使用得當，可以有效降低培養成本。</span>
                    </div>
                </div>
                <div className="flex flex-col [&>div]:my-1 ">
                    <div className='flex flex-row items-center'>
                        <span className='question'>Q:這件適合重洗嗎?</span>
                        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/feixiao.png`}
                                    alt="Good.png" width={25} height={25}/>
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-white'>A:這個就是為何要使用本工具了!本工具不僅可以根據你想要的詞條配置</span>
                        <span>
                            計算出<span className='text-red-500 font-bold'>每件聖遺物所有可能的強化組合</span>
                            以及<span className='text-red-500 font-bold'>計算出在這些組合中翻盤的機率</span></span>
                        <span className='text-white'></span>              
                    </div>
                </div>
                <div className="flex flex-col [&>div]:my-1 ">
                    <div className='flex flex-row items-center'>
                        <span className='question'>Q:目前啟聖之塵取得的管道?</span>
                        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/feixiao.png`}
                                    alt="Good.png" width={25} height={25}/>
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-white'>A:啟聖之塵的獲得方式仍相當稀少，目前僅有以下幾種管道：</p>
                        <ol className='[&>li]:text-stone-400'>
                            <li><strong className='text-amber-600'>幽境危戰：</strong>最主要的獲得來源，打過難度五且累積1200樹酯消耗可以獲得3根羽毛</li>
                            <li><strong className='text-amber-600'>大月卡購買：</strong>珍珠紀行跟珍珠之歌兩者購買可以均獲得一根</li>
                        </ol>                   
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default Intro;