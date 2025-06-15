import React, {  useContext } from 'react';
import AffixName from '../data/AffixName';
import SiteContext from '../context/SiteContext';
import Image from 'next/image';

const StandDetails=React.memo(()=>{
    const {standDetails} = useContext(SiteContext);

    if(standDetails!==undefined){
        const list=standDetails.map((s)=>{
            var IconName = AffixName.find((a)=>a.name===s.name).icon;

            //var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            
            
            return(
                <div className='flex flex-row' key={'StandDetails_'+s.name}>
                    <div className='flex justify-between w-[15vw] min-w-[150px] mt-0.5'>
                        <div className='flex flex-row'>
                            <span className='whitespace-nowrap overflow-hidden text-ellipsis text-stone-400'>{s.name}</span>
                        </div>
                        <span className='text-stone-400'>{s.value}</span>
                    </div>
                </div>
            )
        })

        return(<>
            <div className={`w-[100%] mb-5  my-1 max-[600px]:!min-w-[0px]`}>
                <div>
                    <span className='text-red-600 text-lg font-bold'>標準加權</span>
                </div>
                <div>
                    {list}
                </div>
            </div>
        
        </>)
    }
});


//顯示你所輸入的標準
const ShowStand=React.memo(()=>{
    const {selfStand,setSelfStand,setStatusMsg,isChangeAble} = useContext(SiteContext);
    if(selfStand !== null){
        const list=selfStand.map((s,i)=>{
        
            //var IconName = AffixName.find((a)=>a.name===s.name).icon;
    
            //var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            
            
            return(
            <div className='flex flex-row' key={'StandDetails'+i}>
                <div className='flex justify-between w-[170px] max-w-[300px] mt-0.5 mr-2 max-[400px]:w-[70%]'>
                    <span className='whitespace-nowrap overflow-hidden text-white text-ellipsis text-left w-[100px]' title={s.name}>{s.name}</span>
                    <input type='number' min={0} max={1} 
                        className='ml-2 text-center max-h-[30px] 
                        min-w-[40px] bgInput' 
                        defaultValue={selfStand[i].value}
                        title='最小值為0 最大為1'
                        onChange={(event)=>changeVal(i,event.target.value)}/>
                    
                </div>
                <div className='flex items-center'>
                    <Image 
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/delete.svg`}
                        alt="Logo"
                        width={20}
                        height={20}
                        className='mx-auto cursor-pointer hover:opacity-80'
                        onClick={()=>removeAffix(i)}/>
                </div>
                
            </div>)
        })
        
        //<button onClick={()=>removeAffix(i)} className='deleteBtn px-1 whitespace-nowrap' disabled={!isChangeAble}>移除</button>
        function removeAffix(index){
            setSelfStand((arr)=>arr.filter((item,i)=>i!==index));
        }
    
        function changeVal(index,val){
            if(val>1||val<0){
                val=1;
                setStatusMsg('加權指數不可高於1或低於0!')
            }
    
            let stand=selfStand;
            selfStand[index].value=val;
    
            setSelfStand(stand);
        }
    
        return(<>
            <div className='flex flex-col'>
                {list}
            </div>
        </>)
    }
    
});

export {StandDetails,ShowStand};