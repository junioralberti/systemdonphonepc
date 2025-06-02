
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
          <CardDescription>Gerencie suas informações pessoais. (Funcionalidade pendente)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <Input id="firstName" defaultValue="Admin" className="text-base" disabled />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" defaultValue="User" className="text-base" disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" defaultValue="admin@example.com" className="text-base" disabled />
          </div>
          <Button disabled>Salvar Perfil</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>Gerencie parâmetros gerais do sistema como dados do estabelecimento, preferências de impressão, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Os dados do estabelecimento (nome, endereço, logo, etc.) são gerenciados no <a href="/dashboard" className="text-primary hover:underline">Painel principal</a>.
            Outras configurações do sistema poderão ser adicionadas aqui futuramente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
