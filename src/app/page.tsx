// src/app/page.tsx
"use client";

import VideoCard from '@/components/video/VideoCard';
import { useVideoContext } from '@/contexts/VideoContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload, Film, Tv } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Import Carousel

export default function HomePage() {
  const { videos, getRecentVideos } = useVideoContext();
  const recentVideos = getRecentVideos(5); // Get the 5 most recent videos

  const movies = videos.filter(v => v.type === 'movie' || (v.type === 'upload' && !v.season)); // Treat uploads without season as movies for now
  const shows = videos.filter(v => v.type === 'show' || (v.type === 'upload' && v.season)); // Treat uploads with season as shows

  return (
    <div className="space-y-12"> {/* Increased spacing */}

      {/* Recently Added Carousel */}
      {recentVideos.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">
            Recently Added
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: recentVideos.length > 4, // Loop only if enough items
            }}
            className="w-full" // Ensure carousel itself takes width
          >
            <CarouselContent className="-ml-2 md:-ml-4"> {/* Adjust margin for spacing */}
              {recentVideos.map((video) => (
                <CarouselItem key={video.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"> {/* Responsive item size */}
                   <div className="p-1">
                      <VideoCard video={video} />
                   </div>
                </CarouselItem>
              ))}
            </CarouselContent>
             {/* Optional: Add Prev/Next only if enough items */}
            {recentVideos.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                    <CarouselNext className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                </>
            )}
          </Carousel>
        </section>
      )}

      {/* Movies Section */}
      {movies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center">
             <Film className="mr-3 h-6 w-6 text-primary" /> Movies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {movies.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

       {/* TV Shows Section */}
       {shows.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center">
            <Tv className="mr-3 h-6 w-6 text-primary" /> TV Shows
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
             {/* TODO: Group shows by showName later if desired */}
            {shows.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
       )}

      {/* Empty State */}
      {videos.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg mt-10">
            <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">Your Library is Empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              It looks like there are no videos here yet. Upload your first video or ensure the media scanner is configured correctly.
            </p>
            <Button asChild size="lg">
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" /> Upload Video
              </Link>
            </Button>
          </div>
        )}
    </div>
  );
}
