
"use client";

import { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password. Please try again.");
        // Toast is shown in context now on error
      }
      // Success case is handled by context (redirect)
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred during login.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Error",
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
          <LogIn className="mr-3 h-7 w-7 text-primary" /> Log In
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your StreamVerse account.
          <br />
          <span className="text-xs text-muted-foreground">
            (Demo login: admin@example.com / adminpassword OR user@example.com / userpassword)
          </span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email Address"
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
              aria-label="Password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-primary font-semibold">
              <Link href="/register">
                Register Now <UserPlus className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

