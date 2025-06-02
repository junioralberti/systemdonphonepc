
"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, FileText, Printer, UserPlus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Definindo os tipos explicitamente para clareza
type ServiceOrderStatus = "Aberta" | "Em andamento" | "Aguardando peça" | "Concluída" | "Entregue" | "Cancelada";
const serviceOrderStatuses: ServiceOrderStatus[] = ["Aberta", "Em andamento", "Aguardando peça", "Concluída", "Entregue", "Cancelada"];

type DeviceType = "Celular" | "Notebook" | "Tablet" | "Placa" | "Outro";
const deviceTypes: DeviceType[] = ["Celular", "Notebook", "Tablet", "Placa", "Outro"];

// Mock: Lista de técnicos
const mockTechnicians = [
  { id: "tech1", name: "Carlos Silva" },
  { id: "tech2", name: "Ana Pereira" },
  { id: "tech3", name: "Roberto Alves" },
];


interface ServiceOrder {
  id: string; // ID interno único, usado como key
  osNumber: string; // Número da OS visível (Ex: OS #00123)
  openingDate: string; // Data/hora automático
  deliveryForecastDate?: string; // Definido pelo técnico
  status: ServiceOrderStatus;
  responsibleTechnicianId?: string;

  // Dados do Cliente
  clientName: string; // Nome do cliente (entrada direta por enquanto)
  clientCpfCnpj?: string;
  clientPhone?: string;
  clientEmail?: string;
  // Endereço do cliente viria de um objeto Cliente selecionado, omitido por ora da OS direta

  // Informações do Aparelho
  deviceType?: DeviceType;
  deviceBrandModel: string;
  deviceImeiSerial?: string;
  deviceColor?: string;
  deviceAccessories?: string; // Ex: Fonte, cabo, fone, capinha

  // Problemas e Diagnóstico
  problemReportedByClient: string;
  technicalDiagnosis?: string; // Preenchido pelo técnico
  internalObservations?: string; // Ex: Aguardando cliente aprovar orçamento

  // Serviços e Peças (simplificado para Textarea por enquanto)
  servicesPerformedDescription?: string;
  partsUsedDescription?: string;

  // Campos originais para compatibilidade, se necessário, mas idealmente usar os novos
  // creationDate: string; // Substituído por openingDate
  // problemDescription: string; // Substituído por problemReportedByClient
  // deviceModel: string; // Substituído por deviceBrandModel
}

