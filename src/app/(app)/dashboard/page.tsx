
"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, Building, Save, Loader2, UploadCloud, AlertTriangle, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getEstablishmentSettings, saveEstablishmentSettings, type EstablishmentSettings } from "@/services/settingsService";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize with DonPhone default values
  const [businessName, setBusinessName] = useState("DONPHONE INFORMÁTICA E CELULARES");
  const [businessAddress, setBusinessAddress] = useState("RUA CRISTALINO MACHADO, N°:95, BAIRRO: CENTRO, CIDADE: BARRACÃO, ESTADO: PARANÁ");
  const [businessCnpj, setBusinessCnpj] = useState("58.435.813/0004-94");
  const [businessPhone, setBusinessPhone] = useState("49991287685");
  const [businessEmail, setBusinessEmail] = useState("contato@donphone.com");
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null); 
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [totalRevenue, setTotalRevenue] = useState<string>("N/D");
  const [activeClients, setActiveClients] = useState<string>("N/D");
  const [openServiceOrders, setOpenServiceOrders] = useState<string>("N/D");
  const [pendingRepairs, setPendingRepairs] = useState<string>("N/D");
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(true);

  const { data: establishmentSettings, isLoading: isLoadingSettings, error: settingsError, refetch: refetchEstablishmentSettings } = useQuery<EstablishmentSettings | null, Error>({
    queryKey: ["establishmentSettings"],
    queryFn: getEstablishmentSettings,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingDashboardStats(false), 1200); 
    return () => clearTimeout(timer);
    // TODO: Implementar busca real de dados para os cards do dashboard
  }, []);


  useEffect(() => {
    // This effect runs when establishmentSettings data is fetched or changes.
    // It will overwrite the initial DonPhone defaults if specific values are found in Firestore.
    if (establishmentSettings) {
      // If a field exists in Firestore, use it. Otherwise, the useState default (DonPhone) remains.
      // If a field is explicitly saved as an empty string in Firestore, that empty string will be used.
      if (establishmentSettings.businessName !== undefined) setBusinessName(establishmentSettings.businessName);
      if (establishmentSettings.businessAddress !== undefined) setBusinessAddress(establishmentSettings.businessAddress);
      if (establishmentSettings.businessCnpj !== undefined) setBusinessCnpj(establishmentSettings.businessCnpj);
      if (establishmentSettings.businessPhone !== undefined) setBusinessPhone(establishmentSettings.businessPhone);
      if (establishmentSettings.businessEmail !== undefined) setBusinessEmail(establishmentSettings.businessEmail);
      
      // Handle logo: if logoUrl is present (even empty string), update preview.
      // If logoUrl is undefined in DB, logoPreview (initially null) is unchanged by this block.
      if (establishmentSettings.logoUrl !== undefined) {
        setLogoPreview(establishmentSettings.logoUrl || null); // If logoUrl is "", preview becomes null.
      } else {
         setLogoPreview(null); // Ensure preview is cleared if logoUrl is not in settings
      }
    } else if (!isLoadingSettings) {
      // If settings are explicitly null (not found) and not loading,
      // ensure form fields reset to the initial DonPhone defaults (they should already be this due to useState).
      // This also ensures logoPreview is cleared if no settings are found.
      setBusinessName("DONPHONE INFORMÁTICA E CELULARES");
      setBusinessAddress("RUA CRISTALINO MACHADO, N°:95, BAIRRO: CENTRO, CIDADE: BARRACÃO, ESTADO: PARANÁ");
      setBusinessCnpj("58.435.813/0004-94");
      setBusinessPhone("49991287685");
      setBusinessEmail("contato@donphone.com");
      setLogoPreview(null);
    }

    // Always reset the file input display when data loads or settings change,
    // but only if not still loading, to avoid clearing a selection prematurely.
    if (!isLoadingSettings) {
      setBusinessLogoFile(null); 
    }
  }, [establishmentSettings, isLoadingSettings]);

  useEffect(() => {
    if (settingsError && !isLoadingSettings) { 
      toast({
        title: "Erro ao Carregar Dados do Estabelecimento",
        description: settingsError.message || "Não foi possível carregar os dados. Verifique sua conexão e as regras do Firestore.",
        variant: "destructive",
        duration: 7000,
      });
    }
  }, [settingsError, toast, isLoadingSettings]);
  
  const saveSettingsMutation = useMutation({
    mutationFn: ({ data, logoFile }: { data: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>, logoFile?: File | null }) => saveEstablishmentSettings(data, logoFile),
    onSuccess: (savedData) => {
      queryClient.invalidateQueries({ queryKey: ["establishmentSettings"] });
      toast({
        title: "Sucesso!",
        description: "Dados do estabelecimento salvos com sucesso.",
      });
      // Update preview based on saved data, which might include a new or removed logoUrl
      if (savedData.logoUrl) {
        setLogoPreview(savedData.logoUrl);
      } else {
         setLogoPreview(null); // If logoUrl is empty or undefined after save, clear preview
      }
      setBusinessLogoFile(null); 
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao Salvar",
        description: `Não foi possível salvar os dados: ${error.message}`,
        variant: "destructive",
      });
    },
  });


  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBusinessLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string); 
      };
      reader.readAsDataURL(file);
    } else {
      setBusinessLogoFile(null); 
      // If a file is deselected, clear the preview *unless* there's an existing saved logoUrl.
      if (!establishmentSettings?.logoUrl && !logoPreview?.startsWith('data:')) { // only clear if no saved URL and current preview isn't a new data URI
          setLogoPreview(null);
      } else if (establishmentSettings?.logoUrl && !businessLogoFile) {
          setLogoPreview(establishmentSettings.logoUrl); // revert to saved logo if file deselected
      }
    }
  };
  
  const handleRemoveLogo = () => {
    setBusinessLogoFile(null); 
    setLogoPreview(null); 
  };

  const handleSaveEstablishmentData = async (e: FormEvent) => {
    e.preventDefault();
    const settingsToSave: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'> = {
      businessName,
      businessAddress,
      businessCnpj,
      businessPhone,
      businessEmail,
    };
    
    let logoActionFile: File | null | undefined = businessLogoFile; 
    if (logoPreview === null && businessLogoFile === null && establishmentSettings?.logoUrl) { 
        logoActionFile = null; // Signal for removal
    }
    
    saveSettingsMutation.mutate({ data: settingsToSave, logoFile: logoActionFile });
  };

  const renderStatValue = (value: string, isLoading: boolean) => {
    if (isLoading) return <Skeleton className="h-7 w-24 rounded" />;
    if (value === "N/D") return <div className="text-2xl font-bold text-muted-foreground/80">{value}</div>;
    return <div className="text-2xl font-bold">{value}</div>;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">Painel</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStatValue(totalRevenue, isLoadingDashboardStats)}
            <p className="text-xs text-muted-foreground">
              {isLoadingDashboardStats ? <Skeleton className="h-3 w-32" /> : "Cálculo pendente."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStatValue(activeClients, isLoadingDashboardStats)}
             <p className="text-xs text-muted-foreground">
              {isLoadingDashboardStats ? <Skeleton className="h-3 w-28" /> : "Cálculo pendente."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens de Serviço Abertas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {renderStatValue(openServiceOrders, isLoadingDashboardStats)}
             <p className="text-xs text-muted-foreground">
              {isLoadingDashboardStats ? <Skeleton className="h-3 w-24" /> : "Cálculo pendente."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reparos Pendentes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStatValue(pendingRepairs, isLoadingDashboardStats)}
            <p className="text-xs text-muted-foreground">
             {isLoadingDashboardStats ? <Skeleton className="h-3 w-36" /> : "Cálculo pendente."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle>Dados do Estabelecimento</CardTitle>
          </div>
          <CardDescription>Insira as informações da sua loja. Estes dados aparecerão em comprovantes.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveEstablishmentData}>
          <CardContent className="space-y-4">
            {isLoadingSettings && (
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando dados do estabelecimento...</span>
                    </div>
                    <Skeleton className="h-6 w-1/4 mb-1" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-1/4 mb-1" />
                    <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-6 w-1/4 mb-1" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-32 mt-3" />
                </div>
            )}
            {settingsError && !isLoadingSettings && (
                 <div className="flex flex-col items-center justify-center gap-3 py-6 text-center text-destructive">
                    <AlertTriangle className="h-10 w-10" />
                    <p className="text-md font-medium">Erro ao carregar dados do estabelecimento</p>
                    <p className="text-sm text-muted-foreground">{settingsError.message}</p>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => refetchEstablishmentSettings()} 
                        className="mt-3"
                        disabled={isLoadingSettings}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Tentar Novamente
                    </Button>
                 </div>
            )}
            {!isLoadingSettings && !settingsError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Nome do Estabelecimento</Label>
                    <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: DonPhone Assistência Técnica" />
                  </div>
                  <div>
                    <Label htmlFor="businessCnpj">CNPJ</Label>
                    <Input id="businessCnpj" value={businessCnpj} onChange={(e) => setBusinessCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessAddress">Endereço Completo</Label>
                  <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Rua Exemplo, 123, Bairro, Cidade - UF, CEP 00000-000" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessPhone">Telefone</Label>
                    <Input id="businessPhone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">E-mail</Label>
                    <Input id="businessEmail" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="contato@sualoja.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessLogoFile">Logo do Estabelecimento</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Input 
                        id="businessLogoFile" 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        onChange={handleLogoChange} 
                        className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
                    />
                    {logoPreview && (
                        <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo}>Remover Logo</Button>
                    )}
                  </div>
                  {logoPreview ? (
                    <div className="mt-4 p-2 border rounded-md inline-block bg-muted">
                      <Image src={logoPreview} alt="Pré-visualização do Logo" width={120} height={120} className="object-contain rounded max-h-[120px] min-h-[50px]" data-ai-hint="store logo"/>
                    </div>
                  ) : (
                     <div className="mt-3 flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md text-muted-foreground bg-muted/50">
                        <UploadCloud className="mr-2 h-6 w-6" />
                        <span>{businessLogoFile ? businessLogoFile.name : "Nenhum logo selecionado"}</span>
                     </div>
                  )}
                  {!logoPreview && businessLogoFile && (
                    <p className="text-sm text-muted-foreground mt-2">Novo arquivo selecionado: {businessLogoFile.name}. Clique em "Salvar Dados" para aplicar.</p>
                  )}
                   {logoPreview && !businessLogoFile && establishmentSettings?.logoUrl && logoPreview === establishmentSettings.logoUrl &&(
                     <p className="text-xs text-muted-foreground mt-1">Logo atual salvo. Para alterar, selecione um novo arquivo.</p>
                   )}
                </div>
                <Button type="submit" disabled={saveSettingsMutation.isPending || isLoadingSettings} className="w-full sm:w-auto">
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Dados
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Visão geral dos eventos recentes do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma atividade recente para exibir. (Funcionalidade pendente)</p>
        </CardContent>
      </Card>
    </div>
  );
}
