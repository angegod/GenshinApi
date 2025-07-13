function HintImporter(){
    return(
        <div className='w-[300px] flex flex-col max-[600px]:my-3'>
            <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
            <ul className='[&>li]:text-white list-decimal [&>li]:ml-2 max-[400px]:[&>li]:text-sm'>
                <li>此工具會根據玩家放在展示框的8個腳色身上的遺器做數據分析</li>
                <li>翻盤機率是指該遺器透過重洗詞條道具後遺器分數變高的機率為何</li>
                <li>目前該工具只支援計算五星強化至滿等遺器</li>
                <li>此工具相關數據仍有更改的可能，敬請見諒!</li>
                <li>如果發現服務頻繁發生錯誤，可以先使用simulator。</li>
                <li>操作說明可以參考
                <a href='https://home.gamer.com.tw/artwork.php?sn=6065608' className='!underline'>這篇</a></li>
            </ul>
        </div>
    )
}

export default HintImporter

