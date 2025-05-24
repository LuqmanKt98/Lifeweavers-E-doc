// src/components/auth/LoginForm.tsx
"use client";

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

export function LoginForm() {
  const [email, setEmail] = useState('');
  // const [password, setPassword] = useState(''); // Password not used in mock
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Login Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Invalid credentials or user not found. Please contact an administrator if you believe this is an error.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Enter your email to access your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
                disabled={loading || isSubmitting}
              />
            </div>
          </div>
          {/* Password field (commented out for mock simplicity)
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || isSubmitting}
            />
          </div>
          */}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

