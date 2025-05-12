// src/components/modals/InviteRequestModal.tsx
"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import InviteRequestForm from '@/components/forms/InviteRequestForm';

interface InviteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteRequestModal({ isOpen, onClose }: InviteRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pr-10"> {/* Added pr-10 to avoid overlap with close button */}
          <div className="space-y-1.5">
            <DialogTitle>Request an Invite</DialogTitle>
            <DialogDescription>
              Fill out the form below to request an invite code for PrismmTv.
            </DialogDescription>
          </div>
           <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full absolute top-3 right-3">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <InviteRequestForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
