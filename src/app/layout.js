"use client";
import Main from "@/components/Main"
import '../app/globals.css';
import { StatusToastProvider } from '@/context/StatusMsg.js';

export default function Layout(){
    return(
        <html>
            <body>
                <StatusToastProvider>
                    <Main />
                </StatusToastProvider>
            </body>
        </html>
    )
}