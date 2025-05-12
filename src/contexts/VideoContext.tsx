// src/contexts/VideoContext.tsx
"use client";

import type { Video } from '@/types';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Clapperboard } from 'lucide-react';

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  getVideoById: (id: string) => Video | undefined;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const sampleVideos: Video[] = [
  { 
    id: 'sample-1', 
    title: 'Ocean Wonders', 
    description: 'A beautiful journey through the deep blue ocean, showcasing diverse marine life and stunning coral reefs.', 
    thumbnailUrl: 'https://picsum.photos/400/225?random=1', 
    videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    duration: "7m",
    dataAiHint: "ocean documentary"
  },
  { 
    id: 'sample-2', 
    title: 'Mountain Majesty', 
    description: 'Explore the breathtaking views from high peaks, with sweeping panoramas and rugged landscapes.', 
    thumbnailUrl: 'https://picsum.photos/400/225?random=2', 
    videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    duration: "5m",
    dataAiHint: "mountain landscape"
  },
  { 
    id: 'sample-3', 
    title: 'City Lights', 
    description: 'A mesmerizing tour of a vibrant city at night, capturing the energy and glow of urban life.', 
    thumbnailUrl: 'https://picsum.photos/400/225?random=3', 
    videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    duration: "12m",
    dataAiHint: "city night"
  },
    { 
    id: 'sample-4', 
    title: 'Forest Whispers', 
    description: 'A tranquil walk through an ancient forest, listening to the sounds of nature and discovering hidden gems.', 
    thumbnailUrl: 'https://picsum.photos/400/225?random=4', 
    videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 
    uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    duration: "9m",
    dataAiHint: "forest nature"
  },
];


export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useLocalStorage<Video[]>('streamverse-videos', sampleVideos);

  const addVideo = (video: Video) => {
    setVideos((prevVideos) => [video, ...prevVideos]);
  };

  const getVideoById = (id: string): Video | undefined => {
    return videos.find((video) => video.id === id);
  };
  
  const contextValue = useMemo(() => ({ videos, addVideo, getVideoById }), [videos, addVideo, getVideoById]);


  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoContext() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
}
