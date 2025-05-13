// src/app/page.tsx
"use client";

import { useMemo, useState } from 'react';
import { useVideoContext } from '@/contexts/VideoContext';
import { useAuthContext } from '@/contexts/AuthContext'; // Import Auth context
import type { Video, WatchProgressItem } from '@/types'; // Import WatchProgressItem
import Link from 'next/link';
import { Film, Tv, Search, Loader2, LogIn, UserPlus, Diamond, Send, History } from 'lucide-react'; // Import Send & History
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/video/VideoCard';
import FeaturedVideoCarouselItem from '@/components/video/FeaturedVideoCarouselItem';
import VideoDetailsModal from '@/components/video/VideoDetailsModal';
import InviteRequestModal from '@/components/modals/InviteRequestModal'; // Import InviteRequestModal
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

// Landing page component
function LandingPage() {
  const [isInviteRequestModalOpen, setIsInviteRequestModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
        <Diamond className="h-20 w-20 text-primary mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Welcome to PrismmTv</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          Your personal media streaming server. Log in or register to access your library.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" /> Log In
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link href="/register">
              <UserPlus className="mr-2 h-5 w-5" /> Register
            </Link>
          </Button>
        </div>
        <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
                Don't have an invite code for registration?
            </p>
            <Button variant="link" onClick={() => setIsInviteRequestModalOpen(true)} className="text-primary font-semibold text-base">
                <Send className="mr-2 h-4 w-4" /> Request an Invite
            </Button>
        </div>
      </div>
      <InviteRequestModal isOpen={isInviteRequestModalOpen} onClose={() => setIsInviteRequestModalOpen(false)} />
    </>
  );
}

// Dashboard component (existing content + Continue Watching)
function Dashboard() {
  const { videos, getRecentVideos } = useVideoContext();
  const { currentUser } = useAuthContext(); // Get current user for progress
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null);

  const recentVideos = getRecentVideos(5);

  const continueWatchingVideos = useMemo(() => {
    if (!currentUser?.watchProgress) return [];

    const progressMap = currentUser.watchProgress;
    const videoMap = new Map(videos.map(v => [v.id, v]));
    const partiallyWatched: (Video & { progressData: WatchProgressItem })[] = [];

    const WATCH_THRESHOLD_SECONDS = 10; // Min seconds watched to show
    const FINISHED_BUFFER_SECONDS = 30; // Seconds from end to consider finished

    Object.entries(progressMap).forEach(([videoId, progressData]) => {
      const video = videoMap.get(videoId);
      if (video?.durationInSeconds &&
          progressData.progress > WATCH_THRESHOLD_SECONDS &&
          progressData.progress < video.durationInSeconds - FINISHED_BUFFER_SECONDS) {
        partiallyWatched.push({ ...video, progressData });
      }
    });

    // Sort by most recently watched
    partiallyWatched.sort((a, b) => new Date(b.progressData.lastWatched).getTime() - new Date(a.progressData.lastWatched).getTime());

    return partiallyWatched;
  }, [currentUser, videos]);


  const movies = videos.filter(v => v.type === 'movie' || (v.type === 'upload' && !v.season));
  const uniqueShows = useMemo(() => {
    const showsMap = new Map<string, Video>();
    videos
      .filter(v => v.type === 'show' && v.showName)
      .sort((a, b) => {
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

  const handleOpenModal = (video: Video) => setSelectedVideoForModal(video);
  const handleCloseModal = () => setSelectedVideoForModal(null);
  const hasContent = recentVideos.length > 0 || movies.length > 0 || uniqueShows.length > 0 || continueWatchingVideos.length > 0;

  return (
    <div className="space-y-12">
      {recentVideos.length > 0 && (
        <section className="relative">
          <h2 className="text-2xl font-bold tracking-tight mb-4 px-4 sm:px-6 lg:px-8 text-foreground sr-only">
            Recently Added
          </h2>
          <Carousel
            opts={{ align: "start", loop: recentVideos.length > 1 }}
            className="w-full"
          >
            <CarouselContent className="-ml-0">
              {recentVideos.map((video) => (
                <CarouselItem key={video.id} className="pl-0 basis-full">
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

      <div className={cn(
        "container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
        recentVideos.length > 0 ? "pt-12" : "pt-0",
        "space-y-12" // Add space between sections
      )}>

        {/* --- Continue Watching Section --- */}
         {continueWatchingVideos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center">
              <History className="mr-3 h-6 w-6 text-primary" /> Continue Watching
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {continueWatchingVideos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    onCardClick={handleOpenModal}
                    progress={video.progressData.progress}
                    duration={video.durationInSeconds}
                 />
              ))}
            </div>
          </section>
         )}
        {/* --- End Continue Watching Section --- */}

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
              {uniqueShows.map((show) => (
                <VideoCard key={show.showName} video={show} onCardClick={handleOpenModal} />
              ))}
            </div>
          </section>
        )}

        {!hasContent && (
          <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg mt-10">
            <Search className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">Your Library is Empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              It looks like there are no videos here yet.
              Please ensure the media scanner has run or check your media directories.
            </p>
             {/* Add button for admins to scan media if library is empty */}
            {currentUser?.role === 'admin' && (
              <p className="text-sm text-muted-foreground">
                You can try rescanning media files from the Admin Panel (accessible via user menu).
              </p>
            )}
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

export default function HomePage() {
  const { currentUser, isLoading } = useAuthContext();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }

  // Render Landing Page or Dashboard
  return currentUser ? <Dashboard /> : <LandingPage />;
}
