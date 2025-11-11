"use client";
import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';


const menuOptions = [
    {
        name: 'Home',
        path: '/'
    },
    {
        name: 'Pricing',
        path: '/pricing'
    },
    {
        name: 'Contact Us',
        path: '/contact-us'
    },

]

function Header() {

    const { user } = useUser();

    return (
        <div className='flex justify-between items-center p-4'>
            {/* logo */}
            <div className='flex gap-2 items-center'>
                <Image src="/logo.svg" alt="WanderWise Logo" width={40} height={40} />
                <h2 className="text-2xl font-bold">WanderWise</h2>
            </div>

            {/* menu options */}
            <div className='flex gap-8 items-center'>
                {menuOptions.map((menu, index) => (
                    <Link href={menu.path} key={index}>
                        <h2 className='text-lg hover:scale-105 transition-all hover:text-primary'>{menu.name}</h2>
                    </Link>
                ))}
            </div>
            {/* get started button */}
            {!user ? <SignInButton mode="modal">
                <Button>Get started</Button>
            </SignInButton> :
                <Link href={'/create-new-trip'}>
                    <Button>Create New Trip</Button>
                </Link>
            }
        </div>
    )
}

export default Header