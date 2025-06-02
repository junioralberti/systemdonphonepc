
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, TruckIcon } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export default function ProvidersPage() {
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]); // Mock data
  
  // Form states for adding a new provider
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderContact, setNewProviderContact] = useState("");
  const [newProviderEmail, setNewProviderEmail] = useState("");
  const [newProviderPhone, setNewProviderPhone] = useState("");

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProviderName) {
      alert("O nome do fornecedor é obrigatório.");
      return;
    }
    const newProvider: Provider = {
      id: Date.now().toString(),
      name: newProviderName,
      contactPerson: newProviderContact,
      email: newProviderEmail,
      phone: newProviderPhone,
    };
    setProviders([...providers, newProvider]);
    setNewProviderName("");
    setNewProviderContact("");
    setNewProviderEmail("");
    setNewProviderPhone("");
    setIsAddProviderDialogOpen(false);
    console.log("Novo fornecedor adicionado (simulado):", newProvider);
  };

  const handleDeleteProvider = (providerId: string) => {
    setProviders(providers.filter(p => p.id !== providerId));
    console.log("Fornecedor excluído (simulado):", providerId);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Fornecedores</h1>
        <Dialog open={isAddProviderDialogOpen} onOpenChange={setIsAddProviderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Fornecedor</DialogTitle>
              <DialogDescription>Preencha os dados do novo fornecedor.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProvider} className="space-y-4 py-4">
              <div>
                <Label htmlFor="providerName">Nome do Fornecedor</Label>
                <Input id="providerName" value={newProviderName} onChange={(e) => setNewProviderName(e.target.value)} placeholder="Ex: Distribuidora Peças Brasil" />
              </div>
              <div>
                <Label htmlFor="providerContact">Pessoa de Contato (Opcional)</Label>
                <Input id="providerContact" value={newProviderContact} onChange={(e) => setNewProviderContact(e.target.value)} placeholder="Ex: Carlos Silva" />
              </div>
              <div>
                <Label htmlFor="providerEmail">E-mail (Opcional)</Label>
                <Input id="providerEmail" type="email" value={newProviderEmail} onChange={(e) => setNewProviderEmail(e.target.value)} placeholder="Ex: contato@pecasbrasil.com" />
              </div>
              <div>
                <Label htmlFor="providerPhone">Telefone (Opcional)</Label>
                <Input id="providerPhone" value={newProviderPhone} onChange={(e) => setNewProviderPhone(e.target.value)} placeholder="Ex: (11) 98765-4321" />
              </div>
              <Button type="submit" className="w-full">Salvar Fornecedor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>Gerencie seus fornecedores de peças e serviços.</CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <TruckIcon className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhum fornecedor encontrado</h3>
              <p className="text-muted-foreground">Adicione um novo fornecedor para começar.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Contato</TableHead>
                    <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{provider.contactPerson || "-"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{provider.email || "-"}</TableCell>
                      <TableCell>{provider.phone || "-"}</TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => alert(`Editar ${provider.name} - funcionalidade pendente`)} aria-label="Editar fornecedor">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteProvider(provider.id)} aria-label="Excluir fornecedor">
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
