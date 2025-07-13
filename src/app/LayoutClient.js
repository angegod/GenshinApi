"use client"
import { usePathname } from 'next/navigation';
import { Menu, MainMenu } from '@/components/Menu';

export default function LayoutClient({ children }) {
    const pathname = usePathname();

    const isHome = pathname === '/' || pathname === '/StarRailApi/';

    let backgroundClass = isHome ? 'MainBackGround' : 'SubBackGround';
    if (process.env.NODE_ENV === 'production') {
      backgroundClass += '-release';
    }

    return (
        <div className={backgroundClass}>
          {isHome ? (<MainMenu />) : (
            <>
              <Menu />
              <div className="min-h-[100vh]">
                  {children}
              </div>
            </>
          )}
        </div>
    );
}
