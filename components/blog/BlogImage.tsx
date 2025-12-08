"use client";

import { useState } from "react";

export default function BlogImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // Fallback to a deterministic Unsplash image based on alt text (keyword)
            const keyword = alt.split(" ").slice(0, 2).join(" ") || "technology";
            setImgSrc(`https://source.unsplash.com/1600x900/?${encodeURIComponent(keyword)}`);
        }
    };

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
            loading="lazy"
        />
    );
}
