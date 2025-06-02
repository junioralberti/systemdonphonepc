
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProvidersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Fornecedores</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Fornecedor
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>Gerencie seus fornecedores de peças e serviços.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A interface de gerenciamento de fornecedores estará aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
