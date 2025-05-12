// src/components/video/VideoPlayer.tsx
"use client";

import type { Video } from '@/types';
import { useVideoContext } from '@/contexts/VideoContext';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import VideoPlayerControls from './VideoPlayerControls';

interface VideoPlayerProps {
  video: Video; // Changed from src, title to full video object
  autoplay?: boolean;
}

export default function VideoPlayer({ video, autoplay = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { getEpisodesForShowAndSeason, getSeasonsForShow } = useVideoContext();

  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShowingControls, setIsShowingControls] = useState(true);
  const [isNextUpActive, setIsNextUpActive] = useState(false);
  const [nextUpCountdown, setNextUpCountdown] = useState(10); // Countdown in seconds

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextUpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextUpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const episodesInCurrentSeason = useMemo(() => {
    if (video.type === 'show' && video.showName && video.season !== undefined) {
      return getEpisodesForShowAndSeason(video.showName, video.season);
    }
    return [];
  }, [video, getEpisodesForShowAndSeason]);

  const currentEpisodeIndexInSeason = useMemo(() => {
    return episodesInCurrentSeason.findIndex(ep => ep.id === video.id);
  }, [video, episodesInCurrentSeason]);

  const prevEpisode = useMemo(() => {
    if (video.type !== 'show' || currentEpisodeIndexInSeason <= 0) return undefined;
    return episodesInCurrentSeason[currentEpisodeIndexInSeason - 1];
  }, [video, episodesInCurrentSeason, currentEpisodeIndexInSeason]);

  const nextEpisode = useMemo(() => {
    if (video.type !== 'show' || currentEpisodeIndexInSeason < 0 || currentEpisodeIndexInSeason >= episodesInCurrentSeason.length - 1) {
      // Potentially look for next season's SXXE01
      if (video.type === 'show' && video.showName && video.season !== undefined) {
        const seasons = getSeasonsForShow(video.showName);
        const currentSeasonIndex = seasons.indexOf(video.season);
        if (currentSeasonIndex !== -1 && currentSeasonIndex < seasons.length - 1) {
          const nextSeasonNumber = seasons[currentSeasonIndex + 1];
          const nextSeasonEpisodes = getEpisodesForShowAndSeason(video.showName, nextSeasonNumber);
          if (nextSeasonEpisodes.length > 0) {
            return nextSeasonEpisodes[0]; // First episode of next season
          }
        }
      }
      return undefined;
    }
    return episodesInCurrentSeason[currentEpisodeIndexInSeason + 1];
  }, [video, episodesInCurrentSeason, currentEpisodeIndexInSeason, getSeasonsForShow, getEpisodesForShowAndSeason]);


  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setIsShowingControls(true);
    if (isPlaying) { // Only auto-hide if playing
      controlsTimeoutRef.current = setTimeout(() => {
        setIsShowingControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      resetControlsTimeout(); // Keep controls visible when paused
    };
    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleLoadedMetadata = () => setDuration(videoElement.duration);
    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (nextEpisode && video.type === 'show') {
        setIsNextUpActive(true);
        setNextUpCountdown(10); // Reset countdown
        resetControlsTimeout(); // Ensure controls (and next up) are visible
      }
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('ended', handleEnded);

    // Initial setup
    if (autoplay && videoElement.paused) {
      videoElement.play().catch(err => console.warn("Autoplay prevented:", err));
    }
    setDuration(videoElement.duration || video.durationInSeconds || 0);
    setCurrentTime(videoElement.currentTime);
    setVolume(videoElement.volume);
    setIsMuted(videoElement.muted);
    resetControlsTimeout();

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('ended', handleEnded);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (nextUpTimeoutRef.current) clearTimeout(nextUpTimeoutRef.current);
      if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current);
    };
  }, [video, autoplay, resetControlsTimeout, nextEpisode]);
  
  // Effect for Next Up Countdown
  useEffect(() => {
    if (isNextUpActive && nextEpisode) {
      if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current); // Clear any existing interval
      nextUpIntervalRef.current = setInterval(() => {
        setNextUpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(nextUpIntervalRef.current!);
            handleConfirmNextUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current);
    }
    return () => {
      if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current);
    };
  }, [isNextUpActive, nextEpisode]);


  const handleTogglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      resetControlsTimeout();
    }
  }, [resetControlsTimeout]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time); // Eager update
      resetControlsTimeout();
    }
  }, [resetControlsTimeout]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      resetControlsTimeout();
    }
  }, [resetControlsTimeout]);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      resetControlsTimeout();
    }
  }, [resetControlsTimeout]);

  const handleToggleFullscreen = useCallback(() => {
    const elem = playerContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err)).then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const handlePlayNext = useCallback(() => {
    if (nextEpisode) {
      router.push(`/watch/${nextEpisode.id}`);
    }
  }, [nextEpisode, router]);

  const handlePlayPrev = useCallback(() => {
    if (prevEpisode) {
      router.push(`/watch/${prevEpisode.id}`);
    }
  }, [prevEpisode, router]);

  const handleSkipIntro = useCallback(() => {
    if (videoRef.current && video.introEndTimeInSeconds) {
      videoRef.current.currentTime = video.introEndTimeInSeconds;
      resetControlsTimeout();
    }
  }, [video.introEndTimeInSeconds, resetControlsTimeout]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);
  
  const handleCancelNextUp = useCallback(() => {
    setIsNextUpActive(false);
    if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current);
    if (videoRef.current) videoRef.current.pause(); // Pause video when countdown is cancelled
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleConfirmNextUp = useCallback(() => {
    setIsNextUpActive(false);
    if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current);
    handlePlayNext();
  }, [handlePlayNext]);

  const handleSelectEpisode = (episodeId: string) => {
    router.push(`/watch/${episodeId}`);
  };


  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full h-full aspect-video bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleTogglePlay} // Allow clicking video to play/pause
    >
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        className="w-full h-full"
        src={video.videoSrc}
        title={video.title}
        preload="metadata"
        onClick={(e) => e.stopPropagation()} // Prevent click on video itself from bubbling to container if controls are visible
      >
        {video.subtitleSrc && (
          <track
            label="English"
            kind="subtitles"
            srcLang="en"
            src={video.subtitleSrc}
            default
          />
        )}
        Your browser does not support the video tag.
      </video>
      <VideoPlayerControls
        videoRef={videoRef}
        videoData={video}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration || video.durationInSeconds || 0}
        volume={volume}
        isMuted={isMuted}
        isShowingControls={isShowingControls}
        nextEpisode={nextEpisode}
        prevEpisode={prevEpisode}
        currentEpisodeIndexInSeason={currentEpisodeIndexInSeason}
        episodesInCurrentSeason={episodesInCurrentSeason}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleFullscreen={handleToggleFullscreen}
        onPlayNext={handlePlayNext}
        onPlayPrev={handlePlayPrev}
        onSkipIntro={handleSkipIntro}
        isNextUpActive={isNextUpActive}
        nextUpCountdown={nextUpCountdown}
        onCancelNextUp={handleCancelNextUp}
        onConfirmNextUp={handleConfirmNextUp}
        isFullscreen={isFullscreen}
        onSelectEpisode={handleSelectEpisode}
      />
    </div>
  );
}
