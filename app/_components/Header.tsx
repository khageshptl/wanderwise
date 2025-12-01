"use client";
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const menuOptions = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact Us', path: '/contact-us' },
];

export default function Header() {
    const { user } = useUser();
    const path = usePathname();
    const { theme, setTheme } = useTheme();

    // ensure client-only render for Clerk components to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <header className='fixed top-0 left-0 right-0 z-50 px-6 py-3'>
            <nav className='liquid-glass-nav max-w-7xl mx-auto flex justify-between items-center px-6 py-3 rounded-2xl'>
                <Link href="/">
                    <div className='flex gap-2 items-center group'>
                        <div className='relative'>
                            <Image
                                src="/logo.svg"
                                alt="WanderWise Logo"
                                width={40}
                                height={40}
                                className='transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6'
                            />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            WanderWise
                        </h2>
                    </div>
                </Link>

                <div className='flex gap-8 items-center'>
                    {menuOptions.map((menu, index) => (
                        <Link href={menu.path} key={menu.path + index}>
                            <h2 className={`text-base font-medium transition-all duration-300 hover:scale-105 relative group ${path === menu.path ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                                }`}>
                                {menu.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ${path === menu.path ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}></span>
                            </h2>
                        </Link>
                    ))}
                </div>

                <div className='flex gap-3 items-center'>
                    {/* Dark Mode Toggle */}
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 rounded-xl backdrop-blur-sm"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-180" />
                            ) : (
                                <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
                            )}
                        </Button>
                    )}

                    {/* show Clerk buttons only after mount to prevent SSR/CSR mismatch */}
                    {mounted ? (
                        !user ? (
                            <SignInButton mode="modal">
                                <Button className="glass-button text-primary-foreground">Get started</Button>
                            </SignInButton>
                        ) : path === '/create-new-trip' ? (
                            <Link href={'/my-trips'}>
                                <Button className="glass-button text-primary-foreground">My Trips</Button>
                            </Link>
                        ) : (
                            <Link href={'/create-new-trip'}>
                                <Button className="glass-button text-primary-foreground">Create New Trip</Button>
                            </Link>
                        )
                    ) : (
                        // optional placeholder to keep layout stable until mounted
                        <div style={{ width: 120 }} />
                    )}

                    {mounted && <UserButton />}
                </div>
            </nav>
        </header>
    );
}