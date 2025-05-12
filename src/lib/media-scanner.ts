// src/lib/media-scanner.ts
import type { Video } from '@/types';

function parseDurationToSeconds(durationStr?: string): number | undefined {
  if (!durationStr || durationStr === "N/A") return undefined;

  let totalSeconds = 0;
  const hourMatch = durationStr.match(/(\d+)h/);
  const minuteMatch = durationStr.match(/(\d+)m/);
  // Assuming 's' for seconds is less common for typical video durations, but can be added if needed.
  // const secondMatch = durationStr.match(/(\d+)s/);

  if (hourMatch) totalSeconds += parseInt(hourMatch[1], 10) * 3600;
  if (minuteMatch) totalSeconds += parseInt(minuteMatch[1], 10) * 60;
  // if (secondMatch) totalSeconds += parseInt(secondMatch[1], 10);
  
  return totalSeconds > 0 ? totalSeconds : undefined;
}


/**
 * Simulates scanning media files and extracting metadata.
 * In a real application, this would involve using fs to read directories,
 * complex regex parsing for filenames, and potentially external API calls for metadata.
 *
 * For demonstration, this returns a hardcoded list.
 */
export function scanMediaFiles(): Video[] {
  const now = Date.now();
  const simulatedMedia: Video[] = [
    // Movies
    {
      id: 'movie-sim-1',
      originalFilename: 'Awesome.Movie.2023.1080p.mkv',
      title: 'Awesome Movie',
      description: 'A simulated awesome movie from the year 2023.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=m1',
      videoSrc: '/media_files/Movies/Awesome.Movie.2023.1080p.mkv', // Placeholder path
      subtitleSrc: '/Subtitle_files/Awesome.Movie.2023.1080p.srt', // Placeholder path
      uploadedAt: new Date(now - 86400000 * 2).toISOString(), // Simulate scan/add time
      duration: "1h 55m",
      durationInSeconds: parseDurationToSeconds("1h 55m"),
      dataAiHint: "action movie",
      type: 'movie',
      quality: '1080p',
      year: 2023,
    },
    {
      id: 'movie-sim-2',
      originalFilename: 'Another.Great.Film.(2021).720p.mp4',
      title: 'Another Great Film',
      description: 'A compelling drama from 2021.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=m2',
      videoSrc: '/media_files/Movies/Another.Great.Film.(2021).720p.mp4', // Placeholder path
      uploadedAt: new Date(now - 86400000 * 10).toISOString(),
      duration: "2h 10m",
      durationInSeconds: parseDurationToSeconds("2h 10m"),
      dataAiHint: "drama film",
      type: 'movie',
      quality: '720p',
      year: 2021,
    },
    // Shows
    {
      id: 'show-sim-1-s01e01',
      originalFilename: 'Cool.Show.S01E01.Pilot.Episode.720p.mp4',
      title: 'Pilot Episode', // Episode title used as main title for the card
      showName: 'Cool Show',
      description: 'The first episode of the Cool Show series.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=s1e1',
      videoSrc: '/media_files/Shows/Cool.Show.S01E01.Pilot.Episode.720p.mp4', // Placeholder path
      uploadedAt: new Date(now - 86400000 * 5).toISOString(),
      duration: "45m",
      durationInSeconds: parseDurationToSeconds("45m"),
      introEndTimeInSeconds: 85, // 1 minute 25 seconds
      dataAiHint: "tv series",
      type: 'show',
      quality: '720p',
      season: 1,
      episode: 1,
      episodeTitle: 'Pilot Episode',
    },
    {
      id: 'show-sim-1-s01e02',
      originalFilename: 'Cool.Show.S01E02.The.Next.Step.HDTV.mkv',
      title: 'The Next Step',
      showName: 'Cool Show',
      description: 'The adventure continues in the second episode.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=s1e2',
      videoSrc: '/media_files/Shows/Cool.Show.S01E02.The.Next.Step.HDTV.mkv', // Placeholder path
      subtitleSrc: '/Subtitle_files/Cool.Show.S01E02.The.Next.Step.HDTV.srt',
      uploadedAt: new Date(now - 86400000 * 4).toISOString(),
      duration: "48m",
      durationInSeconds: parseDurationToSeconds("48m"),
      introEndTimeInSeconds: 60, // 1 minute
      dataAiHint: "sci-fi show",
      type: 'show',
      quality: 'HDTV', // Example quality
      season: 1,
      episode: 2,
      episodeTitle: 'The Next Step',
    },
     {
      id: 'show-sim-1-s01e03',
      originalFilename: 'Cool.Show.S01E03.mp4',
      title: 'Episode 3', // Default if no name found
      showName: 'Cool Show',
      description: 'Episode three unfolds. This is the last episode of season 1 for Cool Show.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=s1e3',
      videoSrc: '/media_files/Shows/Cool.Show.S01E03.mp4', // Placeholder path
      uploadedAt: new Date(now - 86400000 * 3).toISOString(),
      duration: "42m",
      durationInSeconds: parseDurationToSeconds("42m"),
      // No intro skip for this one
      dataAiHint: "mystery series",
      type: 'show',
      season: 1,
      episode: 3,
    },
    {
      id: 'show-sim-2-s01e01',
      originalFilename: 'Another.Series.S01E01.The.Beginning.1080p.mkv',
      title: 'The Beginning',
      showName: 'Another Series',
      description: 'The first episode of Another Series.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=s2e1',
      videoSrc: '/media_files/Shows/Another.Series.S01E01.The.Beginning.1080p.mkv',
      uploadedAt: new Date(now - 86400000 * 7).toISOString(),
      duration: "55m",
      durationInSeconds: parseDurationToSeconds("55m"),
      introEndTimeInSeconds: 70,
      dataAiHint: "drama series",
      type: 'show',
      quality: '1080p',
      season: 1,
      episode: 1,
      episodeTitle: 'The Beginning',
    },
    // Include original sample videos marked as 'upload' type for variety
    {
      id: 'sample-1',
      title: 'Ocean Wonders',
      description: 'A beautiful journey through the deep blue ocean, showcasing diverse marine life and stunning coral reefs.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=1',
      videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Using remote URL for uploads
      uploadedAt: new Date(now - 86400000 * 15).toISOString(), // Older date
      duration: "7m",
      durationInSeconds: parseDurationToSeconds("7m"),
      dataAiHint: "ocean documentary",
      type: 'upload', // Mark as uploaded
    },
    {
      id: 'sample-2',
      title: 'Mountain Majesty',
      description: 'Explore the breathtaking views from high peaks, with sweeping panoramas and rugged landscapes.',
      thumbnailUrl: 'https://picsum.photos/400/225?random=2',
      videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      uploadedAt: new Date(now - 86400000 * 12).toISOString(), // Older date
      duration: "5m",
      durationInSeconds: parseDurationToSeconds("5m"),
      dataAiHint: "mountain landscape",
      type: 'upload',
    },
    {
       id: 'sample-3',
       title: 'City Lights',
       description: 'A mesmerizing tour of a vibrant city at night, capturing the energy and glow of urban life.',
       thumbnailUrl: 'https://picsum.photos/400/225?random=3',
       videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
       uploadedAt: new Date(now - 86400000 * 11).toISOString(), // Older date
       duration: "12m",
       durationInSeconds: parseDurationToSeconds("12m"),
       dataAiHint: "city night",
       type: 'upload',
    },
     {
       id: 'sample-4',
       title: 'Forest Whispers',
       description: 'A tranquil walk through an ancient forest, listening to the sounds of nature and discovering hidden gems.',
       thumbnailUrl: 'https://picsum.photos/400/225?random=4',
       videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
       uploadedAt: new Date(now - 86400000 * 18).toISOString(), // Older date
       duration: "9m",
       durationInSeconds: parseDurationToSeconds("9m"),
       dataAiHint: "forest nature",
       type: 'upload',
     },
      {
       id: 'sample-5-recent',
       title: 'Desert Adventure',
       description: 'A recent simulated upload exploring vast desert landscapes.',
       thumbnailUrl: 'https://picsum.photos/400/225?random=d1',
       videoSrc: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
       uploadedAt: new Date(now - 86400000 * 1).toISOString(), // Uploaded yesterday
       duration: "15m",
       durationInSeconds: parseDurationToSeconds("15m"),
       dataAiHint: "desert travel",
       type: 'upload',
     },
  ];

  // Sort by simulated upload/scan date, newest first
  return simulatedMedia.sort((a, b) => {
    if (!a.uploadedAt || !b.uploadedAt) return 0;
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
}

// Basic title beautification (can be expanded)
function beautifyTitle(filename: string): string {
  // Remove extension
  let title = filename.substring(0, filename.lastIndexOf('.')) || filename;
  // Replace dots and underscores with spaces
  title = title.replace(/[._]/g, ' ');
  // Remove common tags like quality, year in parentheses/brackets (simple version)
  title = title.replace(/\s*\(\d{4}\)/g, ''); // (YYYY)
  title = title.replace(/\s*\[\d{4}\]/g, ''); // [YYYY]
  title = title.replace(/\s*(1080p|720p|HDTV|WEB-DL|BluRay|DVD)\s*/gi, ' ');
  // Remove SxxExx patterns
  title = title.replace(/\s*S\d{2}E\d{2}\s*/gi, ' ');
  // Trim whitespace
  title = title.trim();
  return title;
}

// Basic metadata parsing (very simplified)
interface ParsedMeta {
  title: string;
  year?: number;
  quality?: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  showName?: string;
}

function parseFilename(filename: string): ParsedMeta {
  const baseTitle = beautifyTitle(filename);
  let parsed: ParsedMeta = { title: baseTitle };

  // Year
  const yearMatch = filename.match(/[.\s](\d{4})[.\s]/);
  if (yearMatch) parsed.year = parseInt(yearMatch[1], 10);

  // Quality
  const qualityMatch = filename.match(/[.\s](1080p|720p|HDTV|WEB-DL|BluRay|DVD)[.\s]/i);
  if (qualityMatch) parsed.quality = qualityMatch[1].toUpperCase();

  // Show SxxExx
  const showMatch = filename.match(/(.*?)[.\s](S(\d{2}))(E(\d{2}))[.\s]?(.*?)\./i);
  if (showMatch) {
    parsed.showName = beautifyTitle(showMatch[1]); // Title before SxxExx is show name
    parsed.season = parseInt(showMatch[3], 10);
    parsed.episode = parseInt(showMatch[5], 10);
    parsed.episodeTitle = beautifyTitle(showMatch[6] || `Episode ${parsed.episode}`); // Use remaining as episode title
    parsed.title = parsed.episodeTitle; // Use episode title as the main title
  }

  return parsed;
}

// Note: The actual implementation of parseFilename and beautifyTitle would need
// to be much more robust to handle various filename conventions.
// The simulation uses pre-filled data based on what a parser *might* extract.

