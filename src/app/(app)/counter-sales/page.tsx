
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanLine, PlusCircle, ShoppingCart } from "lucide-react";

export default function CounterSalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Vendas no Balcão</h1>
         <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" /> Ver Carrinho (0)
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nova Venda</CardTitle>
          <CardDescription>Registre vendas de produtos e acessórios no balcão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Escanear ou inserir SKU do produto" className="flex-grow" />
            <Button variant="outline" size="icon"><ScanLine className="h-5 w-5"/></Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item</Button>
          </div>
          <p className="text-muted-foreground">A interface de registro de vendas estará aqui. (Lista de itens, total, opções de pagamento)</p>
          <div className="flex justify-end">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">Concluir Venda</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
