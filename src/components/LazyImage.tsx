"use client";
import React, { useRef, useState } from "react";

interface LazyImageProps {
    BaseLink: string;
    LoadImg: string;
    style?: string;
    width?: number;
    height?: number;
}

function LazyImage({ BaseLink, LoadImg, style = "", width, height }: LazyImageProps) {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [show, setShow] = useState<boolean>(false);

    // 圖片延遲載入
    function ImageLoad() {
        const img = imageRef.current;
        if (img && img.complete) {
            setTimeout(() => {
                setShow(true);
            }, 500);
        } else {
            setShow(false);
        }
    }

    return (
        <div>
            <img
                src={LoadImg}
                alt="icon"
                width={width}
                height={height}
                className={`${style} ${show ? "hidden" : ""}`}
            />
            <img
                src={BaseLink}
                ref={imageRef}
                onLoad={ImageLoad}
                alt="icon"
                width={width}
                height={height}
                className={`${style} ${!show ? "hidden" : ""}`}
            />
        </div>
    );
}

export default LazyImage;
