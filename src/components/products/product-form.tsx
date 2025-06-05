
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema, type Product } from "@/lib/schemas/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  onSubmit: (data: Product) => Promise<void>;
  defaultValues?: Partial<Product>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function ProductForm({ onSubmit, defaultValues, isEditing = false, isLoading = false }: ProductFormProps) {
  const form = useForm<Product>({
    resolver: zodResolver(ProductSchema),
    defaultValues: defaultValues || {
      name: "",
      sku: "",
      price: 0,
      stock: 0,
    },
  });

  const handleFormSubmit = async (data: Product) => {
    // Convert SKU to uppercase before submitting
    const productDataWithUppercaseSku = {
      ...data,
      sku: data.sku.toUpperCase(),
    };
    await onSubmit(productDataWithUppercaseSku);
    if (!isEditing && !isLoading) {
      form.reset({ name: "", sku: "", price: 0, stock: 0 });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Película de Vidro 3D" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: PEL-IP13-VID3D" 
                  {...field} 
                  onInput={(e) => { // Optional: force uppercase display as user types
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.toUpperCase();
                    field.onChange(input.value); // Update RHF
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço de Venda (R$)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Ex: 29,90" {...field} 
                  onChange={e => field.onChange(e.target.value.replace('.',','))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estoque Atual</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 50" {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
