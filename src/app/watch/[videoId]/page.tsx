
// src/app/watch/[videoId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useVideoContext } from '@/contexts/VideoContext';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Import Loader

interface WatchPageProps {
  params: { videoId: string };
}

export default function WatchPage({ params }: WatchPageProps) {
  const { getVideoById } = useVideoContext();
  const [video, setVideo] = useState<Video | null | undefined>(undefined); // Initial state undefined for loading

  useEffect(() => {
    const foundVideo = getVideoById(params.videoId);
    // Use timeout to prevent flash of "Not Found" if video loads quickly
    const timer = setTimeout(() => {
       setVideo(foundVideo || null); // Set to null if not found after delay
    }, 100); // Small delay
    
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [params.videoId, getVideoById]);

  // Loading State
  if (video === undefined) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="mt-4 text-lg text-muted-foreground">Loading video...</p>
      </div>
    );
  }

  // Not Found State
  if (video === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground">
        <div className="text-center p-4">
          <h1 className="text-3xl font-bold text-destructive mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-6">The video you are looking for does not exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Video Found - Full Screen Player
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
       {/* Back Button - Positioned top-left */}
       <Button
          variant="ghost"
          size="icon"
          asChild
          className="absolute top-4 left-4 z-[60] text-white bg-black/30 hover:bg-black/50 hover:text-white rounded-full"
          aria-label="Go back"
        >
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>

       {/* Video Player taking up available space */}
       <div className="w-full h-full">
           <VideoPlayer
             src={video.videoSrc}
             title={video.title}
             subtitleSrc={video.subtitleSrc} // Pass subtitle source
           />
       </div>
    </div>
  );
}
