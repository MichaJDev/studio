// src/components/admin/AdminPanel.tsx
"use client";

import React, { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useVideoContext } from '@/contexts/VideoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ScanLine, Users, ShieldCheck, Video as VideoIcon, RefreshCw, X, Calendar, Ticket, PlusCircle, Edit, MailQuestion, Check, XCircle, ClockIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import type { InviteRequest } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { users, currentUser, inviteCodes, createInviteCode, toggleInviteCodeStatus, inviteRequests, updateInviteRequestStatus } = useAuthContext();
  const { videos, rescanMedia } = useVideoContext();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const [newInviteCode, setNewInviteCode] = useState('');
  const [newInviteDescription, setNewInviteDescription] = useState('');
  const [newInviteMaxUses, setNewInviteMaxUses] = useState<number>(0);
  const [isCreatingCode, setIsCreatingCode] = useState(false);


  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleScanMedia = async () => {
    setIsScanning(true);
    toast({ title: "Starting Media Scan...", description: "Please wait..." });
    await new Promise(resolve => setTimeout(resolve, 500));
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
     toast({
        title: "Subtitle Scan (Simulated)",
        description: "Subtitle linking occurs during the main media scan in this demo.",
     });
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

  const formatLastLoginOrDate = (isoDate?: string): string => {
     if (!isoDate) return 'Never';
     try {
       return formatDistanceToNowStrict(new Date(isoDate), { addSuffix: true });
     } catch (e) {
       return 'Invalid Date';
     }
  }

  const handleCreateInviteCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!newInviteCode.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Invite code cannot be empty." });
      return;
    }
    setIsCreatingCode(true);
    const result = await createInviteCode(newInviteCode, newInviteDescription, newInviteMaxUses);
    if (result.success) {
      setNewInviteCode('');
      setNewInviteDescription('');
      setNewInviteMaxUses(0);
    } else {
      toast({ variant: "destructive", title: "Creation Failed", description: result.error });
    }
    setIsCreatingCode(false);
  };

  const handleInviteRequestStatusChange = (requestId: string, status: InviteRequest['status']) => {
    updateInviteRequestStatus(requestId, status);
  };

  const getStatusBadgeVariant = (status: InviteRequest['status']) => {
    switch (status) {
      case 'approved': return 'default'; // Primary color for approved
      case 'denied': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-none w-screen h-screen flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-border flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-7 w-7 text-primary" />
             <div>
                <DialogTitle className="text-2xl">Admin Control Panel</DialogTitle>
                <DialogDescription>Manage users, media, invites, and requests.</DialogDescription>
             </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col border border-border rounded-lg overflow-hidden">
                <h2 className="text-xl font-semibold p-4 border-b border-border flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" /> User Management ({users.length})
                </h2>
                <ScrollArea className="flex-grow max-h-[300px] md:max-h-[400px]">
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
                          <TableCell className="text-sm text-muted-foreground">{formatLastLoginOrDate(user.lastLogin)}</TableCell>
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

              <div className="flex flex-col border border-border rounded-lg">
                <h2 className="text-xl font-semibold p-4 border-b border-border flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-muted-foreground" /> Library Management
                </h2>
                <div className="p-4 space-y-4 flex-grow flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground">
                        Manually trigger scans for media and subtitle files.
                    </p>
                    <Button onClick={handleScanMedia} disabled={isScanning} size="lg" className="w-full">
                        {isScanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <VideoIcon className="mr-2 h-4 w-4" />}
                        {isScanning ? 'Scanning Media...' : 'Scan Media Files'}
                    </Button>
                    <Button onClick={handleScanSubtitles} disabled={isScanning} variant="outline" size="lg" className="w-full">
                        Scan Subtitle Files (Simulated)
                    </Button>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg">
              <h2 className="text-xl font-semibold p-4 border-b border-border flex items-center gap-2">
                <Ticket className="h-5 w-5 text-muted-foreground" /> Invite Code Management
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                <div className="lg:col-span-1 space-y-4 p-4 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium">Create New Invite Code</h3>
                  <form onSubmit={handleCreateInviteCodeSubmit} className="space-y-3">
                    <div>
                      <Label htmlFor="newInviteCode">Invite Code</Label>
                      <Input id="newInviteCode" value={newInviteCode} onChange={(e) => setNewInviteCode(e.target.value.toUpperCase())} placeholder="E.G., NEWFRIEND24" required />
                    </div>
                    <div>
                      <Label htmlFor="newInviteDescription">Description (Optional)</Label>
                      <Input id="newInviteDescription" value={newInviteDescription} onChange={(e) => setNewInviteDescription(e.target.value)} placeholder="For internal tracking" />
                    </div>
                    <div>
                      <Label htmlFor="newInviteMaxUses">Max Uses (0 for infinite)</Label>
                      <Input id="newInviteMaxUses" type="number" min="0" value={newInviteMaxUses} onChange={(e) => setNewInviteMaxUses(Number(e.target.value))} placeholder="0" />
                    </div>
                    <Button type="submit" disabled={isCreatingCode} className="w-full">
                      {isCreatingCode ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                      Create Code
                    </Button>
                  </form>
                </div>

                <div className="lg:col-span-2">
                   <h3 className="text-lg font-medium mb-3">Existing Invite Codes ({inviteCodes.length})</h3>
                  <ScrollArea className="max-h-[300px] md:max-h-[400px] border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Uses</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Enabled</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inviteCodes.map((ic) => (
                          <TableRow key={ic.code}>
                            <TableCell className="font-mono font-semibold">{ic.code}</TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]" title={ic.description}>{ic.description || '-'}</TableCell>
                            <TableCell>{ic.currentUses} / {ic.maxUses === 0 ? '∞' : ic.maxUses}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatLastLoginOrDate(ic.createdAt)}</TableCell>
                            <TableCell>
                               <Switch
                                 checked={ic.isEnabled}
                                 onCheckedChange={() => toggleInviteCodeStatus(ic.code)}
                                 aria-label={`Toggle status for code ${ic.code}`}
                               />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                       <TableCaption>Total invite codes: {inviteCodes.length}</TableCaption>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Invite Request Management Section */}
            <div className="border border-border rounded-lg">
              <h2 className="text-xl font-semibold p-4 border-b border-border flex items-center gap-2">
                <MailQuestion className="h-5 w-5 text-muted-foreground" /> Invite Requests ({inviteRequests.filter(r => r.status === 'pending').length} pending)
              </h2>
              <div className="p-4">
                {inviteRequests.length > 0 ? (
                  <ScrollArea className="max-h-[300px] md:max-h-[400px] border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inviteRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]" title={req.reason}>{req.reason}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatLastLoginOrDate(req.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(req.status)} className="capitalize">
                                {req.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {req.status === 'pending' && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" /> Change Status
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleInviteRequestStatusChange(req.id, 'approved')}>
                                      <Check className="mr-2 h-4 w-4 text-green-500" /> Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleInviteRequestStatusChange(req.id, 'denied')}>
                                      <XCircle className="mr-2 h-4 w-4 text-red-500" /> Deny
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableCaption>Total invite requests: {inviteRequests.length}</TableCaption>
                    </Table>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No invite requests yet.</p>
                )}
              </div>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
