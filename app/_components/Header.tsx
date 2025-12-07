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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className='fixed top-0 left-0 right-0 z-50 px-4 py-2 md:px-6 md:py-3'>
            {/* Responsive Navigation */}
            <nav className='liquid-glass-nav max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-6 rounded-2xl relative'>
                <Link href="/">
                    <div className='flex gap-2 items-center group'>
                        <div className='relative'>
                            <Image
                                src="/logo.svg"
                                alt="WanderWise Logo"
                                width={32}
                                height={32}
                                className='transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 md:w-10 md:h-10'
                            />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            WanderWise
                        </h2>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className='hidden md:flex gap-8 items-center'>
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

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex gap-3 items-center">
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
                            <div style={{ width: 120 }} />
                        )}
                        {mounted && <UserButton />}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        {mounted && user && <div className="mr-3"><UserButton /></div>}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="hover:bg-white/10 dark:hover:bg-white/5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 mx-4 rounded-2xl glass-card ham-dropdown flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 fade-in duration-200">
                        {menuOptions.map((menu, index) => (
                            <Link
                                href={menu.path}
                                key={menu.path + index}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <h2 className={`text-lg font-medium py-2 ${path === menu.path ? 'text-primary' : 'text-foreground/80'}`}>
                                    {menu.name}
                                </h2>
                            </Link>
                        ))}
                        <div className="h-px bg-border/50 my-1"></div>
                        {mounted && !user && (
                            <SignInButton mode="modal">
                                <Button className="glass-button w-full text-primary-foreground">Get started</Button>
                            </SignInButton>
                        )}
                        {mounted && user && (
                            <>
                                <Link href={'/create-new-trip'} onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="glass-button w-full text-primary-foreground mb-2">Create New Trip</Button>
                                </Link>
                                <Link href={'/my-trips'} onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">My Trips</Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}