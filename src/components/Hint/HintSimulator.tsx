function HintSimulator(){
    return(
        <div className='w-[300px] flex flex-col max-[600px]:my-3'>
            <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
            <ul className='[&>li]:text-stone-400 list-decimal [&>li]:ml-2 max-[400px]:[&>li]:text-sm'>
                <li>此工具主要目的是給予一些想要重洗詞條的人參考</li>
                <li>翻盤機率是指說該聖遺物透過啟聖之塵道具後聖遺物評分變高的機率為何</li>
                <li>目前該工具只支援計算五星強化至滿等聖遺物</li>
                <li>此工具相關數據、算法及操作功能仍有更改的可能，敬請見諒!</li>
                <li>操作說明可以參考
                <a href='https://home.gamer.com.tw/artwork.php?sn=6191675' className='!underline'>這篇</a></li>
            </ul>
        </div>
    )
}

export default HintSimulator;