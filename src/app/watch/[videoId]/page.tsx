
// src/app/watch/[videoId]/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { useVideoContext } from '@/contexts/VideoContext';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Removed the params prop from the component definition
export default function WatchPage() {
  const params = useParams<{ videoId: string }>(); // Use useParams hook
  const videoId = params?.videoId; // Extract videoId

  const { getVideoById } = useVideoContext();
  const [video, setVideo] = useState<Video | null | undefined>(undefined);

  // Memoize the video lookup based on videoId
  const fetchedVideo = useMemo(() => {
    if (!videoId) return undefined;
    return getVideoById(videoId);
  }, [videoId, getVideoById]);

  useEffect(() => {
    // Simulate loading delay or async fetch
    const timer = setTimeout(() => {
      setVideo(fetchedVideo !== undefined ? fetchedVideo : null);
    }, 100); // Short delay to simulate loading

    return () => clearTimeout(timer);
  }, [fetchedVideo]); // Depend on the memoized fetchedVideo

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
