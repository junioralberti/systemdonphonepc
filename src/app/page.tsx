
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { UserForm } from '@/components/users/user-form';
import { addUser } from '@/services/userService';
import type { User, UserRole } from '@/lib/schemas/user';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

// Definindo o tipo para os dados que serão realmente salvos no Firestore, omitindo a senha e campos de controle.
type UserDataToSave = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password' | 'confirmPassword'>;

// Tipo para usuários mockados armazenados no localStorage (incluindo a senha para o mock)
interface MockStoredUser extends UserDataToSave {
  password?: string; // Senha em texto plano, APENAS PARA MOCK
}

export default function LoginPage() {
  const [email, setEmail] = useState('teste@donphone.com');
  const [password, setPassword] = useState('Bettina03*');
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email === 'teste@donphone.com' && password === 'Bettina03*') {
      login('admin');
    } else {
      // Verificar usuários mockados no localStorage
      const storedMockUsersString = localStorage.getItem('mock_users');
      const mockUsers: MockStoredUser[] = storedMockUsersString ? JSON.parse(storedMockUsersString) : [];
      
      const matchedUser = mockUsers.find(u => u.email === email && u.password === password);

      if (matchedUser) {
        login(matchedUser.role as 'admin' | 'user' || 'user'); // Usa a role armazenada ou 'user'
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    }
  };

  const addUserMutation = useMutation({
    mutationFn: (userData: { firestoreData: UserDataToSave, formData: User }) => addUser(userData.firestoreData),
    onSuccess: (docId, variables) => { // O segundo argumento 'variables' contém o que foi passado para mutateAsync
      const { firestoreData, formData } = variables;
      toast({
        title: "Cadastro Realizado!",
        description: "Seu usuário foi criado com sucesso. Agora você pode fazer login.",
        variant: "default"
      });

      // Armazenar no localStorage para o mock de login
      const storedMockUsersString = localStorage.getItem('mock_users');
      const mockUsers: MockStoredUser[] = storedMockUsersString ? JSON.parse(storedMockUsersString) : [];
      
      mockUsers.push({ 
        email: firestoreData.email, 
        password: formData.password, // Usar a senha do formulário original
        name: firestoreData.name,
        role: firestoreData.role 
      });
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      
      setIsRegisterDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no Cadastro",
        description: `Não foi possível criar o usuário: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  const handleRegisterUser = async (formData: User) => {
    // 'formData' é o que vem do UserForm, incluindo password e confirmPassword
    const { id, createdAt, updatedAt, password, confirmPassword, ...userDataToSave } = formData;
    
    // Para novos registros via este formulário, a role será 'user' por padrão,
    // a menos que o UserForm permita alterá-la (o que não é o caso para o cadastro público).
    const firestoreData: UserDataToSave = { ...userDataToSave, role: formData.role || 'user' };
    
    // Passamos ambos: dados para o Firestore e dados do formulário (para pegar a senha para o localStorage)
    await addUserMutation.mutateAsync({ firestoreData, formData });
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4">
            <Image
              src="/donphone-logo.png"
              alt="DonPhone Logo"
              width={48} 
              height={48}
              data-ai-hint="company logo"
              className="mx-auto"
            />
          </div>
          <CardTitle className="font-headline text-3xl">Sistema DonPhone</CardTitle>
          <CardDescription>Por favor, entre para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro de Login</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
          <div className="mt-4 text-center">
            <Button
              variant="link"
              type="button"
              onClick={() => setIsRegisterDialogOpen(true)}
              className="text-sm px-0"
            >
              Cadastrar Novo Usuário
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sistema DonPhone.
          </p>
        </CardFooter>
      </Card>

      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha seus dados para criar uma conta. Após o cadastro, faça login normalmente.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleRegisterUser}
            isLoading={addUserMutation.isPending}
            // Não passamos 'isEditing' pois este é um formulário de adição
            // O UserForm padrão terá o campo role 'user' por default.
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
