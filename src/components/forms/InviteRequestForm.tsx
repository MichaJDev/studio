// src/components/forms/InviteRequestForm.tsx
"use client";

import { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InviteRequestFormProps {
  onSuccess?: () => void; // Optional callback for successful submission
}

export default function InviteRequestForm({ onSuccess }: InviteRequestFormProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createInviteRequest } = useAuthContext();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !reason.trim()) {
      setError("Email and reason are required.");
      return;
    }
    setIsLoading(true);

    try {
      const result = await createInviteRequest(email, reason);
      if (result.success) {
        toast({
          title: "Request Sent!",
          description: "Your invite request has been submitted.",
        });
        setEmail('');
        setReason('');
        onSuccess?.(); // Call success callback if provided (e.g., to close modal)
      } else {
        setError(result.error || "Failed to send request. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Request Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="request-email">Your Email</Label>
        <Input
          id="request-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          aria-label="Your Email Address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="request-reason">Reason for Request</Label>
        <Textarea
          id="request-reason"
          placeholder="Tell us briefly why you'd like to join PrismmTv..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          disabled={isLoading}
          rows={4}
          aria-label="Reason for requesting an invite"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Send className="mr-2 h-5 w-5" />
        )}
        {isLoading ? 'Sending Request...' : 'Submit Request'}
      </Button>
    </form>
  );
}
