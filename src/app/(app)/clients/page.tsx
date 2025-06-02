
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Clientes</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Cliente
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gerencie seus clientes existentes ou adicione novos.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A interface de gerenciamento de clientes estará aqui. (Tabela, busca, filtros, ações de editar/excluir)</p>
          {/* Placeholder for client table or list */}
        </CardContent>
      </Card>
    </div>
  );
}
