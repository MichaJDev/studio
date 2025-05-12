// src/components/video/VideoPlayer.tsx
"use client";

import type { Video, AudioTrackInfo, SubtitleTrackInfo } from '@/types';
import { useVideoContext } from '@/contexts/VideoContext';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import VideoPlayerControls from './VideoPlayerControls';

interface VideoPlayerProps {
  video: Video;
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

  // Audio Track State
  const [availableAudioTracks, setAvailableAudioTracks] = useState<AudioTrackInfo[]>([]);
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<string | undefined>(undefined);

  // Subtitle Track State
  const [availableSubtitleTracks, setAvailableSubtitleTracks] = useState<SubtitleTrackInfo[]>([]);
  const [selectedSubtitleLang, setSelectedSubtitleLang] = useState<string | 'off'>('off'); // Default to 'off'


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


  // Function to update audio track state based on video element
  const updateAudioTracks = useCallback(() => {
     const videoElement = videoRef.current;
     if (videoElement && videoElement.audioTracks) {
       const tracks: AudioTrackInfo[] = [];
       let enabledTrackId: string | undefined = undefined;
       for (let i = 0; i < videoElement.audioTracks.length; i++) {
         const track = videoElement.audioTracks[i];
         tracks.push({
           id: track.id || String(i), // Use index as fallback ID
           language: track.language || 'unknown',
           label: track.label || `Track ${i + 1}${track.language ? ` (${track.language})` : ''}`,
         });
         if (track.enabled) {
           enabledTrackId = track.id || String(i);
         }
       }
       // If no track is explicitly enabled, assume the first one is active
       if (!enabledTrackId && tracks.length > 0) {
           enabledTrackId = tracks[0].id;
           // Attempt to enable the first track if none are enabled (might not always work)
           if (videoElement.audioTracks[0]) {
               videoElement.audioTracks[0].enabled = true;
           }
       }

       setAvailableAudioTracks(tracks);
       setSelectedAudioTrackId(enabledTrackId);
     } else {
        // If no audioTracks API support or no tracks, use simulated data if available
        setAvailableAudioTracks(video.audioTracks || []);
        setSelectedAudioTrackId(video.audioTracks && video.audioTracks.length > 0 ? video.audioTracks[0].id : undefined);
     }
  }, [video.audioTracks]); // Depend on simulated data from props


