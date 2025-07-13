

function HintEnchant(){
    return(
        <div className='flex flex-col max-w-[250px] p-1'>
            <div>
                <span className='text-white'>此區塊可以操作指定遺器，模擬使用變量骰子後可能會出現的強化組合。下面為各功能簡單敘述:</span>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-white font-bold'>再洗一次</span>
                </div>
                <div>
                    <span className='text-stone-400'>模擬使用變量骰子後所得到的結果</span>
                </div>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-md font-bold text-white'>套用新強化</span>
                </div>
                <div>
                    <span className='text-stone-400'>將對照的遺器資訊替換成目前重洗後的模樣</span>
                </div>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-md font-bold text-white'>還原</span>
                </div>
                <div>
                    <span className='text-stone-400'>將重洗次數以及遺器配置重設為一開始的配置。</span>
                </div>
            </div>
            <div className='mt-2 flex flex-col'>
                <div>
                    <span className='text-md font-bold text-white'>注意事項</span>
                </div>
                <div className='flex flex-col'>
                    <span className='!text-yellow-500'>重洗後的相關數據均存在誤差的可能，實際請以遊戲顯示的數值為主。</span>
                </div>
            </div>
        </div>
    )
}

export default HintEnchant