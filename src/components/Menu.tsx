import Link from 'next/link';
import Image from 'next/image';
import '@/css/main.scss';
import '@/css/globals.scss';

const list=[{
    link:'/simulator',
    name:'聖遺物重洗模擬',
    engname:'simulator',
    image:'simulator.png',
    mode: '手動輸入',
    description:"背包中的聖遺物"
},{
    link:'/import',
    name:'聖遺物重洗匯入',
    engname:'importer',
    image:'importer.png',
    mode:'API自動匯入',
    description:"展示櫃角色身上的聖遺物",
}];

interface MenuProps {
  children?: React.ReactNode;
}

function Menu({children}:MenuProps) {
    return (
        <div className='top-0 w-[100%] z-40 py-3'>
            <div className='flex flex-row w-4/5 mx-auto max-[400px]:w-[90%]'>
                {list.map((m, i) => (
                    <div className='mr-3 flex flex-col bg-gray-700 min-w-[100px] rounded-md justify-center px-2' key={'menu' + i}>
                        <Link href={m.link} className='text-center'>
                            <span className='text-gray-500 font-bold text-lg max-[500px]:text-sm'>
                            {m.name}
                            </span>
                        </Link>
                        <span className='text-lg text-gray-400 text-center max-[500px]:text-sm'>
                            {m.engname}
                        </span>
                    </div>
                ))}
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}

function MainMenu(){
    return(
        <div className={`w-[100%] h-[80vh] relative max-[900vh]:h-[100vh] `}>
            <div className='w-4/5 flex flex-col top-[10vh] relative mx-auto max-[900px]:w-[90%] max-[900px]:top-[5vh]'>
                <div className='text-center h-fit flex flex-col'>
                    <div className='flex flex-col mt-5'>
                        <span className='font-bold text-2xl text-gray-200'>聖遺物重洗模擬器 </span>
                        <span className='font-bold text-xl text-gray-300'>Artifact Simulator</span>
                    </div>
                    <div className='mt-3'>
                        <span>能夠根據每件聖遺物的初始屬性，完整模擬及統計所有可能的強化組合，讓你了解該聖遺物潛力!</span>
                    </div>
                </div>
                <div className='flex flex-row justify-evenly mx-auto w-[100%] mt-[5vh]'>
                    {list.map((m, i) => (
                        <div key={'menu' + i} className='w-2/5 flex flex-col max-[900px]:w-[45%]'>
                            <div className='subMenu arrow-down-box'>
                                <span className='font-bold text-white italic max-[500px]:text-sm'>{m.description}</span>
                            </div>
                            <Link href={m.link} className='text-center'>
                                <div className='flex flex-col bg-gray-700/70 rounded-sm hover:bg-gray-600/70'>
                                    <div className='flex flex-col justify-center my-2'>
                                        <Image 
                                            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/${m.image}`}
                                            alt="Logo"
                                            width={200}
                                            height={200}
                                            className='mx-auto max-[500px]:!w-[150px]'/>
                                        <span className='text-xl text-gray-400 font-bold max-[500px]:text-base'>{m.mode}</span>
                                        <span className='text-lg text-gray-400 font-bold max-[500px]:text-base'>{m.engname}</span>
                                    </div> 
                                </div>
                            </Link>
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export {MainMenu,Menu};
