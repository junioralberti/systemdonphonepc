
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('teste@donphone.com');
  const [password, setPassword] = useState('senha123');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here
    // For this mock, any input "logs in" as admin.
    login('admin'); 
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4 rounded-md bg-primary p-2 text-primary-foreground inline-block">
            <Image 
              src="/donphone-logo.png" 
              alt="DonPhone Logo" 
              width={48} 
              height={48} 
              data-ai-hint="company logo" 
            />
          </div>
          <CardTitle className="font-headline text-3xl">Sistema DonPhone</CardTitle>
          <CardDescription>Por favor, entre para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base">
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sistema DonPhone.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
