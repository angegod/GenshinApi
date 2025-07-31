
import { useRef,useState } from "react";

//圖片延遲載入元件
function LazyImage({BaseLink,LoadImg,style,width,height}){
    const imageRef = useRef();
    const [show,setShow] = useState(false);

    //圖片延遲載入
    function ImageLoad(){
        if(imageRef.current.complete&&!imageRef.current.error){
            setTimeout(()=>{
                setShow(true);
            },500)   
        }
        else{
            setShow(false);
        }
    }

    return(
        <div>
            <img 
                src={LoadImg} 
                alt='icon' width={width} height={height}
                className={`${style} ${(show)?'hidden':''}`} />
            <img 
                src={BaseLink} 
                ref={imageRef}
                onLoad={()=>ImageLoad()}
                alt='icon' width={width} height={height}
                className={`${style} ${(!show)?'hidden':''}`}/>
        </div>
    )
}

export default LazyImage;