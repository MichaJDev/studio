// src/components/video/VideoCard.tsx
import type { Video } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/50 h-full flex flex-col">
        <CardHeader className="p-0 relative">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={video.dataAiHint || "video thumbnail"}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-1 leading-tight group-hover:text-primary transition-colors">
            {video.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          {video.duration && (
            <Badge variant="secondary" className="flex items-center">
              <Clock className="h-3 w-3 mr-1.5" />
              {video.duration}
            </Badge>
          )}
          {video.uploadedAt && (
             <p className="text-xs text-muted-foreground">
              {new Date(video.uploadedAt).toLocaleDateString()}
            </p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
