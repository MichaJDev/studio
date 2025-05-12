
// src/app/watch/[videoId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useVideoContext } from '@/contexts/VideoContext';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types';
import { ChevronLeft } from 'lucide-react'; // Changed from ArrowLeft
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; 

interface WatchPageProps {
  params: { videoId: string };
}

export default function WatchPage({ params }: WatchPageProps) {
  const { getVideoById } = useVideoContext();
  const [video, setVideo] = useState<Video | null | undefined>(undefined); 

  useEffect(() => {
    const foundVideo = getVideoById(params.videoId);
    const timer = setTimeout(() => {
       setVideo(foundVideo || null); 
    }, 100); 
    
    return () => clearTimeout(timer); 
  }, [params.videoId, getVideoById]);

  if (video === undefined) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="mt-4 text-lg text-muted-foreground">Loading video...</p>
      </div>
    );
  }

  if (video === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground">
        <div className="text-center p-4">
          <h1 className="text-3xl font-bold text-destructive mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-6">The video you are looking for does not exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" /> Go Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center group/watchpage">
       <Button
          variant="ghost"
          size="icon"
          asChild
          className="absolute top-4 left-4 z-[60] text-white bg-black/30 hover:bg-black/50 hover:text-white rounded-full opacity-0 group-hover/watchpage:opacity-100 transition-opacity duration-300"
          aria-label="Go back"
        >
          <Link href="/">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>

       <div className="w-full h-full">
           <VideoPlayer
             video={video} // Pass the full video object
             autoplay={true}
           />
       </div>
    </div>
  );
}

