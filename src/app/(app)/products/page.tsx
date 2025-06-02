
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Produtos</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Produto
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Gerencie seu inventário de produtos e detalhes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A interface de gerenciamento de produtos estará aqui. (Tabela para peças, acessórios, etc.)</p>
        </CardContent>
      </Card>
    </div>
  );
}
