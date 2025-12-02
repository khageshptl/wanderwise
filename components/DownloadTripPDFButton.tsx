"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import axios from 'axios';

interface DownloadTripPDFButtonProps {
    tripData: any;
}

const DownloadTripPDFButton: React.FC<DownloadTripPDFButtonProps> = ({ tripData }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/generate-trip-pdf', tripData, {
                responseType: 'blob', // Important for handling binary data
            });

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a link element and trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Trip-to-${tripData?.trip_plan?.destination || 'Plan'}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="outline"
            className="ml-auto md:ml-0"
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
        </Button>
    );
};

export default DownloadTripPDFButton;
