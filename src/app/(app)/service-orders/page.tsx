
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, FileText, Printer, UserPlus, Search, MinusCircle, ShoppingCart, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Definindo os tipos explicitamente para clareza
type ServiceOrderStatus = "Aberta" | "Em andamento" | "Aguardando peça" | "Concluída" | "Entregue" | "Cancelada";
const serviceOrderStatuses: ServiceOrderStatus[] = ["Aberta", "Em andamento", "Aguardando peça", "Concluída", "Entregue", "Cancelada"];

type DeviceType = "Celular" | "Notebook" | "Tablet" | "Placa" | "Outro";
const deviceTypes: DeviceType[] = ["Celular", "Notebook", "Tablet", "Placa", "Outro"];

interface SoldProductItem {
  tempId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ServiceOrder {
  id: string; // ID interno único, usado como key
  osNumber: string; // Número da OS visível (Ex: OS #00123)
  openingDate: string; // Data/hora automático
  deliveryForecastDate?: string; // Definido pelo técnico
  status: ServiceOrderStatus;
  responsibleTechnicianName?: string; // Alterado de Id para Name

  // Dados do Cliente
  clientName: string; 
  clientCpfCnpj?: string;
  clientPhone?: string;
  clientEmail?: string;
  
  // Informações do Aparelho
  deviceType?: DeviceType;
  deviceBrandModel: string;
  deviceImeiSerial?: string;
  deviceColor?: string;
  deviceAccessories?: string; 

  // Problemas e Diagnóstico
  problemReportedByClient: string;
  technicalDiagnosis?: string; 
  internalObservations?: string; 

  // Serviços e Peças
  servicesPerformedDescription?: string;
  partsUsedDescription?: string;
  
  // Novos campos de valor
  serviceManualValue?: number;
  additionalSoldProducts?: SoldProductItem[];
  grandTotalValue?: number;
}

export default function ServiceOrdersPage() {
  const [isNewServiceOrderDialogOpen, setIsNewServiceOrderDialogOpen] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const { toast } = useToast();
  
  // Estados para o formulário de nova OS
  const [osNumber, setOsNumber] = useState(""); 
  const [openingDate, setOpeningDate] = useState(""); 
  const [deliveryForecastDate, setDeliveryForecastDate] = useState("");
  const [status, setStatus] = useState<ServiceOrderStatus>("Aberta");
  const [responsibleTechnicianName, setResponsibleTechnicianName] = useState(""); // Alterado de Id para Name

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

  // Novos estados para valores e produtos adicionais
  const [serviceManualValueInput, setServiceManualValueInput] = useState("");
  const [soldProductsList, setSoldProductsList] = useState<SoldProductItem[]>([]);
  const [currentProductNameInput, setCurrentProductNameInput] = useState("");
  const [currentProductQtyInput, setCurrentProductQtyInput] = useState("1");
  const [currentProductPriceInput, setCurrentProductPriceInput] = useState("");
  const [grandTotalDisplay, setGrandTotalDisplay] = useState("0.00");


  const resetFormFields = () => {
    setDeliveryForecastDate("");
    setStatus("Aberta");
    setResponsibleTechnicianName(""); // Alterado de Id para Name
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
    setServiceManualValueInput("");
    setSoldProductsList([]);
    setCurrentProductNameInput("");
    setCurrentProductQtyInput("1");
    setCurrentProductPriceInput("");
    setGrandTotalDisplay("0.00");
  };

  const handleAddSoldProduct = () => {
    const name = currentProductNameInput.trim();
    const quantity = parseInt(currentProductQtyInput, 10);
    const unitPrice = parseFloat(currentProductPriceInput.replace(',', '.'));

    if (!name || isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice <= 0) {
      toast({
        title: "Produto Inválido",
        description: "Por favor, preencha nome, quantidade válida e preço válido para o produto.",
        variant: "destructive",
      });
      return;
    }

    const newProduct: SoldProductItem = {
      tempId: `prod-${Date.now()}`,
      name,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    };
    setSoldProductsList(prev => [...prev, newProduct]);
    setCurrentProductNameInput("");
    setCurrentProductQtyInput("1");
    setCurrentProductPriceInput("");
    toast({ title: "Produto Adicionado", description: `${name} adicionado à OS.`});
  };

  const handleRemoveSoldProduct = (tempId: string) => {
    setSoldProductsList(prev => prev.filter(p => p.tempId !== tempId));
     toast({ title: "Produto Removido", description: "Produto removido da OS.", variant: "destructive" });
  };

  useEffect(() => {
    const serviceValue = parseFloat(serviceManualValueInput.replace(',', '.')) || 0;
    const productsTotal = soldProductsList.reduce((sum, prod) => sum + prod.totalPrice, 0);
    const currentGrandTotal = serviceValue + productsTotal;
    setGrandTotalDisplay(currentGrandTotal.toFixed(2).replace('.', ','));
  }, [serviceManualValueInput, soldProductsList]);


  const handleCreateServiceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!clientName || !deviceBrandModel || !problemReportedByClient) {
       toast({
        title: "Campos Obrigatórios",
        description: "Cliente, Modelo do Aparelho e Defeito Informado são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newOsNumber = `OS-${Date.now().toString().slice(-6)}`;
    const newOpeningDate = new Date().toLocaleString('pt-BR');
    const serviceValueNum = parseFloat(serviceManualValueInput.replace(',', '.')) || 0;
    const grandTotalNum = parseFloat(grandTotalDisplay.replace(',', '.')) || 0;

    const newOrder: ServiceOrder = {
      id: newOsNumber, 
      osNumber: newOsNumber,
      openingDate: newOpeningDate,
      deliveryForecastDate,
      status,
      responsibleTechnicianName, // Alterado de Id para Name
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
      serviceManualValue: serviceValueNum,
      additionalSoldProducts: soldProductsList,
      grandTotalValue: grandTotalNum,
    };
    setServiceOrders([...serviceOrders, newOrder]);
    toast({ title: "O.S. Criada!", description: `A Ordem de Serviço ${newOsNumber} foi registrada.`});
    resetFormFields();
    setIsNewServiceOrderDialogOpen(false);
    console.log("Nova ordem de serviço criada (simulada):", newOrder);
  };

  const handleDeleteServiceOrder = (orderId: string) => {
    setServiceOrders(serviceOrders.filter(os => os.id !== orderId));
    toast({ title: "O.S. Excluída", description: `A Ordem de Serviço ${orderId} foi excluída.`, variant: "destructive"});
    console.log("Ordem de serviço excluída (simulada):", orderId);
  };

  const handlePrintOS = (order: Partial<ServiceOrder>) => {
    console.log("Simulando impressão da OS:", order);
        
    let printContent = `----------------------------------------\n`;
    printContent += `       ORDEM DE SERVIÇO: ${order.osNumber}\n`;
    printContent += `----------------------------------------\n`;
    printContent += `Data Abertura: ${order.openingDate}\n`;
    if(order.deliveryForecastDate) {
      const dateParts = order.deliveryForecastDate.split('-'); // yyyy-mm-dd
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      printContent += `Previsão Entrega: ${formattedDate}\n`;
    }
    printContent += `Status: ${order.status}\n`;
    if(order.responsibleTechnicianName) { // Alterado de Id para Name
        printContent += `Técnico: ${order.responsibleTechnicianName}\n`; // Usar diretamente o nome
    }
    printContent += `\n--- Cliente ---\n`;
    printContent += `Nome: ${order.clientName}\n`;
    if(order.clientCpfCnpj) printContent += `CPF/CNPJ: ${order.clientCpfCnpj}\n`;
    if(order.clientPhone) printContent += `Telefone: ${order.clientPhone}\n`;
    if(order.clientEmail) printContent += `E-mail: ${order.clientEmail}\n`;
    
    printContent += `\n--- Aparelho ---\n`;
    if(order.deviceType) printContent += `Tipo: ${order.deviceType}\n`;
    printContent += `Marca/Modelo: ${order.deviceBrandModel}\n`;
    if(order.deviceImeiSerial) printContent += `IMEI/Série: ${order.deviceImeiSerial}\n`;
    if(order.deviceColor) printContent += `Cor: ${order.deviceColor}\n`;
    if(order.deviceAccessories) printContent += `Acessórios: ${order.deviceAccessories}\n`;

    printContent += `\n--- Problema ---\n`;
    printContent += `Relatado: ${order.problemReportedByClient}\n`;
    if(order.technicalDiagnosis) printContent += `Diagnóstico Técnico: ${order.technicalDiagnosis}\n`;
    
    if(order.servicesPerformedDescription || order.partsUsedDescription) {
      printContent += `\n--- Serviços e Peças ---\n`;
      if(order.servicesPerformedDescription) printContent += `Serviços: ${order.servicesPerformedDescription}\n`;
      if(order.partsUsedDescription) printContent += `Peças: ${order.partsUsedDescription}\n`;
    }

    if(order.serviceManualValue !== undefined && order.serviceManualValue > 0) {
        printContent += `\nValor do Serviço: R$ ${order.serviceManualValue.toFixed(2).replace('.', ',')}\n`;
    }

    if (order.additionalSoldProducts && order.additionalSoldProducts.length > 0) {
        printContent += `\n--- Produtos Adicionais ---\n`;
        order.additionalSoldProducts.forEach(prod => {
            printContent += `${prod.name} (Qtd: ${prod.quantity}, Unit: R$ ${prod.unitPrice.toFixed(2).replace('.', ',')}) = R$ ${prod.totalPrice.toFixed(2).replace('.', ',')}\n`;
        });
    }
    
    printContent += `\n----------------------------------------\n`;
    printContent += `VALOR TOTAL: R$ ${order.grandTotalValue?.toFixed(2).replace('.', ',') || '0,00'}\n`;
    printContent += `----------------------------------------\n`;
    if(order.internalObservations) printContent += `\nObs. Internas: ${order.internalObservations}\n`;

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write('<html lang="pt-BR"><head><title>Imprimir OS</title>');
        printWindow.document.write('<style> body { font-family: "Courier New", Courier, monospace; white-space: pre-wrap; line-height: 1.4; font-size: 10pt; margin: 20px;} table { width: 100%; border-collapse: collapse; margin-bottom: 10px;} th, td { border: 1px solid #ccc; padding: 4px; text-align: left;} .total { font-weight: bold; } </style>');
        
        let htmlContent = `<pre>${printContent}</pre>`; 
        
        printWindow.document.write('</head><body>');
        printWindow.document.write(htmlContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus(); 
        
        setTimeout(() => {
          printWindow.print();
        }, 500);

    } else {
        alert("Por favor, desabilite o bloqueador de pop-ups para imprimir.");
        console.log("Conteúdo da Impressão:\n", printContent);
    }
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
          <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              <DialogDescription>Preencha os dados para registrar uma nova O.S.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateServiceOrder}>
              <ScrollArea className="h-[75vh] p-1 pr-3">
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
                           <Input 
                                id="osTechnician" 
                                value={responsibleTechnicianName} // Alterado de Id para Name
                                onChange={(e) => setResponsibleTechnicianName(e.target.value)} // Alterado de Id para Name
                                placeholder="Nome do técnico" 
                            />
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
                    <CardHeader><CardTitle className="text-xl">Serviços e Peças (Descritivo)</CardTitle></CardHeader>
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

                  {/* Valores e Produtos Adicionais */}
                  <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Valores e Produtos Adicionais</CardTitle>
                        <CardDescription>Insira o valor do serviço e adicione produtos vendidos à parte.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="osServiceManualValue">Valor do Serviço (R$)</Label>
                            <Input 
                                id="osServiceManualValue" 
                                type="text" 
                                value={serviceManualValueInput} 
                                onChange={(e) => setServiceManualValueInput(e.target.value)} 
                                placeholder="Ex: 150,00" 
                            />
                        </div>
                        
                        <div className="space-y-4 rounded-md border p-4">
                            <h4 className="font-medium">Adicionar Produto à OS</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                <div className="sm:col-span-5">
                                    <Label htmlFor="currentProductName">Nome do Produto</Label>
                                    <Input 
                                        id="currentProductName" 
                                        value={currentProductNameInput} 
                                        onChange={(e) => setCurrentProductNameInput(e.target.value)} 
                                        placeholder="Ex: Película de Vidro"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="currentProductQty">Qtd.</Label>
                                    <Input 
                                        id="currentProductQty" 
                                        type="number" 
                                        value={currentProductQtyInput} 
                                        onChange={(e) => setCurrentProductQtyInput(e.target.value)} 
                                        min="1"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Label htmlFor="currentProductPrice">Preço Unit. (R$)</Label>
                                    <Input 
                                        id="currentProductPrice" 
                                        type="text" 
                                        value={currentProductPriceInput} 
                                        onChange={(e) => setCurrentProductPriceInput(e.target.value)} 
                                        placeholder="Ex: 25,00"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button type="button" onClick={handleAddSoldProduct} className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </div>
                            </div>

                            {soldProductsList.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h5 className="text-sm font-medium">Produtos Adicionados:</h5>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Produto</TableHead>
                                                    <TableHead className="text-center">Qtd</TableHead>
                                                    <TableHead className="text-right">Unit. (R$)</TableHead>
                                                    <TableHead className="text-right">Total (R$)</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {soldProductsList.map(prod => (
                                                    <TableRow key={prod.tempId}>
                                                        <TableCell>{prod.name}</TableCell>
                                                        <TableCell className="text-center">{prod.quantity}</TableCell>
                                                        <TableCell className="text-right">{prod.unitPrice.toFixed(2).replace('.', ',')}</TableCell>
                                                        <TableCell className="text-right">{prod.totalPrice.toFixed(2).replace('.', ',')}</TableCell>
                                                        <TableCell>
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveSoldProduct(prod.tempId)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 text-right">
                            <p className="text-lg font-semibold">
                                Valor Total da OS: <span className="text-primary">R$ {grandTotalDisplay}</span>
                            </p>
                        </div>
                    </CardContent>
                  </Card>

                </div>
              </ScrollArea>
              <DialogFooter className="border-t pt-6 mt-6 pr-4 flex flex-col sm:flex-row justify-between items-center w-full">
                <Button type="button" variant="outline" onClick={() => handlePrintOS({
                    id: "PREVIEW", 
                    osNumber: `OS-${Date.now().toString().slice(-6)}` , openingDate: new Date().toLocaleString('pt-BR'),
                    clientName, deviceBrandModel, problemReportedByClient, status, 
                    deliveryForecastDate, responsibleTechnicianName, // Alterado de Id para Name
                    clientCpfCnpj, clientPhone, clientEmail,
                    deviceType, deviceImeiSerial, deviceColor, deviceAccessories, technicalDiagnosis, internalObservations,
                    servicesPerformedDescription, partsUsedDescription,
                    serviceManualValue: parseFloat(serviceManualValueInput.replace(',', '.')) || 0,
                    additionalSoldProducts: soldProductsList,
                    grandTotalValue: parseFloat(grandTotalDisplay.replace(',', '.')) || 0,
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
                    <TableHead className="hidden xl:table-cell text-right">Total (R$)</TableHead>
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
                      <TableCell className="hidden lg:table-cell">{os.deliveryForecastDate ? new Date(os.deliveryForecastDate + 'T00:00:00').toLocaleDateString('pt-BR') : "N/D"}</TableCell>
                      <TableCell className="hidden xl:table-cell text-right">{os.grandTotalValue?.toFixed(2).replace('.', ',') || "0,00"}</TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handlePrintOS(os)} aria-label="Imprimir ordem de serviço">
                          <Printer className="h-4 w-4" />
                        </Button>
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

