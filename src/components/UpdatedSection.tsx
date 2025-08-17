"use client";

import { useEffect, useState } from "react";
import updateDetails from "@/data/updateDetail";

export const UpdatedSection = () => {
    const [show, setShow] = useState<boolean>(false);
    const data = updateDetails;

    useEffect(() => {
        /*const storedValue = localStorage.getItem(data.updateType);

        // 如果沒存過 或 存的 updateKey 不同 → 顯示公告
        if (!storedValue || storedValue !== data.updateKey) {
            setShow(true);
        }*/
       setShow(true);
    }, [data]);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem(data.updateType, data.updateKey);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-gray-900 w-11/12 max-w-lg p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl text-red-500 font-bold">{data.updateDate.toISOString().split('T')[0]} 更新公告</span>
                    <button onClick={handleClose} className="text-white text-xl font-bold hover:text-red-400">✕</button>
                </div>
                <ul className="list-decimal ml-6 space-y-1">
                    {data.updateContent.map((d, i) => (
                        <li key={i} className="text-white">
                        {d}
                        </li>
                    ))}
                </ul>

                <div className="mt-6 text-right">
                    <button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    );
};
