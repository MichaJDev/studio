// src/components/video/VideoPlayerControls.tsx
"use client";

import type React from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  ChevronDown,
  ChevronUp,
  Settings2,
  AudioLines, // Icon for audio settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { Video, AudioTrackInfo } from '@/types'; // Import AudioTrackInfo
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideoContext } from '@/contexts/VideoContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';


interface VideoPlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoData: Video;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShowingControls: boolean;
  nextEpisode?: Video;
  prevEpisode?: Video;
  currentEpisodeIndexInSeason: number;
  episodesInCurrentSeason: Video[];
  availableAudioTracks: AudioTrackInfo[]; // New prop
  selectedAudioTrackId?: string; // New prop
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSkipIntro: () => void;
  onSelectAudioTrack: (trackId: string) => void; // New prop
  isNextUpActive: boolean;
  nextUpCountdown: number;
  onCancelNextUp: () => void;
  onConfirmNextUp: () => void;
  isFullscreen: boolean;
  onSelectEpisode: (episodeId: string) => void;
}

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
  const S = Math.floor(timeInSeconds % 60);
  const M = Math.floor((timeInSeconds / 60) % 60);
  const H = Math.floor(timeInSeconds / 3600);
  if (H > 0) {
    return `${H}:${M.toString().padStart(2, '0')}:${S.toString().padStart(2, '0')}`;
  }
  return `${M.toString().padStart(2, '0')}:${S.toString().padStart(2, '0')}`;
};

