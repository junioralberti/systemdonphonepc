
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Loader2, PackageSearch, AlertTriangle } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";
import { ProductsTable } from "@/components/products/products-table";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/services/productService";
import type { Product } from "@/lib/schemas/product";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  useEffect(() => {
    if (productsError) {
      toast({
        title: "Erro ao Carregar Produtos",
        description: "Não foi possível buscar os dados dos produtos. Verifique sua conexão ou tente novamente.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [productsError, toast]);

  const addProductMutation = useMutation({
    mutationFn: (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => addProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produto Adicionado", description: "Novo produto adicionado com sucesso." });
      setIsAddProductDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Falha ao adicionar produto: ${error.message}`, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Product, 'id' | 'createdAt'>> }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Sucesso!", description: "Produto atualizado com sucesso." });
      setIsEditProductDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Falha ao atualizar produto: ${error.message}`, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Sucesso!", description: "Produto excluído com sucesso." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Falha ao excluir produto: ${error.message}`, variant: "destructive" });
    },
  });

  const handleAddProduct = async (data: Product) => {
    const { id, createdAt, updatedAt, ...productData } = data;
    await addProductMutation.mutateAsync(productData);
  };

  const handleUpdateProduct = async (data: Product) => {
    if (!editingProduct || !editingProduct.id) return;
    const { id, createdAt, updatedAt, ...productData } = data;
    await updateProductMutation.mutateAsync({ id: editingProduct.id, data: productData });
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductMutation.mutateAsync(productId);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductDialogOpen(true);
  };
  
  const ProductListSkeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
         <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1.5 w-full">
            <Skeleton className="h-5 w-1/2 rounded" />
            <Skeleton className="h-3 w-1/4 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );

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
            <ProductForm 
              onSubmit={handleAddProduct} 
              isLoading={addProductMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Gerencie seu inventário de produtos e detalhes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
             <ProductListSkeleton />
          ) : productsError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-destructive">
              <AlertTriangle className="h-12 w-12" />
              <p className="text-lg font-medium">Erro ao carregar produtos</p>
              <p className="text-sm text-muted-foreground">{productsError.message}</p>
              <Button onClick={() => refetchProducts()} className="mt-3" disabled={isLoadingProducts}>
                {isLoadingProducts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <ProductsTable 
              products={products || []} 
              onEdit={openEditDialog} 
              onDelete={handleDeleteProduct}
              isLoadingDeleteForId={deleteProductMutation.isPending ? deleteProductMutation.variables : null}
            />
          )}
        </CardContent>
      </Card>

      {editingProduct && (
        <Dialog open={isEditProductDialogOpen} onOpenChange={(isOpen) => {
          setIsEditProductDialogOpen(isOpen);
          if (!isOpen) setEditingProduct(null);
        }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
               <DialogDescription>Atualize os dados do produto selecionado.</DialogDescription>
            </DialogHeader>
            <ProductForm 
              onSubmit={handleUpdateProduct} 
              defaultValues={editingProduct} 
              isEditing 
              isLoading={updateProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
