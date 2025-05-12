// src/components/video/FeaturedVideoCarouselItem.tsx
import type { Video } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Clock, Info, Tv, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeaturedVideoCarouselItemProps {
  video: Video;
}

export default function FeaturedVideoCarouselItem({ video }: FeaturedVideoCarouselItemProps) {
  const isShow = video.type === 'show';

  // Use a larger image for carousel background if source is picsum
  const heroImageUrl = video.thumbnailUrl.includes('picsum.photos')
    ? video.thumbnailUrl.replace(/(\d+)\/(\d+)/, '1280/548') // Aspect ratio approx 16/7
    : video.thumbnailUrl;

  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden group">
      <Image
        src={heroImageUrl}
        alt={`Background for ${video.title}`}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        data-ai-hint={video.dataAiHint || (isShow ? "cinematic tv show" : "cinematic movie scene")}
        priority // Prioritize loading for the main carousel image
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
       <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent opacity-70"></div>

      <div className="absolute inset-0 flex items-end p-6 sm:p-10 lg:p-16 text-white">
        <div className="w-full md:w-1/2 lg:w-2/5 space-y-3 sm:space-y-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg line-clamp-2">
            {isShow && video.showName ? video.showName : video.title}
          </h3>

          {isShow && video.episodeTitle && (
             <p className="text-lg sm:text-xl font-semibold text-primary line-clamp-1">
                S{String(video.season).padStart(2, '0')}E{String(video.episode).padStart(2, '0')}: {video.episodeTitle}
             </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
            <Badge variant="secondary" className="bg-black/40 backdrop-blur-sm">
                {isShow ? <Tv className="h-3 w-3 mr-1.5" /> : <Film className="h-3 w-3 mr-1.5" />}
                {isShow ? 'Show' : 'Movie'}
             </Badge>
            {video.year && <Badge variant="outline" className="bg-black/40 backdrop-blur-sm">{video.year}</Badge>}
            {video.quality && <Badge variant="outline" className="bg-black/40 backdrop-blur-sm">{video.quality}</Badge>}
            {video.duration && (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {video.duration}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-gray-200 line-clamp-3">
            {video.description || 'No description available.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-lg">
              <Link href={`/watch/${video.id}`}>
                <PlayCircle className="mr-2 h-6 w-6" />
                Play
              </Link>
            </Button>
            {/* <Button variant="outline" size="lg" className="bg-black/30 hover:bg-black/50 text-white border-white/50 rounded-full px-8 shadow-lg backdrop-blur-sm">
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
