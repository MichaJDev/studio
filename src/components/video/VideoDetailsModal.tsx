// src/components/video/VideoDetailsModal.tsx
"use client";

import type { Video } from '@/types';
import { useVideoContext } from '@/contexts/VideoContext';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle, // Import DialogTitle
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, X, Tv, Film, CalendarDays, Tag, Tv2, Clapperboard } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../ui/badge';

interface VideoDetailsModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoDetailsModal({ video, isOpen, onClose }: VideoDetailsModalProps) {
  const { getEpisodesForShowAndSeason, getSeasonsForShow } = useVideoContext();
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);

  const isShow = video?.type === 'show';

  const seasons = useMemo(() => {
    if (isShow && video?.showName) {
      return getSeasonsForShow(video.showName);
    }
    return [];
  }, [video, isShow, getSeasonsForShow]);

  useEffect(() => {
    if (isShow && seasons.length > 0) {
      // Default to the first season if not already set or if video changes
      if (video?.season !== undefined) {
          setSelectedSeason(video.season);
      } else {
          setSelectedSeason(seasons[0]);
      }
    } else if (!isShow) {
      setSelectedSeason(undefined); // Reset for movies
    }
  }, [video, isShow, seasons]);


  const episodesForSelectedSeason = useMemo(() => {
    if (isShow && video?.showName && selectedSeason !== undefined) {
      return getEpisodesForShowAndSeason(video.showName, selectedSeason);
    }
    return [];
  }, [video, isShow, selectedSeason, getEpisodesForShowAndSeason]);

  if (!video) {
    return null;
  }

  const posterUrl = video.thumbnailUrl.includes('picsum.photos')
    ? video.thumbnailUrl.replace(/(\d+)\/(\d+)/, '1280/720') // Higher res for modal background
    : video.thumbnailUrl;

  const modalTitle = isShow ? video.showName : video.title;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-none w-screen h-screen p-0 overflow-hidden bg-card text-card-foreground flex flex-col">
        {/* Add a visually hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">{modalTitle}</DialogTitle>
        <div className="relative w-full h-full">
          {/* Background Poster */}
          <Image
            src={posterUrl}
            alt={`Poster for ${video.title}`}
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            data-ai-hint={video.dataAiHint || (isShow ? "tv show backdrop" : "movie backdrop")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />

          {/* Close Button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-foreground bg-black/30 hover:bg-black/50 hover:text-white rounded-full"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>

          {/* Content Area */}
          <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-stretch p-6 pt-16 md:p-12 lg:p-16 gap-6 md:gap-8 overflow-y-auto">
            {/* Left Panel: Poster and Basic Info (or Main info for movies) */}
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col items-center md:items-start">
              <div className="relative w-48 h-72 md:w-full md:h-auto md:aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-6">
                <Image
                  src={video.thumbnailUrl} // Card thumbnail
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={video.dataAiHint || (isShow ? "tv show poster" : "movie poster")}
                />
              </div>
              {!isShow && ( // Movie Play Button
                 <Button asChild size="lg" className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Link href={`/watch/${video.id}`} onClick={onClose}>
                      <PlayCircle className="mr-2 h-6 w-6" />
                      Play Movie
                    </Link>
                  </Button>
              )}
            </div>

            {/* Right Panel: Details, (Season/Episode for Shows) */}
            <ScrollArea className="md:w-2/3 lg:w-3/4 flex-grow text-foreground">
              <div className="max-w-3xl mx-auto md:mx-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-lg">
                  {modalTitle} {/* Use the determined title */}
                </h1>
                {isShow && video.title !== video.showName && (
                    <h2 className="text-xl sm:text-2xl text-primary mb-4">
                        S{String(video.season).padStart(2, '0')}E{String(video.episode).padStart(2, '0')}: {video.episodeTitle || video.title}
                    </h2>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
                  {video.year && <Badge variant="outline"><CalendarDays className="mr-1.5 h-3 w-3" /> {video.year}</Badge>}
                  {video.quality && <Badge variant="outline"><Tag className="mr-1.5 h-3 w-3" /> {video.quality}</Badge>}
                  {video.duration && <Badge variant="outline">{video.duration}</Badge>}
                   <Badge variant="outline">
                     {isShow ? <Tv2 className="mr-1.5 h-3 w-3" /> : <Clapperboard className="mr-1.5 h-3 w-3" />}
                     {isShow ? 'TV Show' : 'Movie'}
                   </Badge>
                </div>

                <p className="text-base lg:text-lg mb-6 text-foreground/80 leading-relaxed">
                  {video.description || 'No description available.'}
                </p>

                {isShow && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">Season</h3>
                      {seasons.length > 0 && selectedSeason !== undefined ? (
                        <Select
                          value={String(selectedSeason)}
                          onValueChange={(value) => setSelectedSeason(Number(value))}
                        >
                          <SelectTrigger className="w-full md:w-[200px] bg-background/70 border-border text-foreground">
                            <SelectValue placeholder="Select a season" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground">
                            {seasons.map((seasonNum) => (
                              <SelectItem key={seasonNum} value={String(seasonNum)}>
                                Season {seasonNum}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-muted-foreground">No seasons available.</p>
                      )}
                    </div>

                    {episodesForSelectedSeason.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Episodes</h3>
                        <div className="space-y-3 max-h-[calc(100vh-350px)] md:max-h-none"> {/* Scroll within episodes if too many */}
                          {episodesForSelectedSeason.map((ep) => (
                            <Link href={`/watch/${ep.id}`} key={ep.id} onClick={onClose}>
                              <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors cursor-pointer border border-border">
                                <div className="relative w-28 h-16 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={ep.thumbnailUrl}
                                    alt={`Thumbnail for ${ep.title}`}
                                    fill
                                    sizes="100px"
                                    className="object-cover"
                                    data-ai-hint={ep.dataAiHint || "tv episode"}
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-semibold text-foreground group-hover:text-primary">
                                    E{String(ep.episode).padStart(2, '0')}: {ep.episodeTitle || ep.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {ep.description || 'No episode description.'}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-primary opacity-70 group-hover:opacity-100">
                                  <PlayCircle className="h-6 w-6" />
                                </Button>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
