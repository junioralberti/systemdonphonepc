
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableSummaryFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScanLine, PlusCircle, ShoppingCart, Trash2, MinusCircle, DollarSign, Printer, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getEstablishmentSettings, type EstablishmentSettings } from "@/services/settingsService";

interface CartItem {
  id: string; // SKU or product ID
  name: string;
  quantity: number;
  price: number;
}

type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX";
const paymentMethods: PaymentMethod[] = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"];

export default function CounterSalesPage() {
  const [skuInput, setSkuInput] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [clientNameForSale, setClientNameForSale] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
  const { toast } = useToast();
  const [establishmentDataForPrint, setEstablishmentDataForPrint] = useState<EstablishmentSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const settings = await getEstablishmentSettings();
            setEstablishmentDataForPrint(settings);
        } catch (error) {
            console.error("Failed to fetch establishment settings for print:", error);
            setEstablishmentDataForPrint({
                businessName: "Seu Estabelecimento (Configure no Painel)",
                businessAddress: "Seu Endereço",
                businessCnpj: "Seu CNPJ",
                businessPhone: "Seu Telefone",
                businessEmail: "Seu E-mail",
                logoUrl: "/donphone-logo.png"
            });
        }
    };
    fetchSettings();
  }, []);

  const handleAddItem = () => {
    if (!skuInput.trim()) {
      toast({ title: "Entrada Inválida", description: "Por favor, insira ou escaneie um SKU.", variant: "destructive" });
      return;
    }

    // TODO: Implement actual product lookup from Firestore based on SKU
    const mockProduct = {
      id: skuInput.trim().toUpperCase(),
      name: `Produto ${skuInput.trim().toUpperCase()}`, // Replace with actual product name
      price: Math.floor(Math.random() * 100) + 10, // Replace with actual product price
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
      ).filter(item => item.quantity > 0) 
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({ title: "Item Removido", description: "Item removido do carrinho.", variant: "destructive" });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const resetSaleForm = () => {
    setCartItems([]);
    setSkuInput("");
    setClientNameForSale("");
    setPaymentMethod(undefined);
  };

  const handlePrintSaleReceipt = (saleData: {
    saleId: string;
    date: string;
    clientName?: string;
    items: CartItem[];
    paymentMethod?: PaymentMethod;
    totalAmount: number;
  }) => {
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
      printWindow.document.write('<html><head><title>Comprovante de Venda</title>');
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
        .details-grid { display: grid; grid-template-columns: 1fr; gap: 4px; margin-bottom: 15px; font-size: 9pt; }
        .details-grid strong { color: #555; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        .items-table th { background-color: #f2f2f2; font-weight: bold; }
        .items-table .text-right { text-align: right; }
        .items-table .text-center { text-align: center; }
        .summary-section { margin-top: 15px; padding-top:10px; border-top: 1px solid #ccc; font-size: 10pt; }
        .summary-section div { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .summary-section .grand-total { font-size: 11pt; font-weight: bold; }
        h1.receipt-title { text-align: center; font-size: 16pt; margin-bottom: 15px; color: #000;}
      `);
      printWindow.document.write('</style></head><body><div class="print-container">');

      printWindow.document.write('<div class="establishment-header">');
      if (establishmentData.logoUrl) {
        printWindow.document.write(`<div class="logo-container"><img src="${establishmentData.logoUrl}" alt="Logo" /></div>`);
      }
      printWindow.document.write('<div class="establishment-info">');
      printWindow.document.write(`<strong>${establishmentData.businessName || "Nome não configurado"}</strong><br/>`);
      printWindow.document.write(`${establishmentData.businessAddress || "Endereço não configurado"}<br/>`);
      if(establishmentData.businessCnpj) printWindow.document.write(`CNPJ: ${establishmentData.businessCnpj}<br/>`);
      if(establishmentData.businessPhone || establishmentData.businessEmail) {
        printWindow.document.write(`Telefone: ${establishmentData.businessPhone || ""} ${establishmentData.businessPhone && establishmentData.businessEmail ? '|' : ''} E-mail: ${establishmentData.businessEmail || ""}`);
      }
      printWindow.document.write('</div></div>');


      printWindow.document.write(`<h1 class="receipt-title">COMPROVANTE DE VENDA</h1>`);
      printWindow.document.write('<div class="details-grid">');
      printWindow.document.write(`<div><strong>Nº Venda:</strong> ${saleData.saleId}</div>`);
      printWindow.document.write(`<div><strong>Data:</strong> ${saleData.date}</div>`);
      if (saleData.clientName) {
        printWindow.document.write(`<div><strong>Cliente:</strong> ${saleData.clientName}</div>`);
      }
      printWindow.document.write('</div>');

      printWindow.document.write('<div class="section-title">Itens</div>');
      printWindow.document.write('<table class="items-table"><thead><tr><th>Produto</th><th class="text-center">Qtd</th><th class="text-right">Preço Unit.</th><th class="text-right">Subtotal</th></tr></thead><tbody>');
      saleData.items.forEach(item => {
        printWindow.document.write(`<tr>
          <td>${item.name}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">R$ ${item.price.toFixed(2).replace('.', ',')}</td>
          <td class="text-right">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
        </tr>`);
      });
      printWindow.document.write('</tbody></table>');
      
      printWindow.document.write('<div class="summary-section">');
      if (saleData.paymentMethod) {
         printWindow.document.write(`<div><span>Tipo de Pagamento:</span> <span>${saleData.paymentMethod}</span></div>`);
      }
      printWindow.document.write(`<div class="grand-total"><span>VALOR TOTAL:</span> <span>R$ ${saleData.totalAmount.toFixed(2).replace('.', ',')}</span></div>`);
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


  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      toast({ title: "Carrinho Vazio", description: "Adicione itens ao carrinho antes de concluir a venda.", variant: "destructive" });
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Pagamento Necessário", description: "Por favor, selecione um tipo de pagamento.", variant: "destructive" });
      return;
    }

    const total = calculateTotal();
    const saleId = `VENDA-${Date.now().toString().slice(-6)}`;
    const saleDate = new Date().toLocaleString('pt-BR');

    // TODO: Persist this sale to Firestore
    console.log("Venda concluída (simulado):", {
      saleId,
      date: saleDate,
      clientName: clientNameForSale,
      items: cartItems,
      paymentMethod,
      totalAmount: total,
    });
    
    toast({ 
      title: "Venda Concluída!", 
      description: `Cliente: ${clientNameForSale || "Não informado"}. Pagamento: ${paymentMethod}. Total: R$ ${total.toFixed(2)}`
    });

    handlePrintSaleReceipt({
      saleId,
      date: saleDate,
      clientName: clientNameForSale,
      items: cartItems,
      paymentMethod,
      totalAmount: total,
    });
    
    resetSaleForm();
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
          <CardDescription>Registre vendas de produtos e acessórios no balcão. (Vendas salvas apenas em memória local por enquanto)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientNameForSale">Nome do Cliente (Opcional)</Label>
              <Input 
                id="clientNameForSale"
                value={clientNameForSale}
                onChange={(e) => setClientNameForSale(e.target.value)}
                placeholder="Digite o nome do cliente"
                className="text-base"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Tipo de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                <SelectTrigger id="paymentMethod" className="text-base">
                  <SelectValue placeholder="Selecione o tipo de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method} value={method} className="text-base">{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="skuInput">SKU do Produto</Label>
              <Input 
                id="skuInput"
                placeholder="Escanear ou inserir SKU (funcionalidade de busca pendente)" 
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleAddItem(); }}
                className="text-base"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => alert("Funcionalidade de scanner pendente")} aria-label="Escanear produto" className="h-10 w-10">
              <ScanLine className="h-5 w-5"/>
            </Button>
            <Button onClick={handleAddItem} className="h-10">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
              <p>Nenhum item no carrinho.</p>
              <p className="text-sm">Adicione produtos usando o campo SKU acima.</p>
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
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, 1)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-sm">{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm">{(item.price * item.quantity).toFixed(2)}</TableCell>
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
                    <TableCell className="text-right font-bold text-lg">R$ {calculateTotal().toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableSummaryFooter>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="outline" onClick={() => handlePrintSaleReceipt({
                saleId: `PREVIEW-${Date.now().toString().slice(-6)}`,
                date: new Date().toLocaleString('pt-BR'),
                clientName: clientNameForSale,
                items: cartItems,
                paymentMethod,
                totalAmount: calculateTotal()
            })} 
            disabled={cartItems.length === 0}
            className="w-full sm:w-auto"
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir Comprovante (Prévia)
            </Button>
            <Button 
              size="lg" 
              onClick={handleCompleteSale} 
              disabled={cartItems.length === 0 || !paymentMethod}
              className="w-full sm:w-auto"
            >
              <DollarSign className="mr-2 h-5 w-5" /> Concluir Venda
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
