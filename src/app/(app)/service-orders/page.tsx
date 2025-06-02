
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
import { getEstablishmentSettings, type EstablishmentSettings } from "@/services/settingsService";

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
  responsibleTechnicianName?: string;

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
  const [establishmentDataForPrint, setEstablishmentDataForPrint] = useState<EstablishmentSettings | null>(null);
  
  // Estados para o formulário de nova OS
  const [osNumber, setOsNumber] = useState(""); 
  const [openingDate, setOpeningDate] = useState(""); 
  const [deliveryForecastDate, setDeliveryForecastDate] = useState("");
  const [status, setStatus] = useState<ServiceOrderStatus>("Aberta");
  const [responsibleTechnicianName, setResponsibleTechnicianName] = useState("");

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

  const [serviceManualValueInput, setServiceManualValueInput] = useState("");
  const [soldProductsList, setSoldProductsList] = useState<SoldProductItem[]>([]);
  const [currentProductNameInput, setCurrentProductNameInput] = useState("");
  const [currentProductQtyInput, setCurrentProductQtyInput] = useState("1");
  const [currentProductPriceInput, setCurrentProductPriceInput] = useState("");
  const [grandTotalDisplay, setGrandTotalDisplay] = useState("0.00");

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const settings = await getEstablishmentSettings();
            setEstablishmentDataForPrint(settings);
        } catch (error) {
            console.error("Failed to fetch establishment settings for print:", error);
            // Use default/placeholder if fetch fails
            setEstablishmentDataForPrint({
                businessName: "Seu Estabelecimento (Configure no Painel)",
                businessAddress: "Seu Endereço",
                businessCnpj: "Seu CNPJ",
                businessPhone: "Seu Telefone",
                businessEmail: "Seu E-mail",
                logoUrl: "/donphone-logo.png" // Default logo
            });
        }
    };
    fetchSettings();
  }, []);


  const resetFormFields = () => {
    setDeliveryForecastDate("");
    setStatus("Aberta");
    setResponsibleTechnicianName("");
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
      responsibleTechnicianName,
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
    toast({ title: "Nova O.S. Criada", description: `A Ordem de Serviço ${newOsNumber} foi registrada com sucesso.`});
    resetFormFields();
    setIsNewServiceOrderDialogOpen(false);
    console.log("Nova ordem de serviço criada (simulada):", newOrder);
    // TODO: Persist this order to Firestore
  };

  const handleDeleteServiceOrder = (orderId: string) => {
    setServiceOrders(serviceOrders.filter(os => os.id !== orderId));
    toast({ title: "O.S. Excluída", description: `A Ordem de Serviço ${orderId} foi excluída.`, variant: "destructive"});
    console.log("Ordem de serviço excluída (simulada):", orderId);
    // TODO: Delete this order from Firestore
  };

  const handlePrintOS = (order: Partial<ServiceOrder>) => {
    const establishmentData = establishmentDataForPrint || {
      businessName: "DonPhone Assistência (Padrão)",
      businessAddress: "Rua Exemplo, 123",
      businessCnpj: "00.000.000/0001-00",
      businessPhone: "(00) 1234-5678",
      businessEmail: "contato@donphone.com",
      logoUrl: "/donphone-logo.png"
    };

    const printWindow = window.open('', '_blank', 'height=700,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Ordem de Serviço</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Arial', sans-serif; margin: 20px; font-size: 10pt; color: #333; }
        .print-container { width: 100%; max-width: 700px; margin: auto; }
        .establishment-header { display: flex; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ccc; }
        .logo-container { margin-right: 20px; flex-shrink: 0; }
        .logo-container img { max-height: 60px; max-width: 180px; object-fit: contain; }
        .establishment-info { font-size: 9pt; line-height: 1.4; }
        .establishment-info strong { font-size: 12pt; display: block; margin-bottom: 4px; color: #000; }
        .section-title { font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #eee; color: #000; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 15px; margin-bottom: 15px; font-size: 9pt; }
        .details-grid-full { display: grid; grid-template-columns: 1fr; gap: 4px; margin-bottom: 15px; font-size: 9pt; }
        .details-grid div, .details-grid-full div { padding: 2px 0; }
        .details-grid strong, .details-grid-full strong { color: #555; }
        .products-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
        .products-table th, .products-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        .products-table th { background-color: #f2f2f2; font-weight: bold; }
        .products-table .text-right { text-align: right; }
        .products-table .text-center { text-align: center; }
        .grand-total { text-align: right; font-size: 11pt; font-weight: bold; margin-top: 15px; padding-top:10px; border-top: 1px solid #ccc; }
        .text-area-content { white-space: pre-wrap; padding: 5px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 3px; font-size: 9pt; margin-top: 3px; }
        .signature-area { margin-top: 50px; padding-top: 20px; border-top: 1px dashed #aaa; text-align: center; font-size: 9pt; }
        .signature-line { display: inline-block; width: 280px; border-bottom: 1px solid #333; margin-top: 40px; }
        h1.os-title { text-align: center; font-size: 16pt; margin-bottom: 15px; color: #000;}
      `);
      printWindow.document.write('</style></head><body><div class="print-container">');

      printWindow.document.write('<div class="establishment-header">');
      if (establishmentData.logoUrl) {
        printWindow.document.write(`<div class="logo-container"><img src="${establishmentData.logoUrl}" alt="Logo do Estabelecimento" /></div>`);
      }
      printWindow.document.write('<div class="establishment-info">');
      printWindow.document.write(`<strong>${establishmentData.businessName || "Nome não configurado"}</strong><br/>`);
      printWindow.document.write(`${establishmentData.businessAddress || "Endereço não configurado"}<br/>`);
      if(establishmentData.businessCnpj) printWindow.document.write(`CNPJ: ${establishmentData.businessCnpj}<br/>`);
      if(establishmentData.businessPhone || establishmentData.businessEmail) {
        printWindow.document.write(`Telefone: ${establishmentData.businessPhone || ""} ${establishmentData.businessPhone && establishmentData.businessEmail ? '|' : ''} E-mail: ${establishmentData.businessEmail || ""}`);
      }
      printWindow.document.write('</div></div>');

      printWindow.document.write(`<h1 class="os-title">ORDEM DE SERVIÇO Nº: ${order.osNumber || 'N/A'}</h1>`);

      printWindow.document.write('<div class="section-title">Detalhes da OS</div>');
      printWindow.document.write('<div class="details-grid">');
      printWindow.document.write(`<div><strong>Data de Abertura:</strong> ${order.openingDate || 'N/A'}</div>`);
      let formattedDeliveryDate = "N/A";
      if (order.deliveryForecastDate) {
        try {
            const date = new Date(order.deliveryForecastDate + 'T00:00:00'); // Ensure it's parsed as local time
            if (!isNaN(date.getTime())) {
                 formattedDeliveryDate = date.toLocaleDateString('pt-BR');
            }
        } catch (e) { console.error("Error formatting delivery date:", e); }
      }
      printWindow.document.write(`<div><strong>Previsão de Entrega:</strong> ${formattedDeliveryDate}</div>`);
      printWindow.document.write(`<div><strong>Status:</strong> ${order.status || 'N/A'}</div>`);
      if (order.responsibleTechnicianName) {
        printWindow.document.write(`<div><strong>Técnico Responsável:</strong> ${order.responsibleTechnicianName}</div>`);
      }
      printWindow.document.write('</div>');

      printWindow.document.write('<div class="section-title">Dados do Cliente</div>');
      printWindow.document.write('<div class="details-grid-full">');
      printWindow.document.write(`<div><strong>Nome:</strong> ${order.clientName || 'N/A'}</div>`);
      if (order.clientCpfCnpj) printWindow.document.write(`<div><strong>CPF/CNPJ:</strong> ${order.clientCpfCnpj}</div>`);
      if (order.clientPhone) printWindow.document.write(`<div><strong>Telefone/WhatsApp:</strong> ${order.clientPhone}</div>`);
      if (order.clientEmail) printWindow.document.write(`<div><strong>E-mail:</strong> ${order.clientEmail}</div>`);
      printWindow.document.write('</div>');

      printWindow.document.write('<div class="section-title">Informações do Aparelho</div>');
      printWindow.document.write('<div class="details-grid">');
      if (order.deviceType) printWindow.document.write(`<div><strong>Tipo:</strong> ${order.deviceType}</div>`);
      printWindow.document.write(`<div><strong>Marca/Modelo:</strong> ${order.deviceBrandModel || 'N/A'}</div>`);
      if (order.deviceImeiSerial) printWindow.document.write(`<div><strong>IMEI/Nº Série:</strong> ${order.deviceImeiSerial}</div>`);
      if (order.deviceColor) printWindow.document.write(`<div><strong>Cor:</strong> ${order.deviceColor}</div>`);
      if (order.deviceAccessories) printWindow.document.write(`<div style="grid-column: span 2;"><strong>Acessórios Recebidos:</strong> ${order.deviceAccessories}</div>`);
      printWindow.document.write('</div>');
      
      printWindow.document.write('<div class="section-title">Problemas e Diagnóstico</div>');
      printWindow.document.write('<div class="details-grid-full">');
      printWindow.document.write(`<div><strong>Defeito Informado pelo Cliente:</strong> <div class="text-area-content">${order.problemReportedByClient || 'N/A'}</div></div>`);
      if (order.technicalDiagnosis) printWindow.document.write(`<div><strong>Diagnóstico Técnico:</strong> <div class="text-area-content">${order.technicalDiagnosis}</div></div>`);
      if (order.internalObservations) printWindow.document.write(`<div><strong>Observações Internas:</strong> <div class="text-area-content">${order.internalObservations}</div></div>`);
      printWindow.document.write('</div>');

      if (order.servicesPerformedDescription || order.partsUsedDescription) {
        printWindow.document.write('<div class="section-title">Serviços Executados e Peças Utilizadas</div>');
        printWindow.document.write('<div class="details-grid-full">');
        if (order.servicesPerformedDescription) printWindow.document.write(`<div><strong>Serviços Executados:</strong> <div class="text-area-content">${order.servicesPerformedDescription}</div></div>`);
        if (order.partsUsedDescription) printWindow.document.write(`<div><strong>Produtos/Peças Utilizadas:</strong> <div class="text-area-content">${order.partsUsedDescription}</div></div>`);
        printWindow.document.write('</div>');
      }
      
      printWindow.document.write('<div class="section-title">Valores</div>');
      printWindow.document.write('<div class="details-grid-full">');
      printWindow.document.write(`<div><strong>Valor do Serviço:</strong> R$ ${(order.serviceManualValue !== undefined ? order.serviceManualValue.toFixed(2).replace('.', ',') : '0,00')}</div>`);
      printWindow.document.write('</div>');

      if (order.additionalSoldProducts && order.additionalSoldProducts.length > 0) {
        printWindow.document.write('<div class="section-title" style="margin-top:10px; margin-bottom: 5px;">Produtos Adicionais Vendidos</div>');
        printWindow.document.write('<table class="products-table"><thead><tr><th>Produto</th><th class="text-center">Qtd</th><th class="text-right">Preço Unit.</th><th class="text-right">Subtotal</th></tr></thead><tbody>');
        order.additionalSoldProducts.forEach(prod => {
          printWindow.document.write(`<tr>
            <td>${prod.name}</td>
            <td class="text-center">${prod.quantity}</td>
            <td class="text-right">R$ ${prod.unitPrice.toFixed(2).replace('.', ',')}</td>
            <td class="text-right">R$ ${prod.totalPrice.toFixed(2).replace('.', ',')}</td>
          </tr>`);
        });
        printWindow.document.write('</tbody></table>');
      }
      
      printWindow.document.write(`<div class="grand-total">VALOR TOTAL DA OS: R$ ${order.grandTotalValue?.toFixed(2).replace('.', ',') || '0,00'}</div>`);

      printWindow.document.write('<div class="signature-area">');
      printWindow.document.write('<div class="signature-line"></div>');
      printWindow.document.write(`<div>Assinatura do Cliente (${order.clientName || ''})</div>`);
      printWindow.document.write('</div>');

      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } else {
      toast({ title: "Impressão Bloqueada", description: "Por favor, desabilite o bloqueador de pop-ups.", variant: "destructive"});
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
                                value={responsibleTechnicianName}
                                onChange={(e) => setResponsibleTechnicianName(e.target.value)}
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
                    osNumber: `OS-${Date.now().toString().slice(-6)}` , openingDate: new Date().toLocaleString('pt-BR'),
                    clientName, deviceBrandModel, problemReportedByClient, status, 
                    deliveryForecastDate, responsibleTechnicianName,
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
          <CardDescription>Rastreie e gerencie todos os reparos e serviços de dispositivos. (OS salvas apenas em memória local por enquanto)</CardDescription>
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
