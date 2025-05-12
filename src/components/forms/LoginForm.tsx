
"use client";

import { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        // Router push is handled in AuthContext
      } else {
        setError("Invalid email or password. Please try again.");
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password.",
        });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
      toast({
        variant: "destructive",
        title: "Login Error",
        description: err.message || "An unexpected error occurred.",
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
            (Demo: admin@example.com / adminpassword OR user@example.com / userpassword)
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
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
