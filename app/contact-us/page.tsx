"use client";

import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function ContactUs() {
    return (
        <div className='px-10 p-10 md:px-24 lg:px-48 min-h-screen'>
            {/* Header Section */}
            <div className='text-center mb-12 mt-8'>
                <h1 className='font-bold text-4xl md:text-5xl mb-4'>
                    Get in <span className='gradient-text'>Touch</span>
                </h1>
                <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                    Have a question or need help? We'd love to hear from you. Reach out through any of the channels below.
                </p>
            </div>

            {/* Contact Information - Centered */}
            <div className='max-w-3xl mx-auto'>
                <div className='space-y-6'>
                    <div>
                        <h2 className='font-bold text-2xl mb-6 text-center'>Contact Information</h2>
                        <p className='text-muted-foreground mb-8 text-center'>
                            Feel free to reach out to us through any of the following channels. We're here to help make your travel planning experience seamless.
                        </p>
                    </div>

                    <div className='space-y-6'>
                        {/* Email */}
                        <div className='flex gap-4 p-4 rounded-xl glass-card cursor-pointer hover:scale-[1.02] transition-transform'>
                            <div className='bg-primary/10 p-3 rounded-lg'>
                                <Mail className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg mb-1'>Email</h3>
                                <p className='text-muted-foreground'>khageshptl007@gmail.com</p>
                                <p className='text-muted-foreground text-sm'>We'll respond within 24 hours</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className='flex gap-4 p-4 rounded-xl glass-card cursor-pointer hover:scale-[1.02] transition-transform'>
                            <div className='bg-primary/10 p-3 rounded-lg'>
                                <Phone className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg mb-1'>Phone</h3>
                                <p className='text-muted-foreground'>+91 6355-923-172</p>
                                <p className='text-muted-foreground text-sm'>Mon-Fri, 9am-6pm IST</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className='flex gap-4 p-4 rounded-xl glass-card cursor-pointer hover:scale-[1.02] transition-transform'>
                            <div className='bg-primary/10 p-3 rounded-lg'>
                                <MapPin className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg mb-1'>Office</h3>
                                <p className='text-muted-foreground'>Wander land</p>
                                <p className='text-muted-foreground'>Bangalore, Karnataka 560049</p>
                            </div>
                        </div>
                    </div>

                    {/* Social/Additional Info */}
                    <div className='mt-8 p-6 rounded-2xl glass-container'>
                        <div className='flex items-center gap-3 mb-2'>
                            <MessageSquare className='h-5 w-5 text-primary' />
                            <h3 className='font-semibold'>Quick Response</h3>
                        </div>
                        <p className='text-muted-foreground text-sm'>
                            For urgent matters, please use the phone number above. For general inquiries, email is the fastest way to reach us.
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Section */}
            <div className='mt-16 text-center'>
                <div className='inline-block p-6 rounded-2xl glass-card'>
                    <h3 className='font-semibold text-lg mb-2'>Need Help Planning Your Trip?</h3>
                    <p className='text-muted-foreground text-sm mb-4'>
                        Our AI-powered trip planner is ready to help you create the perfect itinerary.
                    </p>
                    <Link href='/create-new-trip'>
                        <Button className='glass-button text-primary-foreground'>Start Planning</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;

