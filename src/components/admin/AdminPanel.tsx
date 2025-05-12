// src/components/admin/AdminPanel.tsx
"use client";

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useVideoContext } from '@/contexts/VideoContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScanLine, Users, ShieldCheck, Video as VideoIcon, RefreshCw, X, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { users, currentUser } = useAuthContext();
  const { videos, rescanMedia } = useVideoContext();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return null; // Should not happen if triggered correctly, but safeguard
  }

  const handleScanMedia = async () => {
    setIsScanning(true);
    toast({ title: "Starting Media Scan...", description: "Please wait..." });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    try {
      const count = rescanMedia();
      toast({
        title: "Media Scan Complete!",
        description: `Found ${count} media items.`,
      });
    } catch (error) {
      console.error("Media scan failed:", error);
      toast({
        variant: "destructive",
        title: "Media Scan Failed",
        description: "An error occurred during the scan. Check console for details.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanSubtitles = async () => {
     // In this simulation, subtitles are linked during the main media scan
     // In a real app, this might trigger a separate process.
     toast({
        title: "Subtitle Scan (Simulated)",
        description: "Subtitle linking occurs during the main media scan in this demo.",
     });
     // Optionally trigger handleScanMedia again if needed
     // await handleScanMedia();
  };

  const getLastWatchedTitle = (videoId: string | null | undefined): string => {
      if (!videoId) return 'N/A';
      const video = videos.find(v => v.id === videoId);
      if (!video) return 'N/A (Removed?)';
      if (video.type === 'show' && video.showName && video.season && video.episode) {
        return `${video.showName} S${String(video.season).padStart(2, '0')}E${String(video.episode).padStart(2, '0')}`;
      }
      return video.title || 'N/A';
  }

  const formatLastLogin = (isoDate?: string): string => {
     if (!isoDate) return 'Never';
     try {
       return formatDistanceToNowStrict(new Date(isoDate), { addSuffix: true });
     } catch (e) {
       return 'Invalid Date';
     }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-none w-screen h-screen flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-border flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-7 w-7 text-primary" />
             <div>
                <DialogTitle className="text-2xl">Admin Control Panel</DialogTitle>
                <DialogDescription>Manage users and media library.</DialogDescription>
             </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* User Management Section */}
          <div className="md:col-span-2 flex flex-col border border-border rounded-lg overflow-hidden">
             <h2 className="text-xl font-semibold p-4 border-b border-border flex items-center gap-2">
               <Users className="h-5 w-5 text-muted-foreground" /> User Management ({users.length})
             </h2>
             <ScrollArea className="flex-grow">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Name</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Role</TableHead>
                     <TableHead>Invite Code</TableHead>
                     <TableHead>Last Login</TableHead>
                     <TableHead>Last Watched</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {users.map((user) => (
                     <TableRow key={user.id}>
                       <TableCell className="font-medium">{user.name || '-'}</TableCell>
                       <TableCell>{user.email}</TableCell>
                       <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                          </Badge>
                       </TableCell>
                       <TableCell className="font-mono text-xs">{user.inviteCodeUsed || '-'}</TableCell>
                       <TableCell className="text-sm text-muted-foreground">{formatLastLogin(user.lastLogin)}</TableCell>
                       <TableCell className="text-sm truncate max-w-[150px]" title={getLastWatchedTitle(user.lastWatchedVideoId)}>
                          {getLastWatchedTitle(user.lastWatchedVideoId)}
                        </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
                 <TableCaption>Total users: {users.length}</TableCaption>
               </Table>
             </ScrollArea>
          </div>

          {/* Media Scanning Section */}
          <div className="flex flex-col border border-border rounded-lg">
             <h2 className="text-xl font-semibold p-4 border-b border-border flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-muted-foreground" /> Library Management
             </h2>
             <div className="p-4 space-y-4 flex-grow flex flex-col justify-center">
                 <p className="text-sm text-muted-foreground">
                     Manually trigger scans for media and subtitle files.
                     Scanning will update the library based on the contents of the `media_files` and `Subtitle_files` directories.
                 </p>
                 <Button
                    onClick={handleScanMedia}
                    disabled={isScanning}
                    size="lg"
                    className="w-full"
                 >
                    {isScanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <VideoIcon className="mr-2 h-4 w-4" />}
                    {isScanning ? 'Scanning Media...' : 'Scan Media Files'}
                 </Button>
                 <Button
                    onClick={handleScanSubtitles}
                    disabled={isScanning}
                    variant="outline"
                    size="lg"
                    className="w-full"
                 >
                     Scan Subtitle Files (Simulated)
                 </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
