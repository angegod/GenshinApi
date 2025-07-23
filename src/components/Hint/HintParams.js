import { useContext } from "react"
import SiteContext from "@/context/SiteContext"

function HintParams(){
    const {mode} = useContext(SiteContext);

    return(
        <div className="max-w-[300px]">
            <span>此區會顯示目前所選擇的有效詞條以及占比</span>
            {
                (mode==="Importer")?
                    <div className="mt-2">
                        <span>此外，這邊可以在移除圖示旁空白處點擊，選定或取消你指定詞條優先級</span>
                        <span>先點擊的詞條種類優先級越高，可以根據鎖頭圖示上的數字判別</span>
                        <span>如果該詞條種類被選為指定詞條，則享有保底強化次數，此次數跟另一個指定詞條共用!</span>
                    </div>:null
            }
        </div>
    )    
}

export default HintParams;