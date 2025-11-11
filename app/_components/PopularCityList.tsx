"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function PopularCityList() {
    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div className="w-full h-full pt-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                Popular Destination to Visit
            </h2>
            <Carousel items={cards} />
        </div>
    );
}

const DummyContent = () => {
    return (
        <>
            {[...new Array(3).fill(1)].map((_, index) => {
                return (
                    <div
                        key={"dummy-content" + index}
                        className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
                    >
                        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
                            <span className="font-bold text-neutral-700 dark:text-neutral-200">
                                The first rule of Apple club is that you boast about Apple club.
                            </span>{" "}
                            Keep a journal, quickly jot down a grocery list, and take amazing
                            class notes. Want to convert those notes to text? No problem.
                            Langotiya jeetu ka mara hua yaar is ready to capture every
                            thought.
                        </p>
                        <img
                            src="https://assets.aceternity.com/macbook.png"
                            alt="Macbook mockup from Aceternity UI"
                            height="500"
                            width="500"
                            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
                        />
                    </div>
                );
            })}
        </>
    );
};

const data = [
    {
        category: "Paris, France",
        title: "Explore the City of Lights - Eiffel Tower, Louvre & more",
        src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        content: <DummyContent />,
    },
    {
        category: "New York, USA",
        title: "Experience NYC - Times Square, Central Park, Broadway",
        src: "https://images.unsplash.com/photo-1499462817897-fe42dfba9131?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        content: <DummyContent />,
    },
    {
        category: "Tokyo, Japan",
        title: "Discover Tokyo - Shibuya, Cherry Blossoms, Temples",
        src: "https://plus.unsplash.com/premium_photo-1690749740487-01bbb8e51e71?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=765",
        content: <DummyContent />,
    },
    {
        category: "Rome, Italy",
        title: "Walk through History - Colosseum, Vatican, Roman Forum",
        src: "https://images.unsplash.com/photo-1663875663933-9c7c3d3540e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=656",
        content: <DummyContent />,
    },
    {
        category: "Dubai, UAE",
        title: "Luxury and Innovation - Burj Khalifa, Desert Safari",
        src: "https://images.unsplash.com/photo-1634007626524-f47fa37810a7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fGR1YmFpfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
        content: <DummyContent />,
    },
    {
        category: "Sydney, Australia",
        title: "Harbour Vibes - Opera House, Bondi Beach & Wildlife",
        src: "https://images.unsplash.com/photo-1704788623366-8cd4d7285e60?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fHN5ZG5leXxlbnwwfDF8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
        content: <DummyContent />,
    },
    {
        category: "Cape Town, South Africa",
        title: "Adventure Awaits - Table Mountain & Coastal Beauty",
        src: "https://plus.unsplash.com/premium_photo-1697729867696-5a9b4b995e9f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q2FwZSUyMFRvd24lMkMlMjBTb3V0aCUyMEFmcmljYXxlbnwwfDF8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
        content: <DummyContent />,
    },
    {
        category: "Bali, Indonesia",
        title: "Island Paradise - Temples, Rice Terraces, and Beaches",
        src: "https://images.unsplash.com/photo-1564981447395-903d78d49a28?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmFsaSUyMGJlYWNofGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
        content: <DummyContent />,
    },
    {
        category: "London, UK",
        title: "Classic and Modern - Big Ben, London Eye, Thames",
        src: "https://images.unsplash.com/photo-1582027013518-0e9d9633a2d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9uZG9uJTIwZXllfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
        content: <DummyContent />,
    },
    {
        category: "Santorini, Greece",
        title: "White and Blue Bliss - Sunsets, Cliffs & Aegean Views",
        src: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U2FudG9yaW5pJTJDJTIwR3JlZWNlfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
        content: <DummyContent />,
    },
];
