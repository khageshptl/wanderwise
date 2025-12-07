"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface CarouselItem {
    title: string;
    src: string;
    category: string;
    content?: React.ReactNode;
}

interface CoverFlowCarouselProps {
    items: CarouselItem[];
    autoPlayDelay?: number;
    className?: string;
}

export const CoverFlowCarousel = ({
    items,
    autoPlayDelay = 3000,
    className,
}: CoverFlowCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => prev + 1);
        }, autoPlayDelay);

        return () => clearInterval(timer);
    }, [autoPlayDelay]);

    const getCardStyle = (index: number) => {
        const totalItems = items.length;

        return {};
    };

    const VISIBLE_ITEMS = 5;
    const HALF_VISIBLE = Math.floor(VISIBLE_ITEMS / 2);

    const renderItems = () => {
        const renderedItems = [];

        for (let i = -HALF_VISIBLE; i <= HALF_VISIBLE; i++) {
            const itemIndex = currentIndex + i;

            const dataIndex = ((itemIndex % items.length) + items.length) % items.length;
            const item = items[dataIndex];

            const offset = i;
            const absOffset = Math.abs(offset);


            const isActive = offset === 0;
            const zIndex = 10 - absOffset;
            const scale = 1 - absOffset * 0.15;
            const x = offset * 50 + (offset > 0 ? 100 : offset < 0 ? -100 : 0) * absOffset;
            const translateX = `${offset * 60}%`;

            const rotateY = offset * -25;

            renderedItems.push(
                <motion.div
                    key={`item-${itemIndex}`}
                    className={cn(
                        "absolute w-[225px] md:w-[325px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 backdrop-blur-sm transition-all duration-500 ease-in-out cursor-pointer",
                        "-ml-[100px] -mt-[133px] md:-ml-[150px] md:-mt-[200px]", // Center the element
                        isActive ? "brightness-110 ring-2 ring-white/20" : "brightness-50 hover:brightness-75"
                    )}
                    initial={false}
                    animate={{
                        x: offset * 220,
                        scale: scale,
                        zIndex: zIndex,
                        rotateY: rotateY,
                        opacity: 1 - absOffset * 0.2,
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                    }}
                    style={{
                        left: "50%",
                        top: "50%",
                        transformStyle: "preserve-3d",
                    }}
                    onClick={() => setCurrentIndex(itemIndex)}
                >
                    <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                        <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">{item.category}</p>
                        <h3 className="text-white text-xl font-bold leading-tight">{item.title}</h3>
                    </div>
                </motion.div>
            );
        }
        return renderedItems;
    };

    return (
        <div className={cn("relative w-full h-[500px] flex items-center justify-center overflow-hidden perspective-1000", className)}>
            <div className="relative w-full h-full flex items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
                {renderItems()}
            </div>

            {/* Navigation Dots */}
            {/* <div className="absolute bottom-7 left-2 right-0 flex justify-center gap-2 z-20">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(currentIndex + (idx - (currentIndex % items.length + items.length) % items.length))}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            (currentIndex % items.length + items.length) % items.length === idx
                                ? "bg-white w-6"
                                : "bg-white/30 hover:bg-white/50"
                        )}
                    />
                ))}
            </div> */}
        </div>
    );
};