export default function ServiceOrdersPage() {
  const [isNewServiceOrderDialogOpen, setIsNewServiceOrderDialogOpen] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  
  // Estados para o formulário de nova OS
  const [osNumber, setOsNumber] = useState(""); // Será automático
  const [openingDate, setOpeningDate] = useState(""); // Será automático
  const [deliveryForecastDate, setDeliveryForecastDate] = useState("");
  const [status, setStatus] = useState<ServiceOrderStatus>("Aberta");
  const [responsibleTechnicianId, setResponsibleTechnicianId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientCpfCnpj, setClientCpfCnpj] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [deviceType, setDeviceType] = useState<DeviceType | undefined>(undefined);
  const [deviceBrandModel, setDeviceBrandModel] = useState("");
  const [deviceImeiSerial, setDeviceImeiSerial] = useState("");
  const [deviceColor, setDeviceColor] = useState("");
  const [deviceAccessories, setDeviceAccessories] = useState("");
  
  const [problemReportedByClient, setProblemReportedByClient] = useState("");
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState("");
  const [internalObservations, setInternalObservations] = useState("");

  const [servicesPerformedDescription, setServicesPerformedDescription] = useState("");
  const [partsUsedDescription, setPartsUsedDescription] = useState("");

  const resetFormFields = () => {
    setDeliveryForecastDate("");
    setStatus("Aberta");
    setResponsibleTechnicianId("");
    setClientName("");
    setClientCpfCnpj("");
    setClientPhone("");
    setClientEmail("");
    setDeviceType(undefined);
    setDeviceBrandModel("");
    setDeviceImeiSerial("");
    setDeviceColor("");
    setDeviceAccessories("");
    setProblemReportedByClient("");
    setTechnicalDiagnosis("");
    setInternalObservations("");
    setServicesPerformedDescription("");
    setPartsUsedDescription("");
  };

  const handleCreateServiceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!clientName || !deviceBrandModel || !problemReportedByClient) {
      alert("Os campos Cliente, Modelo do Aparelho e Defeito Informado são obrigatórios.");
      return;
    }

    const newOsNumber = `OS-${Date.now().toString().slice(-6)}`;
    const newOpeningDate = new Date().toLocaleString('pt-BR');

    const newOrder: ServiceOrder = {
      id: newOsNumber, // Usando osNumber como ID único por simplicidade aqui
      osNumber: newOsNumber,
      openingDate: newOpeningDate,
      deliveryForecastDate,
      status,
      responsibleTechnicianId,
      clientName,
      clientCpfCnpj,
      clientPhone,
      clientEmail,
      deviceType,
      deviceBrandModel,
      deviceImeiSerial,
      deviceColor,
      deviceAccessories,
      problemReportedByClient,
      technicalDiagnosis,
      internalObservations,
      servicesPerformedDescription,
      partsUsedDescription,
    };
    setServiceOrders([...serviceOrders, newOrder]);
    resetFormFields();
    setIsNewServiceOrderDialogOpen(false);
    console.log("Nova ordem de serviço criada (simulada):", newOrder);
  };

  const handleDeleteServiceOrder = (orderId: string) => {
    setServiceOrders(serviceOrders.filter(os => os.id !== orderId));
    console.log("Ordem de serviço excluída (simulada):", orderId);
  };

  const handlePrintOS = (order: ServiceOrder) => {
    console.log("Simulando impressão da OS:", order);
    // Em uma implementação real, aqui você geraria um PDF ou abriria uma nova aba com os dados formatados para impressão.
    alert(`Simulando impressão da OS: ${order.osNumber}\nCliente: ${order.clientName}\nEm breve esta funcionalidade abrirá uma via para impressão.`);
  };
  
  const getStatusColor = (status: ServiceOrderStatus) => {
    switch (status) {
      case "Aberta": return "bg-yellow-100 text-yellow-700";
      case "Em andamento": return "bg-blue-100 text-blue-700";
      case "Aguardando peça": return "bg-orange-100 text-orange-700";
      case "Concluída": return "bg-green-100 text-green-700";
      case "Entregue": return "bg-teal-100 text-teal-700";
      case "Cancelada": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Ordens de Serviço</h1>
        <Dialog open={isNewServiceOrderDialogOpen} onOpenChange={(isOpen) => {
          setIsNewServiceOrderDialogOpen(isOpen);
          if (!isOpen) resetFormFields();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Ordem de Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl md:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              <DialogDescription>Preencha os dados para registrar uma nova O.S.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateServiceOrder}>
              <ScrollArea className="h-[70vh] p-1 pr-3">
                <div className="space-y-6 p-2">
                  {/* Campos Gerais da OS */}
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Dados Gerais da OS</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="osNumber">Número da OS</Label>
                          <Input id="osNumber" value={`OS-${Date.now().toString().slice(-6)}`} disabled className="bg-muted/50" />
                        </div>
                        <div>
                          <Label htmlFor="osOpeningDate">Data de Abertura</Label>
                          <Input id="osOpeningDate" value={new Date().toLocaleString('pt-BR')} disabled className="bg-muted/50" />
                        </div>
                        <div>
                          <Label htmlFor="osDeliveryForecast">Previsão de Entrega</Label>
                          <Input id="osDeliveryForecast" type="date" value={deliveryForecastDate} onChange={(e) => setDeliveryForecastDate(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="osStatus">Status da OS</Label>
                          <Select value={status} onValueChange={(value: ServiceOrderStatus) => setStatus(value)}>
                            <SelectTrigger id="osStatus"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                            <SelectContent>
                              {serviceOrderStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="osTechnician">Técnico Responsável</Label>
                           <Select value={responsibleTechnicianId} onValueChange={setResponsibleTechnicianId}>
                            <SelectTrigger id="osTechnician"><SelectValue placeholder="Selecione um técnico" /></SelectTrigger>
                            <SelectContent>
                              {mockTechnicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dados do Cliente */}
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Dados do Cliente</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-1">
                        <Label htmlFor="osClientName">Cliente (Nome Completo)</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="osClientName" 
                                value={clientName} 
                                onChange={(e) => setClientName(e.target.value)} 
                                placeholder="Digite o nome do cliente para buscar..."
                                required 
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => alert("Funcionalidade de busca/cadastro rápido de cliente pendente.")} aria-label="Buscar ou Cadastrar Cliente">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Busca de clientes existentes e cadastro rápido serão implementados.</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="osClientCpfCnpj">CPF/CNPJ (Opcional)</Label>
                            <Input id="osClientCpfCnpj" value={clientCpfCnpj} onChange={(e) => setClientCpfCnpj(e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0001-00" />
                        </div>
                        <div>
                            <Label htmlFor="osClientPhone">Telefone/WhatsApp (Opcional)</Label>
                            <Input id="osClientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(00) 00000-0000" />
                        </div>
                       </div>
                       <div>
                        <Label htmlFor="osClientEmail">E-mail (Opcional)</Label>
                        <Input id="osClientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="cliente@email.com" />
                       </div>
                    </CardContent>
                  </Card>

                  {/* Informações do Aparelho */}
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Informações do Aparelho</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="osDeviceType">Tipo de Aparelho</Label>
                          <Select value={deviceType} onValueChange={(value: DeviceType) => setDeviceType(value)}>
                            <SelectTrigger id="osDeviceType"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                              {deviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="osDeviceBrandModel">Marca/Modelo</Label>
                          <Input id="osDeviceBrandModel" value={deviceBrandModel} onChange={(e) => setDeviceBrandModel(e.target.value)} placeholder="Ex: Samsung A20, iPhone 11" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="osDeviceImeiSerial">IMEI / Número de Série (Opcional)</Label>
                          <Input id="osDeviceImeiSerial" value={deviceImeiSerial} onChange={(e) => setDeviceImeiSerial(e.target.value)} placeholder="IMEI ou N/S" />
                        </div>
                        <div>
                          <Label htmlFor="osDeviceColor">Cor (Opcional)</Label>
                          <Input id="osDeviceColor" value={deviceColor} onChange={(e) => setDeviceColor(e.target.value)} placeholder="Ex: Preto, Azul" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="osDeviceAccessories">Acessórios Recebidos (Opcional)</Label>
                        <Input id="osDeviceAccessories" value={deviceAccessories} onChange={(e) => setDeviceAccessories(e.target.value)} placeholder="Ex: Fonte, cabo, fone, capinha" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Problemas e Diagnóstico */}
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Problemas e Diagnóstico</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="osProblemReported">Defeito Informado pelo Cliente</Label>
                        <Textarea 
                          id="osProblemReported" 
                          value={problemReportedByClient} 
                          onChange={(e) => setProblemReportedByClient(e.target.value)} 
                          placeholder="Ex: Não liga, tela quebrada, bateria viciada..."
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="osTechnicalDiagnosis">Diagnóstico Técnico (Opcional)</Label>
                        <Textarea id="osTechnicalDiagnosis" value={technicalDiagnosis} onChange={(e) => setTechnicalDiagnosis(e.target.value)} placeholder="Detalhes do diagnóstico técnico..." rows={3} />
                      </div>
                       <div>
                        <Label htmlFor="osInternalObservations">Observações Internas (Opcional)</Label>
                        <Textarea id="osInternalObservations" value={internalObservations} onChange={(e) => setInternalObservations(e.target.value)} placeholder="Notas internas, ex: aguardando aprovação do orçamento..." rows={2} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Serviços Executados e Peças Utilizadas (Simplificado) */}
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Serviços e Peças</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="osServicesPerformed">Serviços Executados (Descrição)</Label>
                            <Textarea id="osServicesPerformed" value={servicesPerformedDescription} onChange={(e) => setServicesPerformedDescription(e.target.value)} placeholder="Descreva os serviços realizados..." rows={3} />
                             <p className="text-xs text-muted-foreground mt-1">Lista detalhada de serviços (com nome, valor, qtd) será implementada futuramente.</p>
                        </div>
                        <div>
                            <Label htmlFor="osPartsUsed">Produtos/Peças Utilizadas (Descrição)</Label>
                            <Textarea id="osPartsUsed" value={partsUsedDescription} onChange={(e) => setPartsUsedDescription(e.target.value)} placeholder="Liste as peças utilizadas..." rows={3} />
                            <p className="text-xs text-muted-foreground mt-1">Lista detalhada de peças (com nome, valor, qtd) será implementada futuramente.</p>
                        </div>
                    </CardContent>
                  </Card>

                </div>
              </ScrollArea>
              <DialogFooter className="border-t pt-6 mt-6 pr-4 flex flex-col sm:flex-row justify-between items-center w-full">
                <Button type="button" variant="outline" onClick={() => handlePrintOS({
                    id: "PREVIEW", // ID temporário para preview
                    osNumber: `OS-${Date.now().toString().slice(-6)}` , openingDate: new Date().toLocaleString('pt-BR'),
                    clientName, deviceBrandModel, problemReportedByClient, status, // Incluindo alguns dados para a simulação de impressão
                    deliveryForecastDate, responsibleTechnicianId, clientCpfCnpj, clientPhone, clientEmail,
                    deviceType, deviceImeiSerial, deviceColor, deviceAccessories, technicalDiagnosis, internalObservations,
                    servicesPerformedDescription, partsUsedDescription
                })}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimir OS (Via Cliente)
                </Button>
                <div className="flex gap-2 mt-4 sm:mt-0">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Criar O.S.</Button>
                </div>
              </DialogFooter>
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
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Aparelho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Abertura</TableHead>
                    <TableHead className="hidden lg:table-cell">Previsão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceOrders.map((os) => (
                    <TableRow key={os.id}>
                      <TableCell className="font-medium">{os.osNumber}</TableCell>
                      <TableCell>{os.clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{os.deviceBrandModel}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(os.status)}`}>
                          {os.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{os.openingDate}</TableCell>
                      <TableCell className="hidden lg:table-cell">{os.deliveryForecastDate || "N/D"}</TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => alert(`Visualizar/Editar OS ${os.osNumber} - funcionalidade pendente`)} aria-label="Editar ordem de serviço">
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

    

