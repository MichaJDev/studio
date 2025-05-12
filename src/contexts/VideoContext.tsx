// src/contexts/VideoContext.tsx
"use client";

import type { Video } from '@/types';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { scanMediaFiles } from '@/lib/media-scanner'; // Import the scanner

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  getVideoById: (id: string) => Video | undefined;
  getRecentVideos: (count: number) => Video[];
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Load initial data from the simulated scanner
const initialVideos = scanMediaFiles();

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useLocalStorage<Video[]>('streamverse-videos', initialVideos);

  const addVideo = (video: Video) => {
    // Ensure new uploads are marked correctly and get a timestamp
    const newUpload: Video = {
      ...video,
      type: 'upload',
      uploadedAt: new Date().toISOString(),
    };
    setVideos((prevVideos) => [newUpload, ...prevVideos]);
  };

  const getVideoById = (id: string): Video | undefined => {
    return videos.find((video) => video.id === id);
  };

  // Helper function to get the most recent videos (already sorted in state)
  const getRecentVideos = (count: number): Video[] => {
    // The state is already sorted by date via scanMediaFiles and addVideo prepending
    return videos.slice(0, count);
  };

  const contextValue = useMemo(() => ({ videos, addVideo, getVideoById, getRecentVideos }), [videos]); // Removed addVideo, getVideoById from deps as they don't change

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
