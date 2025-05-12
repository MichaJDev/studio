// src/components/video/VideoCard.tsx
import type { Video } from '@/types';
import Image from 'next/image';
import { PlayCircle, Clock, Tv, Film } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card'; // Removed CardContent, CardFooter imports
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface VideoCardProps {
  video: Video;
  onCardClick: (video: Video) => void; // Callback to open modal
}

export default function VideoCard({ video, onCardClick }: VideoCardProps) {
  const isShow = video.type === 'show';

  return (
    <div onClick={() => onCardClick(video)} className="group block cursor-pointer"> {/* Changed Link to div and added onClick */}
       <TooltipProvider delayDuration={100}>
         <Tooltip>
            <TooltipTrigger asChild>
              {/* Simplified Card structure */}
              <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/50">
                <CardHeader className="p-0 relative">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={video.dataAiHint || (isShow ? "tv show" : "movie poster")}
                      priority={false}
                    />
                    {/* Overlays and Badges remain inside CardHeader */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="h-16 w-16 text-white/80 drop-shadow-lg" />
                    </div>
                    {/* SxxExx badge removed from here */}
                     <div className="absolute bottom-2 left-2">
                       <Badge variant={isShow ? "default" : "secondary"} className="bg-black/50 text-white backdrop-blur-sm">
                         {isShow ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                       </Badge>
                     </div>
                  </div>
                </CardHeader>
                {/* CardContent and CardFooter removed */}
              </Card>
            </TooltipTrigger>
            {/* Tooltip content remains unchanged */}
            <TooltipContent side="bottom" align="start">
                <p className="font-semibold">{isShow ? video.showName : video.title}</p>
                 {isShow && video.episodeTitle && <p>S{String(video.season).padStart(2, '0')}E{String(video.episode).padStart(2, '0')}: {video.episodeTitle}</p>}
                <p className="text-muted-foreground text-sm mt-1">{video.description || 'No description'}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
    </div>
  );
}
