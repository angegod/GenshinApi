function SubAffixHint(){
    return(<div className='flex flex-col max-w-[230px] '>
                <div>
                    <span className="text-white font-bold text-md">使用方法</span>
                </div>
                <div className='[&>span]:text-stone-400 flex flex-col'>
                    <span>根據聖遺物現有狀況</span>
                    <span>依序輸入詞條種類、詞條數值、強化次數</span>
                    <span className='!text-yellow-500'>詞條數值不用輸入%</span>
                    <span className='!text-yellow-500'>如果該詞條沒有被強化過，則強化次數打上0即可</span>
                </div>
                <div className='mt-2 [&>span]:text-stone-400 flex flex-col'>
                    <span>例如:今天有一個詞條為</span>
                    <span className='!text-green-500'>暴擊傷害 13.4% 2</span>
                    <span>那麼只要key上</span>
                    <span className='!text-green-500'>暴擊傷害 13.4 2</span>
                </div>
                <div className='mt-2 flex flex-col'>
                    <span className="text-white font-bold text-md">注意事項:</span>
                    <span className="text-red-500">1.副詞條彼此間不能重複</span>
                    <span className="text-red-500">2.主詞條跟副詞條不可重複</span>
                </div>
            </div>
        )
}

export default SubAffixHint;