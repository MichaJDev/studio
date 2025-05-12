// src/app/page.tsx
"use client";

import VideoCard from '@/components/video/VideoCard';
import { useVideoContext } from '@/contexts/VideoContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload } from 'lucide-react';

export default function HomePage() {
  const { videos } = useVideoContext();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-6 text-foreground">
          Browse Videos
        </h1>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Videos Yet</h2>
            <p className="text-muted-foreground mb-6">
              Your video library is empty. Upload your first video to get started!
            </p>
            <Button asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" /> Upload Video
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
