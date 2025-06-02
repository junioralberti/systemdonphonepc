
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, Wrench, FileText } from "lucide-react";

interface ServiceOrder {
  id: string;
  clientName: string;
  deviceModel: string;
  problemDescription: string;
  status: "Pendente" | "Em Análise" | "Aguardando Peças" | "Em Reparo" | "Concluído" | "Cancelado";
  creationDate: string;
}

export default function ServiceOrdersPage() {
  const [isNewServiceOrderDialogOpen, setIsNewServiceOrderDialogOpen] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]); // Mock data
  
  // Form states for new service order
  const [clientName, setClientName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  const handleCreateServiceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !deviceModel || !problemDescription) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const newOrder: ServiceOrder = {
      id: `OS-${Date.now().toString().slice(-6)}`, // Simple unique OS ID
      clientName,
      deviceModel,
      problemDescription,
      status: "Pendente",
      creationDate: new Date().toLocaleDateString('pt-BR'),
    };
    setServiceOrders([...serviceOrders, newOrder]);
    setClientName("");
    setDeviceModel("");
    setProblemDescription("");
    setIsNewServiceOrderDialogOpen(false);
    console.log("Nova ordem de serviço criada (simulada):", newOrder);
  };

  const handleDeleteServiceOrder = (orderId: string) => {
    setServiceOrders(serviceOrders.filter(os => os.id !== orderId));
    console.log("Ordem de serviço excluída (simulada):", orderId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Ordens de Serviço</h1>
        <Dialog open={isNewServiceOrderDialogOpen} onOpenChange={setIsNewServiceOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Ordem de Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              <DialogDescription>Preencha os dados para registrar uma nova O.S.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateServiceOrder} className="space-y-4 py-4">
              <div>
                <Label htmlFor="osClientName">Nome do Cliente</Label>
                <Input id="osClientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: João da Silva" />
              </div>
              <div>
                <Label htmlFor="osDeviceModel">Modelo do Aparelho</Label>
                <Input id="osDeviceModel" value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} placeholder="Ex: iPhone 12, Galaxy S20" />
              </div>
              <div>
                <Label htmlFor="osProblemDescription">Descrição do Problema</Label>
                <Textarea 
                  id="osProblemDescription" 
                  value={problemDescription} 
                  onChange={(e) => setProblemDescription(e.target.value)} 
                  placeholder="Ex: Tela quebrada, não liga, bateria viciada..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Criar O.S.</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Ordens de Serviço</CardTitle>
          <CardDescription>Rastreie e gerencie todos os reparos e serviços de dispositivos.</CardDescription>
        </CardHeader>
        <CardContent>
          {serviceOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhuma ordem de serviço encontrada</h3>
              <p className="text-muted-foreground">Crie uma nova O.S. para começar.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Aparelho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceOrders.map((os) => (
                    <TableRow key={os.id}>
                      <TableCell className="font-medium">{os.id}</TableCell>
                      <TableCell>{os.clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{os.deviceModel}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          os.status === "Concluído" ? "bg-green-100 text-green-700" :
                          os.status === "Cancelado" ? "bg-red-100 text-red-700" :
                          os.status === "Pendente" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {os.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{os.creationDate}</TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => alert(`Visualizar/Editar OS ${os.id} - funcionalidade pendente`)} aria-label="Editar ordem de serviço">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteServiceOrder(os.id)} aria-label="Excluir ordem de serviço">
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
