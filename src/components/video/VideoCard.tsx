// src/components/video/VideoCard.tsx
import type { Video } from '@/types';
import Image from 'next/image';
import { PlayCircle, Tv, Film } from 'lucide-react'; // Removed Clock import
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress'; // Import Progress component

interface VideoCardProps {
  video: Video;
  onCardClick: (video: Video) => void; // Callback to open modal
  progress?: number; // Optional: Current watch progress in seconds
  duration?: number; // Optional: Total duration in seconds (needed for progress calc)
}

export default function VideoCard({ video, onCardClick, progress, duration }: VideoCardProps) {
  const isShow = video.type === 'show';
  const hasProgress = progress !== undefined && duration !== undefined && duration > 0;
  const progressPercentage = hasProgress ? (progress / duration) * 100 : 0;

  return (
    <div onClick={() => onCardClick(video)} className="group block cursor-pointer">
       <TooltipProvider delayDuration={100}>
         <Tooltip>
            <TooltipTrigger asChild>
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
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="h-16 w-16 text-white/80 drop-shadow-lg" />
                    </div>
                    {/* Type Badge */}
                     <div className="absolute bottom-2 left-2 z-10">
                       <Badge variant={isShow ? "default" : "secondary"} className="bg-black/50 text-white backdrop-blur-sm">
                         {isShow ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                       </Badge>
                     </div>
                     {/* Progress Bar Overlay */}
                     {hasProgress && progressPercentage > 0 && progressPercentage < 100 && (
                       <div className="absolute bottom-0 left-0 w-full h-1 z-10">
                         <Progress value={progressPercentage} className="h-1 rounded-none [&>div]:bg-primary" />
                       </div>
                     )}
                  </div>
                </CardHeader>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
                <p className="font-semibold">{isShow ? video.showName : video.title}</p>
                 {isShow && video.episodeTitle && <p>S{String(video.season).padStart(2, '0')}E{String(video.episode).padStart(2, '0')}: {video.episodeTitle}</p>}
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{video.description || 'No description'}</p>
                {hasProgress && progressPercentage > 0 && progressPercentage < 100 && (
                    <p className="text-xs text-primary mt-1">Watched: {Math.round(progressPercentage)}%</p>
                )}
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
    </div>
  );
}
