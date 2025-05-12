
"use client";

import { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, AlertCircle, KeyRound, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!inviteCode) {
        setError("Invite code is required.");
        return;
    }

    setIsLoading(true);

    try {
      const result = await register(name, email, password, inviteCode);
      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "Registration Successful!",
          description: "You can now log in with your new account.",
        });
        // Redirect to login after a short delay to show success message
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(result.error || "Registration failed. Please try again.");
         toast({ // Show toast for specific registration errors
          variant: "destructive",
          title: "Registration Failed",
          description: result.error || "Please check your details and try again.",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred during registration.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <UserPlus className="mr-3 h-7 w-7 text-primary" /> Create Account
        </CardTitle>
        <CardDescription>
          Register for StreamVerse using your invite code.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && !isSuccess && ( // Only show main error if not success (toast shows success)
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
           {isSuccess && (
            <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
              <AlertTitle className="text-green-800 dark:text-green-300">Success!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Account created. Redirecting to login...
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading || isSuccess}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isSuccess}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Basic password length enforcement
              disabled={isLoading || isSuccess}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || isSuccess}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
             <div className="flex items-center space-x-2">
               <KeyRound className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="invite-code"
                  type="text"
                  placeholder="Enter your invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())} // Standardize to uppercase
                  required
                  disabled={isLoading || isSuccess}
                />
             </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || isSuccess}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Registering...' : 'Register Account'}
          </Button>
           <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-primary font-semibold">
              <Link href="/login">
                Log In Instead
              </Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
