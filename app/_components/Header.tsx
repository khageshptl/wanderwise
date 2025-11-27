// "use client";
// import Image from 'next/image';
// import { Button } from '@/components/ui/button';
// import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';


// const menuOptions = [
//     {
//         name: 'Home',
//         path: '/'
//     },
//     {
//         name: 'Pricing',
//         path: '/pricing'
//     },
//     {
//         name: 'Contact Us',
//         path: '/contact-us'
//     },

// ]

// function Header() {

//     const { user } = useUser();
//     const path = usePathname();
//     return (
//         <div className='flex justify-between items-center p-4'>
//             {/* logo */}
//             <div className='flex gap-2 items-center'>
//                 <Image src="/logo.svg" alt="WanderWise Logo" width={40} height={40} />
//                 <h2 className="text-2xl font-bold">WanderWise</h2>
//             </div>

//             {/* menu options */}
//             <div className='flex gap-8 items-center'>
//                 {menuOptions.map((menu, index) => (
//                     <Link href={menu.path} key={index}>
//                         <h2 className='text-lg hover:scale-105 transition-all hover:text-primary'>{menu.name}</h2>
//                     </Link>
//                 ))}
//             </div>
//             {/* get started button */}
//             <div className='flex gap-5 items-center'>
//                 {!user ? <SignInButton mode="modal">
//                     <Button>Get started</Button>
//                 </SignInButton> :
//                     path == '/create-new-trip' ?
//                         <Link href={'/my-trips'}>
//                             <Button>My Trips</Button>
//                         </Link>
//                         : <Link href={'/create-new-trip'}>
//                             <Button>Create New Trip</Button>
//                         </Link>
//                 }
//                 <UserButton />
//             </div>
//         </div>
//     )
// }

// export default Header




"use client";
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

const menuOptions = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact Us', path: '/contact-us' },
];

export default function Header() {
    const { user } = useUser();
    const path = usePathname();

    // ensure client-only render for Clerk components to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className='flex justify-between items-center p-4'>
            <div className='flex gap-2 items-center'>
                <Image src="/logo.svg" alt="WanderWise Logo" width={40} height={40} />
                <h2 className="text-2xl font-bold">WanderWise</h2>
            </div>

            <div className='flex gap-8 items-center'>
                {menuOptions.map((menu, index) => (
                    <Link href={menu.path} key={menu.path + index}>
                        <h2 className='text-lg hover:scale-105 transition-all hover:text-primary'>{menu.name}</h2>
                    </Link>
                ))}
            </div>

            <div className='flex gap-5 items-center'>
                {/* show Clerk buttons only after mount to prevent SSR/CSR mismatch */}
                {mounted ? (
                    !user ? (
                        <SignInButton mode="modal">
                            <Button>Get started</Button>
                        </SignInButton>
                    ) : path === '/create-new-trip' ? (
                        <Link href={'/my-trips'}>
                            <Button>My Trips</Button>
                        </Link>
                    ) : (
                        <Link href={'/create-new-trip'}>
                            <Button>Create New Trip</Button>
                        </Link>
                    )
                ) : (
                    // optional placeholder to keep layout stable until mounted
                    <div style={{ width: 120 }} />
                )}

                {mounted && <UserButton />}
            </div>
        </div>
    );
}