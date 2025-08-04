import '../app/globals.css';
import { StatusToastProvider } from '@/context/StatusMsg.js';
import LayoutClient from './LayoutClient';
import Footer from '@/components/Footer';

export const metadata = {
    title: '原神--聖遺物重洗模擬--主頁',
    description: '原神--聖遺物重洗模擬--主頁',
    other: {
        keywords: '聖遺物重洗, 聖遺物重洗模擬, artifact enchant, artifact simulator, artifact ranker, 聖遺物重擲, 聖遺物重擲模擬器',
    },
};
interface layoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }:layoutProps) {
    let faviconHref = (process.env.NODE_ENV === 'production')?process.env.NEXT_PUBLIC_BASE_PATH:"";

    return (
        <html lang="zh-Hant">
            <head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <meta name="keywords" content={metadata.other.keywords} />
                <link rel="icon" href={`${faviconHref}/favicon.ico`} />
            </head>
            <body>
                <StatusToastProvider>
                    <LayoutClient>{children}</LayoutClient>
                    <Footer />
                </StatusToastProvider>
            </body>
        </html>
    );
}