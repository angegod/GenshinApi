function SubAffixHint(){
    return(<div className='flex flex-col max-w-[230px] '>
                <div>
                    <span className="text-white font-bold text-md">使用方法</span>
                </div>
                <div className='[&>span]:text-stone-400 flex flex-col'>
                    <span>根據聖遺物現有狀況</span>
                    <span>依序輸入詞條種類、詞條數值、強化次數以及是否指定</span>
                    <span className='!text-yellow-500'>詞條數值不用輸入%</span>
                    <span className='!text-yellow-500'>如果該詞條沒有被強化過，則強化次數打上0即可</span>
                </div>
                <div className='mt-2 [&>span]:text-stone-400 flex flex-col'>
                    <span>例如:今天有一個詞條為</span>
                    <span className='!text-green-500'>暴擊傷害,數值13.4%,強化次數2</span>
                    <span>那麼只要依序key上</span>
                    <span className='!text-green-500'>暴擊傷害 13.4 2</span>
                </div>
                <div className="mt-2 [&>span]:text-stone-400 flex flex-col">
                    <span>每個詞條最右側都有勾選框</span>
                    <span className="text-yellow-400">現有遊戲重洗規定必須選定兩個詞條，這兩個詞條會享有保底強化次數</span>
                </div>
                <div className='mt-2 flex flex-col'>
                    <span className="text-white font-bold text-md">注意事項:</span>
                    <span className="text-red-500">1.副詞條彼此間不能重複</span>
                    <span className="text-red-500">2.主詞條跟副詞條不可重複</span>
                    <span className="text-red-500">3.指定共享保底副詞條必為2個</span>
                </div>
            </div>
        )
}

export default SubAffixHint;