export default function VideoPlayerControls({
  videoRef,
  videoData,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShowingControls,
  nextEpisode,
  prevEpisode,
  currentEpisodeIndexInSeason,
  episodesInCurrentSeason,
  availableAudioTracks, // Destructure new prop
  selectedAudioTrackId, // Destructure new prop
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onPlayNext,
  onPlayPrev,
  onSkipIntro,
  onSelectAudioTrack, // Destructure new prop
  isNextUpActive,
  nextUpCountdown,
  onCancelNextUp,
  onConfirmNextUp,
  isFullscreen,
  onSelectEpisode,
}: VideoPlayerControlsProps) {

  const { getSeasonsForShow } = useVideoContext();
  const seasons = videoData.type === 'show' && videoData.showName ? getSeasonsForShow(videoData.showName) : [];

  const showSkipIntro =
    videoData.type === 'show' &&
    videoData.introEndTimeInSeconds &&
    currentTime > 5 && // Show after 5s
    currentTime < videoData.introEndTimeInSeconds;

  const hasSettings = (videoData.type === 'show' && episodesInCurrentSeason.length > 0) || availableAudioTracks.length > 1;


  if (!isShowingControls && !isNextUpActive && !showSkipIntro) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 ${
        isShowingControls || isNextUpActive || showSkipIntro ? 'opacity-100' : 'opacity-0'
      } bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none`}
      onClick={(e) => e.stopPropagation()} // Prevent clicks on controls background from propagating
    >
      {/* Top controls (e.g., title, back button - usually part of VideoPlayer or Page) */}
      <div></div>

      {/* Center controls (e.g. big play/pause, though typically done by clicking video) */}
      <div></div>

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <div className="absolute bottom-20 right-4 z-20 pointer-events-auto">
          <Button variant="secondary" onClick={onSkipIntro} className="bg-white/90 hover:bg-white text-black shadow-lg">
            Skip Intro
          </Button>
        </div>
      )}

      {/* Next Up Countdown Overlay */}
      {isNextUpActive && nextEpisode && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 pointer-events-auto">
            <div className="bg-background/80 p-8 rounded-lg shadow-2xl text-center max-w-md">
                <p className="text-muted-foreground text-sm mb-1">Next up</p>
                <h3 className="text-xl font-bold mb-1 line-clamp-1">{nextEpisode.showName}</h3>
                 {nextEpisode.season !== undefined && nextEpisode.episode !== undefined && (
                    <p className="text-primary text-md mb-3">
                    S{String(nextEpisode.season).padStart(2, '0')}E{String(nextEpisode.episode).padStart(2, '0')}: {nextEpisode.episodeTitle || nextEpisode.title}
                    </p>
                )}
                {/* Thumbnail can be added here if desired */}
                 {/* <div className="relative w-40 h-24 mx-auto mb-4 rounded overflow-hidden shadow-lg">
                   <Image src={nextEpisode.thumbnailUrl} alt={`Thumbnail for ${nextEpisode.title}`} fill className="object-cover" />
                 </div> */}
                <p className="text-4xl font-semibold mb-5">{nextUpCountdown}s</p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={onCancelNextUp} className="bg-transparent text-white border-white/50 hover:bg-white/10">Cancel</Button>
                    <Button onClick={onConfirmNextUp} className="bg-primary hover:bg-primary/80">Play Next</Button>
                </div>
            </div>
        </div>
      )}


      {/* Bottom Controls Bar */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Timeline Slider */}
         <Slider
            value={[currentTime]}
            max={duration}
            step={0.1} // More granular step for seeking
            onValueChange={(value) => onSeek(value[0])}
            className="w-full cursor-pointer h-2 [&>span:first-child]:h-2 [&>span>span]:bg-primary [&>span>span]:h-2 [&>span>span+span]:h-4 [&>span>span+span]:w-4 [&>span>span+span]:border-2" // Slightly smaller thumb
        />


        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onTogglePlay} className="text-white hover:text-white hover:bg-white/10">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            {videoData.type === 'show' && (
              <>
                <Button variant="ghost" size="icon" onClick={onPlayPrev} disabled={!prevEpisode} className="text-white hover:text-white hover:bg-white/10 disabled:opacity-50">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onPlayNext} disabled={!nextEpisode || isNextUpActive} className="text-white hover:text-white hover:bg-white/10 disabled:opacity-50">
                  <SkipForward className="h-5 w-5" />
                </Button>
              </>
            )}

            <div className="flex items-center gap-2 group">
              <Button variant="ghost" size="icon" onClick={onToggleMute} className="text-white hover:text-white hover:bg-white/10">
                {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
               <div className="w-0 group-hover:w-24 transition-[width] duration-200 overflow-hidden">
                 <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(value) => onVolumeChange(value[0] / 100)}
                    className="w-24 h-1 [&>span:first-child]:h-1 [&>span>span]:bg-white [&>span>span]:h-1 [&>span>span+span]:h-3 [&>span>span+span]:w-3 [&>span>span+span]:border-2"
                  />
               </div>
            </div>
            <span className="text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
             {/* Settings Popover */}
             {hasSettings && (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                        <Settings2 className="h-5 w-5" /> <span className="sr-only">Settings</span>
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-background/90 backdrop-blur-sm border-border text-foreground p-0" side="top" align="end">
                     <ScrollArea className="max-h-[70vh]"> {/* Limit height */}
                         {/* Audio Track Selection */}
                         {availableAudioTracks.length > 1 && (
                           <div className="p-4 border-b border-border">
                             <Label className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                               <AudioLines className="h-4 w-4 mr-2"/> Audio Language
                             </Label>
                             <Select value={selectedAudioTrackId} onValueChange={onSelectAudioTrack}>
                               <SelectTrigger className="w-full bg-muted/50 border-border">
                                 <SelectValue placeholder="Select audio track" />
                               </SelectTrigger>
                               <SelectContent>
                                 {availableAudioTracks.map((track) => (
                                   <SelectItem key={track.id} value={track.id}>
                                     {track.label}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                         )}

                         {/* Episode List (for shows) */}
                         {videoData.type === 'show' && episodesInCurrentSeason.length > 0 && (
                           <>
                             <div className="p-4 border-b border-border">
                                <h4 className="font-medium leading-none">{videoData.showName}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Season {String(videoData.season).padStart(2, '0')}
                                </p>
                             </div>
                             <div className="p-2"> {/* Removed max-h here, handled by ScrollArea */}
                                {episodesInCurrentSeason.map((ep) => (
                                    <Button
                                        key={ep.id}
                                        variant={ep.id === videoData.id ? "secondary" : "ghost"}
                                        className={`w-full justify-start text-left h-auto py-2 px-3 mb-1 ${ep.id === videoData.id ? 'font-semibold': ''}`}
                                        onClick={() => onSelectEpisode(ep.id)}
                                        title={`${ep.episodeTitle || ep.title}`} // Tooltip for long titles
                                    >
                                        <span className="mr-2 text-xs text-muted-foreground w-6 text-right">E{String(ep.episode).padStart(2, '0')}</span>
                                        <span className="truncate flex-1">{ep.episodeTitle || ep.title}</span>
                                        {ep.id === videoData.id && <Play className="h-4 w-4 ml-auto text-primary"/>}
                                    </Button>
                                ))}
                             </div>
                           </>
                         )}
                      </ScrollArea>
                    </PopoverContent>
                </Popover>
             )}

            <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="text-white hover:text-white hover:bg-white/10">
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
