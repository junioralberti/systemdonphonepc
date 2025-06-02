
"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, Building, Save, Loader2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getEstablishmentSettings, saveEstablishmentSettings, type EstablishmentSettings } from "@/services/settingsService";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCnpj, setBusinessCnpj] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null); // For new file upload
  const [logoPreview, setLogoPreview] = useState<string | null>(null); // For display (Data URL or existing URL)

  const { data: establishmentSettings, isLoading: isLoadingSettings, error: settingsError } = useQuery<EstablishmentSettings | null, Error>({
    queryKey: ["establishmentSettings"],
    queryFn: getEstablishmentSettings,
  });

  useEffect(() => {
    if (establishmentSettings) {
      setBusinessName(establishmentSettings.businessName || "");
      setBusinessAddress(establishmentSettings.businessAddress || "");
      setBusinessCnpj(establishmentSettings.businessCnpj || "");
      setBusinessPhone(establishmentSettings.businessPhone || "");
      setBusinessEmail(establishmentSettings.businessEmail || "");
      if (establishmentSettings.logoUrl) {
        setLogoPreview(establishmentSettings.logoUrl);
      } else {
        setLogoPreview(null);
      }
      setBusinessLogoFile(null); // Clear file input if data is loaded from DB
    }
  }, [establishmentSettings]);

  useEffect(() => {
    if (settingsError) {
      toast({
        title: "Erro ao Carregar Dados",
        description: "Não foi possível carregar os dados do estabelecimento.",
        variant: "destructive",
      });
    }
  }, [settingsError, toast]);
  
  const saveSettingsMutation = useMutation({
    mutationFn: ({ data, logoFile }: { data: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>, logoFile?: File | null }) => saveEstablishmentSettings(data, logoFile),
    onSuccess: (savedData) => {
      queryClient.invalidateQueries({ queryKey: ["establishmentSettings"] });
      toast({
        title: "Sucesso!",
        description: "Dados do estabelecimento salvos com sucesso.",
      });
      if (savedData.logoUrl) {
        setLogoPreview(savedData.logoUrl);
      } else if (logoPreview && !businessLogoFile) {
        // Keep current preview if no new file and logo wasn't explicitly removed
      } else {
         setLogoPreview(null);
      }
      setBusinessLogoFile(null); // Clear the file input after saving
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
        setLogoPreview(reader.result as string); // Show Data URL preview for new file
      };
      reader.readAsDataURL(file);
    } else {
      // If user clears file input, decide if we want to remove existing logo
      // For now, this means "no change" or "remove if no existing logoUrl"
      setBusinessLogoFile(null); 
      // If there was an existing logo from DB, keep its preview unless explicitly removed
      if (!establishmentSettings?.logoUrl) {
          setLogoPreview(null);
      }
    }
  };
  
  const handleRemoveLogo = () => {
    setBusinessLogoFile(null); // Indicate removal if it was a new file
    setLogoPreview(null); // Clear preview
    // The actual deletion from storage will happen on save if businessLogoFile is explicitly set to null
    // and a logoUrl existed.
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
    // If businessLogoFile is null AND logoPreview is null, it means remove logo.
    // If businessLogoFile has a value, it's a new upload.
    // If businessLogoFile is null but logoPreview has a value (from DB), it means "no change to logo".
    
    let logoActionFile: File | null | undefined = businessLogoFile; // undefined means no change, null means remove, File means upload
    if (!businessLogoFile && !logoPreview) { // This condition means user cleared the logo
        logoActionFile = null; // Signal to remove
    }
    
    saveSettingsMutation.mutate({ data: settingsToSave, logoFile: logoActionFile });
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
            <div className="text-2xl font-bold">R$45.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20,1% do último mês
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
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180,1% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens de Serviço Abertas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +19% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reparos Pendentes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">
              +2 desde a última hora
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
            {isLoadingSettings && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando dados do estabelecimento...</p>}
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
              <div className="flex items-center gap-3">
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
                  <Image src={logoPreview} alt="Pré-visualização do Logo" width={100} height={100} className="object-contain rounded max-h-[100px]" data-ai-hint="store logo"/>
                </div>
              ) : (
                 <div className="mt-3 flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md text-muted-foreground">
                    <UploadCloud className="mr-2 h-6 w-6" />
                    <span>{businessLogoFile ? businessLogoFile.name : "Nenhum logo selecionado"}</span>
                 </div>
              )}
              {!logoPreview && businessLogoFile && (
                <p className="text-sm text-muted-foreground mt-2">Novo arquivo: {businessLogoFile.name}</p>
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
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Visão geral dos eventos recentes do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma atividade recente para exibir.</p>
          {/* Placeholder for recent activity list */}
        </CardContent>
      </Card>
    </div>
  );
}
