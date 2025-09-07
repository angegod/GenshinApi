function HintImporter(){
    return(
        <div className='w-[300px] flex flex-col max-[600px]:my-3'>
            <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
            <ul className='[&>li]:text-stone-400 list-decimal [&>li]:ml-2 max-[400px]:[&>li]:text-sm'>
                <li>此工具會根據玩家放在展示框的12個腳色身上的聖遺物做數據分析</li>
                <li>翻盤機率是指該聖遺物透過啟聖之塵後分數變高的機率為何</li>
                <li>目前該工具只支援計算五星強化至滿等聖遺物</li>
                <li>此工具相關數據或算法仍有更改的可能，敬請見諒!</li>
                <li>如果發現服務頻繁發生錯誤，可以先暫時使用simulator</li>
                <li>本工具數據來源於enka所開發出的API</li>
                <li>更詳細的操作說明可以參考
                <a href='https://home.gamer.com.tw/artwork.php?sn=6191675' className='!underline'>這篇</a></li>
            </ul>
        </div>
    )
}

export default HintImporter

