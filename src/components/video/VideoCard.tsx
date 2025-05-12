// src/components/video/VideoCard.tsx
import type { Video } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Clock, Tv, Film } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const isShow = video.type === 'show';

  return (
    <Link href={`/watch/${video.id}`} className="group block">
       <TooltipProvider delayDuration={100}>
         <Tooltip>
            <TooltipTrigger asChild>
              <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/50 h-full flex flex-col">
                <CardHeader className="p-0 relative">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" // Adjusted sizes
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={video.dataAiHint || (isShow ? "tv show" : "movie poster")}
                      priority={false} // Avoid prioritizing all card images
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="h-16 w-16 text-white/80 drop-shadow-lg" />
                    </div>
                    {/* Display SxE badge for shows */}
                    {isShow && video.season !== undefined && video.episode !== undefined && (
                       <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                          S{String(video.season).padStart(2, '0')}E{String(video.episode).padStart(2, '0')}
                       </Badge>
                    )}
                     {/* Display Type icon */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant={isShow ? "default" : "secondary"} className="bg-black/50 text-white backdrop-blur-sm">
                         {isShow ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 flex-grow">
                  <CardTitle className="text-base font-semibold mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {/* Show name for shows, Title for movies/uploads */}
                    {isShow ? video.showName : video.title}
                  </CardTitle>
                   {/* Show episode title or movie title/description */}
                   <p className="text-sm text-muted-foreground line-clamp-2">
                      {isShow ? video.title : (video.description || 'No description available')}
                   </p>
                </CardContent>
                <CardFooter className="p-3 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                      {video.duration && (
                        <span className="flex items-center">
                           <Clock className="h-3 w-3 mr-1" />
                           {video.duration}
                        </span>
                      )}
                      {video.year && <span>{video.year}</span>}
                      {video.quality && <Badge variant="outline" className="text-xs px-1.5 py-0.5">{video.quality}</Badge>}
                   </div>
                   {video.uploadedAt && (
                     <p>
                      Added: {new Date(video.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardFooter>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
                <p className="font-semibold">{isShow ? video.showName : video.title}</p>
                 {isShow && <p>S{String(video.season).padStart(2, '0')}E{String(video.episode).padStart(2, '0')}: {video.title}</p>}
                <p className="text-muted-foreground text-sm mt-1">{video.description || 'No description'}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
    </Link>
  );
}