  // Function to update subtitle track state based on video element and props
  const updateSubtitleTracks = useCallback(() => {
    const videoElement = videoRef.current;
    const simulatedSubs = video.subtitleTracks || [];
    // If the browser supports TextTrackList, use it as the source of truth
    if (videoElement && videoElement.textTracks) {
        const browserTracks: SubtitleTrackInfo[] = [];
        let activeLang: string | 'off' = 'off';
        for (let i = 0; i < videoElement.textTracks.length; i++) {
            const track = videoElement.textTracks[i];
            // Only consider subtitle/caption tracks
            if (track.kind === 'subtitles' || track.kind === 'captions') {
                browserTracks.push({
                    srclang: track.language || 'unknown',
                    label: track.label || `Subtitle ${i + 1}${track.language ? ` (${track.language})` : ''}`,
                    src: (track as any).src || '', // src isn't standard on TextTrack but might exist
                });
                if (track.mode === 'showing') {
                    activeLang = track.language || 'unknown';
                }
            }
        }
        setAvailableSubtitleTracks(browserTracks);
        setSelectedSubtitleLang(activeLang);
    } else {
        // Fallback to simulated data from props
        setAvailableSubtitleTracks(simulatedSubs);
        // Determine default selection from simulated data
        const defaultSub = simulatedSubs.find(sub => sub.isDefault);
        setSelectedSubtitleLang(defaultSub ? defaultSub.srclang : 'off');
    }

  }, [video.subtitleTracks]);


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      resetControlsTimeout(); // Keep controls visible when paused
    };
    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleLoadedMetadata = () => {
        setDuration(videoElement.duration);
        updateAudioTracks(); // Update tracks when metadata is loaded
        updateSubtitleTracks(); // Update subtitles as well
    };
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

    // Listener for changes in the audio track list or enabled status
    const handleAudioTrackChange = () => {
        updateAudioTracks();
    };
    // Listener for changes in text tracks (subtitles)
    const handleTextTrackChange = () => {
        updateSubtitleTracks();
    };


    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('ended', handleEnded);

    // Add listeners for audio track changes
    if (videoElement.audioTracks) {
        videoElement.audioTracks.addEventListener('change', handleAudioTrackChange);
        videoElement.audioTracks.addEventListener('addtrack', handleAudioTrackChange);
        videoElement.audioTracks.addEventListener('removetrack', handleAudioTrackChange);
    }
    // Add listeners for text track changes
    if (videoElement.textTracks) {
        videoElement.textTracks.addEventListener('change', handleTextTrackChange);
        videoElement.textTracks.addEventListener('addtrack', handleTextTrackChange);
        videoElement.textTracks.addEventListener('removetrack', handleTextTrackChange);
    }


    // Initial setup
    if (autoplay && videoElement.paused) {
      videoElement.play().catch(err => console.warn("Autoplay prevented:", err));
    }
    setDuration(videoElement.duration || video.durationInSeconds || 0);
    setCurrentTime(videoElement.currentTime);
    setVolume(videoElement.volume);
    setIsMuted(videoElement.muted);
    updateAudioTracks(); // Initial check for audio tracks
    updateSubtitleTracks(); // Initial check for subtitles
    resetControlsTimeout();

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('ended', handleEnded);

      // Remove audio track listeners
      if (videoElement.audioTracks) {
        videoElement.audioTracks.removeEventListener('change', handleAudioTrackChange);
        videoElement.audioTracks.removeEventListener('addtrack', handleAudioTrackChange);
        videoElement.audioTracks.removeEventListener('removetrack', handleAudioTrackChange);
      }
       // Remove text track listeners
      if (videoElement.textTracks) {
          videoElement.textTracks.removeEventListener('change', handleTextTrackChange);
          videoElement.textTracks.removeEventListener('addtrack', handleTextTrackChange);
          videoElement.textTracks.removeEventListener('removetrack', handleTextTrackChange);
      }

      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (nextUpTimeoutRef.current) clearTimeout(nextUpTimeoutRef.current);
      if (nextUpIntervalRef.current) clearInterval(nextUpIntervalRef.current);
    };
    // Add updateAudioTracks to dependency array to re-run if the function identity changes (though unlikely with useCallback)
  }, [video, autoplay, resetControlsTimeout, nextEpisode, updateAudioTracks, updateSubtitleTracks]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNextUpActive, nextEpisode]); // handleConfirmNextUp dependency removed as it causes re-renders


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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePlayNext]); // Removed handlePlayNext from deps to avoid re-renders


  const handleSelectEpisode = (episodeId: string) => {
    router.push(`/watch/${episodeId}`);
  };

  const handleSelectAudioTrack = useCallback((trackId: string) => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.audioTracks) {
        let found = false;
        for (let i = 0; i < videoElement.audioTracks.length; i++) {
            const track = videoElement.audioTracks[i];
            const currentTrackId = track.id || String(i);
            if (currentTrackId === trackId) {
                track.enabled = true;
                setSelectedAudioTrackId(trackId);
                found = true;
            } else {
                track.enabled = false;
            }
        }
        if (!found) {
            console.warn(`Audio track with ID ${trackId} not found.`);
        }
        resetControlsTimeout();
    } else {
        console.warn("Audio tracks API not available or no tracks found.");
        // Fallback or alternative logic if needed
    }
}, [resetControlsTimeout]);

  const handleSelectSubtitle = useCallback((lang: string | 'off') => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.textTracks) {
      let found = false;
      for (let i = 0; i < videoElement.textTracks.length; i++) {
        const track = videoElement.textTracks[i];
        if (track.kind === 'subtitles' || track.kind === 'captions') {
          const trackLang = track.language || 'unknown'; // Use 'unknown' if language is missing
          if (lang === 'off') {
            track.mode = 'disabled';
            found = true; // Consider 'off' as found
          } else if (trackLang === lang || (lang !== 'unknown' && !track.language && i === 0)) { // Match language or select first track if lang matches 'unknown' and track has no lang
             track.mode = 'showing';
             found = true;
          } else {
            track.mode = 'disabled';
          }
        }
      }
       // Ensure the state reflects the change, even if no track was perfectly matched (e.g., for 'off')
       setSelectedSubtitleLang(lang);

      if (!found && lang !== 'off') {
          console.warn(`Subtitle track for language "${lang}" not found.`);
          // If no track was found for the desired language, explicitly turn all off
          for (let i = 0; i < videoElement.textTracks.length; i++) {
              if (videoElement.textTracks[i].kind === 'subtitles' || videoElement.textTracks[i].kind === 'captions') {
                   videoElement.textTracks[i].mode = 'disabled';
              }
          }
          setSelectedSubtitleLang('off'); // Update state to 'off' if the selection failed
      }

      resetControlsTimeout();
    } else {
      console.warn("Text tracks API not available.");
       // Still update the state optimistically for simulated tracks
      setSelectedSubtitleLang(lang);
      resetControlsTimeout();
    }
  }, [resetControlsTimeout]);


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
        {/* Render subtitle tracks from the Video object */}
         {(video.subtitleTracks || []).map((sub) => (
          <track
            key={sub.srclang}
            label={sub.label}
            kind="subtitles"
            srcLang={sub.srclang}
            src={sub.src}
            default={selectedSubtitleLang === sub.srclang}
          />
        ))}
         {/* Fallback for single subtitleSrc if subtitleTracks is not present */}
         {!video.subtitleTracks && video.subtitleSrc && (
            <track
              label="English" // Default label if only src is provided
              kind="subtitles"
              srcLang="en" // Default lang if only src is provided
              src={video.subtitleSrc}
              default={selectedSubtitleLang === 'en'}
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
        availableAudioTracks={availableAudioTracks}
        selectedAudioTrackId={selectedAudioTrackId}
        availableSubtitleTracks={availableSubtitleTracks} // Pass subtitle info
        selectedSubtitleLang={selectedSubtitleLang} // Pass subtitle info
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleFullscreen={handleToggleFullscreen}
        onPlayNext={handlePlayNext}
        onPlayPrev={handlePlayPrev}
        onSkipIntro={handleSkipIntro}
        onSelectAudioTrack={handleSelectAudioTrack}
        onSelectSubtitle={handleSelectSubtitle} // Pass subtitle handler
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
