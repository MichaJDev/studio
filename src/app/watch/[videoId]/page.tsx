
// src/app/watch/[videoId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useVideoContext } from '@/contexts/VideoContext';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WatchPageProps {
  params: { videoId: string };
}

export default function WatchPage({ params }: WatchPageProps) {
  const { getVideoById } = useVideoContext();
  const [video, setVideo] = useState<Video | null | undefined>(undefined);

  useEffect(() => {
    const foundVideo = getVideoById(params.videoId);
    setVideo(foundVideo);
  }, [params.videoId, getVideoById]);

  if (video === undefined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div role="status">
            <svg aria-hidden="true" className="inline w-10 h-10 text-muted-foreground animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
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

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Button 
        variant="ghost" 
        size="icon" 
        asChild 
        className="absolute top-4 left-4 z-[60] text-white bg-black/30 hover:bg-black/50 hover:text-white"
        aria-label="Go back"
      >
        <Link href="/">
          <ArrowLeft className="h-6 w-6" />
        </Link>
      </Button>
      <VideoPlayer src={video.videoSrc} title={video.title} />
      {/* Video info could be overlaid if desired, but removed for full-screen focus */}
    </div>
  );
}
