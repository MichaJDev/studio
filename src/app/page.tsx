// src/app/page.tsx
"use client";

import { useMemo, useState } from 'react';
import VideoCard from '@/components/video/VideoCard';
import FeaturedVideoCarouselItem from '@/components/video/FeaturedVideoCarouselItem';
import VideoDetailsModal from '@/components/video/VideoDetailsModal'; // Import the modal
import type { Video } from '@/types'; // Import Video type
import { useVideoContext } from '@/contexts/VideoContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Film, Tv, Search } from 'lucide-react'; // Changed Upload to Search or similar
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils'; // Import cn for conditional classes

export default function HomePage() {
  const { videos, getRecentVideos } = useVideoContext();
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null);

  const recentVideos = getRecentVideos(5);

  const movies = videos.filter(v => v.type === 'movie' || (v.type === 'upload' && !v.season));

  // Group shows by showName and pick one representative video (e.g., S01E01 or first encountered)
  const uniqueShows = useMemo(() => {
    const showsMap = new Map<string, Video>();
    videos
      .filter(v => v.type === 'show' && v.showName)
      .sort((a, b) => {
        // Prioritize lower seasons/episodes as the representative
        const seasonDiff = (a.season ?? 999) - (b.season ?? 999);
        if (seasonDiff !== 0) return seasonDiff;
        return (a.episode ?? 999) - (b.episode ?? 999);
      })
      .forEach(video => {
        if (video.showName && !showsMap.has(video.showName)) {
          showsMap.set(video.showName, video);
        }
      });
    return Array.from(showsMap.values());
  }, [videos]);


  const handleOpenModal = (video: Video) => {
    setSelectedVideoForModal(video);
  };

  const handleCloseModal = () => {
    setSelectedVideoForModal(null);
  };

  const hasContent = recentVideos.length > 0 || movies.length > 0 || uniqueShows.length > 0;

  return (
    // Main container for page content spacing
    <div className="space-y-12">

      {recentVideos.length > 0 && (
        // Carousel section - remove negative margins
        <section className="relative">
          <h2 className="text-2xl font-bold tracking-tight mb-4 px-4 sm:px-6 lg:px-8 text-foreground sr-only">
            Recently Added
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: recentVideos.length > 1,
            }}
            className="w-full" // Carousel now takes full width by default
          >
            <CarouselContent className="-ml-0"> {/* Ensure no negative margin */}
              {recentVideos.map((video) => (
                <CarouselItem key={video.id} className="pl-0 basis-full"> {/* Ensure no padding */}
                  <FeaturedVideoCarouselItem video={video} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {recentVideos.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12" />
                    <CarouselNext className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12" />
                </>
            )}
          </Carousel>
        </section>
      )}

      {/* Container for the rest of the content (Movies, Shows, Empty State) */}
      <div className={cn(
        "container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
        recentVideos.length > 0 ? "pt-12" : "pt-0" // Add padding top only if carousel is present
      )}>
        {movies.length > 0 && (
            <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center">
                <Film className="mr-3 h-6 w-6 text-primary" /> Movies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {movies.map((video) => (
                <VideoCard key={video.id} video={video} onCardClick={handleOpenModal} />
                ))}
            </div>
            </section>
        )}

        {uniqueShows.length > 0 && (
            <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center">
                <Tv className="mr-3 h-6 w-6 text-primary" /> TV Shows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {/* Map over uniqueShows instead of all show episodes */}
                {uniqueShows.map((show) => (
                <VideoCard key={show.showName} video={show} onCardClick={handleOpenModal} />
                ))}
            </div>
            </section>
        )}

        {!hasContent && ( // Check if there's *any* content to display
            <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg mt-10">
                <Search className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-3">Your Library is Empty</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                It looks like there are no videos here yet.
                Please ensure the media scanner has run or check your media directories.
                </p>
                {/* Removed Upload button */}
            </div>
            )}
      </div>


      {selectedVideoForModal && (
        <VideoDetailsModal
          video={selectedVideoForModal}
          isOpen={!!selectedVideoForModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
