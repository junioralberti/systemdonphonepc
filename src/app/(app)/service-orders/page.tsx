
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ServiceOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Ordens de Serviço</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Ordem de Serviço
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Ordens de Serviço</CardTitle>
          <CardDescription>Rastreie e gerencie todos os reparos e serviços de dispositivos.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A interface de gerenciamento de ordens de serviço estará aqui. (Lista de OS, status, detalhes do cliente, informações do dispositivo, problema, histórico)</p>
        </CardContent>
      </Card>
    </div>
  );
}
