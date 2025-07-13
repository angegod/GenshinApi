"use client"
import { createContext, useContext, useState, useRef } from "react";
import '../css/statusmsg.css';

const StatusToastContext = createContext();

export const StatusToastProvider = ({ children }) => {
    const [status, setStatus] = useState("");
    const [statusState, setStatusState] = useState("idle"); // idle | enter | exit
    const [statusBg, setStatusBg] = useState("bg-stone-600");

    const bgMode = useRef("default");
    const toastTimer = useRef(null);
    const animationTimer = useRef(null);

    const statusBar = useRef(null);

    const applyBgMode = (mode = null) => {
        const bg = mode || bgMode.current;

        switch (bg) {
        case "success":
            setStatusBg("bg-green-600");
            break;
        case "error":
            setStatusBg("bg-red-600");
            break;
        default:
            setStatusBg("bg-stone-600");
            break;
        }

        bgMode.current = bg; // 確保記錄當前模式
    };

    const showStatus = (text, bg = "default") => {
        clearTimeout(toastTimer.current);
        clearTimeout(animationTimer.current);

        applyBgMode(bg);
        setStatus(text);
        setStatusState("enter");
    };

    const updateStatus = (text, bg = null) => {
        clearTimeout(toastTimer.current);
        clearTimeout(animationTimer.current);

        applyBgMode(bg);
        setStatus(text);
        setStatusState("enter");

        toastTimer.current = setTimeout(() => {
        setStatusState("exit");

        animationTimer.current = setTimeout(() => {
                setStatus("");
                setStatusState("idle");
            }, 1000); // 對應 CSS 的淡出動畫時間
        }, 2000); // 顯示停留時間
    };

    const hideStatus = () => {
        clearTimeout(toastTimer.current);
        clearTimeout(animationTimer.current);
        setStatusState("exit");

        animationTimer.current = setTimeout(() => {
            setStatus("");
            setStatusState("idle");
        }, 1000);
    };

    return (
        <StatusToastContext.Provider value={{ showStatus, updateStatus, hideStatus }}>
        {children}
        <div
            ref={statusBar}
            className={`fixed w-full flex justify-center top-[50px] z-[200] opacity-80 ${statusState === "idle" ? "hidden" : ""} ${statusState === "enter" ? "toast-enter" : ""} ${statusState === "exit" ? "toast-exit" : ""}`}>
            <div className={`w-[100px] ${statusBg} text-white px-3 py-3 rounded shadow-lg whitespace-pre-line text-center min-w-[250px]`}>
                <span className="font-bold">{status}</span>
            </div>
        </div>
        </StatusToastContext.Provider>
    );
};

export const useStatusToast = () => useContext(StatusToastContext);

