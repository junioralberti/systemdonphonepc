
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, PackageSearch } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]); // Mock data for now
  
  // Form states for adding a new product
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (can be expanded)
    if (!newProductName || !newProductSku || !newProductPrice || !newProductStock) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    const newProduct: Product = {
      id: Date.now().toString(), // simple unique id
      name: newProductName,
      sku: newProductSku,
      price: parseFloat(newProductPrice),
      stock: parseInt(newProductStock, 10),
    };
    setProducts([...products, newProduct]);
    // Reset form and close dialog
    setNewProductName("");
    setNewProductSku("");
    setNewProductPrice("");
    setNewProductStock("");
    setIsAddProductDialogOpen(false);
    // In a real app, you would call a service to save to Firestore here
    console.log("Novo produto adicionado (simulado):", newProduct);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    // In a real app, call service to delete from Firestore
    console.log("Produto excluído (simulado):", productId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Produtos</h1>
        <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
              <DialogDescription>Preencha os detalhes do novo produto.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 py-4">
              <div>
                <Label htmlFor="productName">Nome do Produto</Label>
                <Input id="productName" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Ex: Película de Vidro 3D" />
              </div>
              <div>
                <Label htmlFor="productSku">SKU</Label>
                <Input id="productSku" value={newProductSku} onChange={(e) => setNewProductSku(e.target.value)} placeholder="Ex: PEL-IP13-VID3D" />
              </div>
              <div>
                <Label htmlFor="productPrice">Preço de Venda (R$)</Label>
                <Input id="productPrice" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="Ex: 29.90" />
              </div>
               <div>
                <Label htmlFor="productStock">Estoque Atual</Label>
                <Input id="productStock" type="number" value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} placeholder="Ex: 50" />
              </div>
              <Button type="submit" className="w-full">Salvar Produto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Gerencie seu inventário de produtos e detalhes.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
             <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <PackageSearch className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">Adicione um novo produto para começar a gerenciar.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">SKU</TableHead>
                    <TableHead>Preço (R$)</TableHead>
                    <TableHead className="hidden sm:table-cell">Estoque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{product.sku}</TableCell>
                      <TableCell>{product.price.toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => alert(`Editar ${product.name} - funcionalidade pendente`)} aria-label="Editar produto">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)} aria-label="Excluir produto">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
