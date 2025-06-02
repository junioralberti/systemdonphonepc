
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableSummaryFooter } from "@/components/ui/table";
import { ScanLine, PlusCircle, ShoppingCart, Trash2, MinusCircle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string; // SKU or product ID
  name: string;
  quantity: number;
  price: number;
}

export default function CounterSalesPage() {
  const [skuInput, setSkuInput] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!skuInput.trim()) {
      toast({ title: "Entrada Inválida", description: "Por favor, insira ou escaneie um SKU.", variant: "destructive" });
      return;
    }

    // Mock product lookup based on SKU
    // In a real app, this would fetch product details from a service
    const mockProduct = {
      id: skuInput.trim().toUpperCase(),
      name: `Produto ${skuInput.trim().toUpperCase()}`,
      price: Math.floor(Math.random() * 100) + 10, // Random price between 10-110
    };

    const existingItemIndex = cartItems.findIndex(item => item.id === mockProduct.id);

    if (existingItemIndex > -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { ...mockProduct, quantity: 1 }]);
    }
    setSkuInput("");
    toast({ title: "Item Adicionado", description: `${mockProduct.name} adicionado ao carrinho.` });
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity becomes 0 or less
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({ title: "Item Removido", description: "Item removido do carrinho.", variant: "destructive" });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      toast({ title: "Carrinho Vazio", description: "Adicione itens ao carrinho antes de concluir a venda.", variant: "destructive" });
      return;
    }
    console.log("Venda concluída (simulado):", cartItems, "Total:", calculateTotal().toFixed(2));
    toast({ title: "Venda Concluída!", description: `Total: R$ ${calculateTotal().toFixed(2)}`});
    setCartItems([]); // Clear cart
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Vendas no Balcão</h1>
         <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" /> Ver Carrinho ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nova Venda</CardTitle>
          <CardDescription>Registre vendas de produtos e acessórios no balcão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Escanear ou inserir SKU do produto" 
              className="flex-grow" 
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddItem(); }}
            />
            <Button variant="outline" size="icon" onClick={() => alert("Funcionalidade de scanner pendente")} aria-label="Escanear produto">
              <ScanLine className="h-5 w-5"/>
            </Button>
            <Button onClick={handleAddItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
              <p>Nenhum item no carrinho.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="w-[150px] text-center">Quantidade</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Preço Unit. (R$)</TableHead>
                    <TableHead className="text-right">Subtotal (R$)</TableHead>
                    <TableHead className="w-[50px] text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, -1)}>
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, 1)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                 <TableSummaryFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="hidden sm:table-cell"></TableCell>
                    <TableCell className="sm:hidden text-right font-semibold">Total:</TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-semibold">Total:</TableCell>
                    <TableCell className="text-right font-bold text-lg">{calculateTotal().toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableSummaryFooter>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
            <Button size="lg" onClick={handleCompleteSale} disabled={cartItems.length === 0}>
              <DollarSign className="mr-2 h-5 w-5" /> Concluir Venda
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
