import React from 'react';
import Link from 'next/link';
import '@/css/footer.css';

const Links=[{
    name:"Home",
    cn:"主頁",
    link:"/"
},{
    name:"Simulator",
    cn:"手動輸入",
    link:"/simulator"
},{
    name:"Importer",
    cn:"自動匯入",
    link:"/import"
},{
    name:"Intro",
    cn:"介紹及Q&A",
    link:"/intro"
}]

function Footer(){

    const list =Links.map((l,i)=>{
        return(
            <div key={'link'+i} className="group h-fit cursor-pointer w-[130px]">
                <div className='w-fit'>
                    <Link href={l.link}>
                        <span className="font-bold hover:text-gray-200 text-sm">{l.name}&nbsp;{l.cn}</span>
                    </Link>
                    <div className="relative group h-[1px]">
                        <span className="absolute left-0 top-0 w-full h-full origin-center scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100"></span>
                    </div>
                </div>
            </div>
        )
    });


    return(
        <div className='flex flex-row justify-center bg-[rgb(40,40,40)] min-h-[20vh] text-left [&>div]:w-4/5 max-[600px]:min-h-[30vh] max-[600px]:!flex-col'>  
            <div className='mx-auto flex flex-row flex-wrap h-fit justify-center [&>div]:mx-3 mt-3 [&>div]:first:mr-0 max-[800px]:flex-col max-[800px]:items-center max-[600px]:!items-start max-[600px]:[&>div]:mb-1'>
                {list}
            </div>
            <div className='mx-auto text-stone-500 flex flex-col [&>span]:text-left [&>span]:text-sm [&>span]:font-bold [&>span]:mt-1 py-2 max-[600px]:[&>span]:!text-sm'>
                <span>&copy; 2025 <a href="https://home.gamer.com.tw/profile/index.php?&owner=ange0733" className="underline">Ange</a></span>
                <span>Website created by Ange. All rights reserved.</span>
                <span>Data latest Updated at 2025/07/20</span>
            </div>
        </div>
    )
}

export default Footer;