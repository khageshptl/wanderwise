"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Simulate form submission
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='px-10 p-10 md:px-24 lg:px-48 min-h-screen'>
            {/* Header Section */}
            <div className='text-center mb-12 mt-8'>
                <h1 className='font-bold text-4xl md:text-5xl mb-4'>
                    Get in <span className='gradient-text'>Touch</span>
                </h1>
                <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                    Have a question or need help? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
            </div>

            <div className='grid md:grid-cols-2 gap-8 lg:gap-12'>
                {/* Contact Information */}
                <div className='space-y-6'>
                    <div>
                        <h2 className='font-bold text-2xl mb-6'>Contact Information</h2>
                        <p className='text-muted-foreground mb-8'>
                            Feel free to reach out to us through any of the following channels. We're here to help make your travel planning experience seamless.
                        </p>
                    </div>

                    <div className='space-y-6'>
                        {/* Email */}
                        <div className='flex gap-4 p-4 rounded-xl glass-card cursor-pointer'>
                            <div className='bg-primary/10 p-3 rounded-lg'>
                                <Mail className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg mb-1'>Email</h3>
                                <p className='text-muted-foreground'>support@wanderwise.com</p>
                                <p className='text-muted-foreground text-sm'>We'll respond within 24 hours</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className='flex gap-4 p-4 rounded-xl glass-card cursor-pointer'>
                            <div className='bg-primary/10 p-3 rounded-lg'>
                                <Phone className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg mb-1'>Phone</h3>
                                <p className='text-muted-foreground'>+1 (555) 123-4567</p>
                                <p className='text-muted-foreground text-sm'>Mon-Fri, 9am-6pm EST</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className='flex gap-4 p-4 rounded-xl glass-card cursor-pointer'>
                            <div className='bg-primary/10 p-3 rounded-lg'>
                                <MapPin className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg mb-1'>Office</h3>
                                <p className='text-muted-foreground'>123 Travel Street</p>
                                <p className='text-muted-foreground'>New York, NY 10001</p>
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
                            For urgent matters, please use the phone number above. For general inquiries, the contact form is the fastest way to reach us.
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className='glass-container rounded-2xl p-6 md:p-8 shadow-lg'>
                    <h2 className='font-bold text-2xl mb-6'>Send us a Message</h2>

                    <form onSubmit={handleSubmit} className='space-y-5'>
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className='block text-sm font-medium mb-2'>
                                Name <span className='text-destructive'>*</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className='w-full glass-input'
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className='block text-sm font-medium mb-2'>
                                Email <span className='text-destructive'>*</span>
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className='w-full glass-input'
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className='block text-sm font-medium mb-2'>
                                Subject <span className='text-destructive'>*</span>
                            </label>
                            <Input
                                id="subject"
                                name="subject"
                                type="text"
                                placeholder="What's this about?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className='w-full glass-input'
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className='block text-sm font-medium mb-2'>
                                Message <span className='text-destructive'>*</span>
                            </label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Tell us more about your inquiry..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                className='w-full resize-none glass-input'
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className='w-full mt-2 glass-button text-primary-foreground'
                        >
                            {isSubmitting ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send className='h-4 w-4 mr-2' />
                                    Send Message
                                </>
                            )}
                        </Button>

                        {/* Status Messages */}
                        {submitStatus === 'success' && (
                            <div className='p-4 rounded-lg glass-container border border-green-500/30'>
                                <p className='text-sm font-medium text-green-600 dark:text-green-400'>Message sent successfully! We'll get back to you soon.</p>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className='p-4 rounded-lg glass-container border border-destructive/30'>
                                <p className='text-sm font-medium text-destructive'>Something went wrong. Please try again later.</p>
                            </div>
                        )}
                    </form>
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

