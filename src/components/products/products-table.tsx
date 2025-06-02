
"use client";

import type { Product } from "@/lib/schemas/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PackageSearch, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<void>;
  isLoadingDeleteForId?: string | null;
}

export function ProductsTable({ products, onEdit, onDelete, isLoadingDeleteForId }: ProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <PackageSearch className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">Adicione um novo produto para começar a gerenciar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">SKU</TableHead>
            <TableHead className="text-right">Preço (R$)</TableHead>
            <TableHead className="text-center hidden sm:table-cell">Estoque</TableHead>
            <TableHead className="hidden lg:table-cell">Cadastrado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{product.sku}</TableCell>
              <TableCell className="text-right">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
              <TableCell className="text-center hidden sm:table-cell text-sm text-muted-foreground">{product.stock}</TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {product.createdAt instanceof Date ? format(product.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
              </TableCell>
              <TableCell className="text-right space-x-1 sm:space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(product)} aria-label="Editar produto" disabled={!product.id}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={isLoadingDeleteForId === product.id || !product.id} aria-label="Excluir produto">
                      {isLoadingDeleteForId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o produto "{product.name}" (SKU: {product.sku})? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => product.id && await onDelete(product.id)}>
                        Excluir Permanentemente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
