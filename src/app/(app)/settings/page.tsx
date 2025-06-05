
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { getEstablishmentSettings, saveEstablishmentSettings, type EstablishmentSettings } from "@/services/settingsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, Save, Loader2, UploadCloud, AlertTriangle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCnpj, setBusinessCnpj] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null | undefined>(undefined); // undefined means no change, null means remove existing
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);

  const { data: establishmentSettings, isLoading: isLoadingSettings, error: settingsError, refetch: refetchEstablishmentSettings, isFetching: isFetchingSettings } = useQuery<EstablishmentSettings | null, Error>({
    queryKey: ["establishmentSettings"],
    queryFn: getEstablishmentSettings,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (establishmentSettings) { // Data exists in Firestore
      setBusinessName(establishmentSettings.businessName || "");
      setBusinessAddress(establishmentSettings.businessAddress || "");
      setBusinessCnpj(establishmentSettings.businessCnpj || "");
      setBusinessPhone(establishmentSettings.businessPhone || "");
      setBusinessEmail(establishmentSettings.businessEmail || "");
      
      if (establishmentSettings.logoUrl) {
        setLogoPreview(establishmentSettings.logoUrl);
        setOriginalLogoUrl(establishmentSettings.logoUrl);
      } else {
        setLogoPreview(null);
        setOriginalLogoUrl(null);
      }
    } else { // No data in Firestore (or error during fetch, handled by settingsError), so fields are for "novo cadastro"
      setBusinessName("");
      setBusinessAddress("");
      setBusinessCnpj("");
      setBusinessPhone("");
      setBusinessEmail("");
      setLogoPreview(null);
      setOriginalLogoUrl(null);
    }
  }, [establishmentSettings]);


  const saveSettingsMutation = useMutation({
    mutationFn: ({ settingsData, logoToUpload }: { settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>, logoToUpload?: File | null }) => 
      saveEstablishmentSettings(settingsData, logoToUpload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["establishmentSettings"] });
      toast({ title: "Sucesso!", description: "Dados do estabelecimento atualizados." });
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
        setOriginalLogoUrl(data.logoUrl);
      } else {
        setLogoPreview(null);
        setOriginalLogoUrl(null);
      }
      setLogoFile(undefined); 
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao Salvar", description: `Falha ao salvar dados: ${error.message}`, variant: "destructive" });
    },
  });

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800 * 1024) { 
        toast({ title: "Arquivo Muito Grande", description: "O logo deve ter no máximo 800KB.", variant: "destructive" });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null); // Mark for removal
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
    saveSettingsMutation.mutate({ settingsData: settingsToSave, logoToUpload: logoFile });
  };
  
  const EstablishmentFormFields = () => (
    <form onSubmit={handleSaveEstablishmentData}>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Nome do Estabelecimento</Label>
            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Nome da sua loja" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="businessCnpj">CNPJ</Label>
            <Input id="businessCnpj" value={businessCnpj} onChange={(e) => setBusinessCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessAddress">Endereço Completo</Label>
          <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - Estado, CEP" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="businessPhone">Telefone/WhatsApp</Label>
            <Input id="businessPhone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="businessEmail">E-mail de Contato</Label>
            <Input id="businessEmail" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="contato@sualoja.com" />
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="logoUpload">Logo do Estabelecimento</Label>
          {logoPreview && (
            <div className="mb-3 rounded-md border border-dashed p-3 inline-block relative bg-muted/20">
              <Image 
                src={logoPreview} 
                alt="Prévia do Logo" 
                width={180} 
                height={60} 
                className="max-h-16 object-contain" 
                data-ai-hint="company logo"
                unoptimized={logoPreview.startsWith('blob:')} // Add this if local blob URLs are used for preview
                onError={() => {
                  setLogoPreview(null); 
                  toast({title: "Erro de Logo", description: "Não foi possível carregar a prévia do logo.", variant: "destructive"});
                }}
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Label className="cursor-pointer">
                <UploadCloud className="mr-2 h-4 w-4" /> {logoPreview ? "Alterar Logo" : "Carregar Logo"}
                <Input id="logoUpload" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" className="sr-only" onChange={handleLogoChange} />
              </Label>
            </Button>
            {(logoPreview || logoFile === null) && ( // Show remove button if there's a preview OR if removal is explicitly requested
              <Button type="button" variant="ghost" onClick={handleRemoveLogo} className="text-destructive hover:text-destructive w-full sm:w-auto">
                Remover Logo
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Recomendado: PNG, JPG, WEBP ou SVG. Máx 800KB. Idealmente 180x60 pixels.</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button type="submit" disabled={saveSettingsMutation.isPending || isFetchingSettings || isLoadingSettings}>
          {(saveSettingsMutation.isPending || isFetchingSettings || isLoadingSettings) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Dados do Estabelecimento
        </Button>
      </CardFooter>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
          <CardDescription>Gerencie suas informações pessoais. (Funcionalidade pendente)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <Input id="firstName" defaultValue="Admin" className="text-base" disabled />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" defaultValue="User" className="text-base" disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" defaultValue="admin@example.com" className="text-base" disabled />
          </div>
          <Button disabled>Salvar Perfil</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle>Dados do Estabelecimento</CardTitle>
          </div>
          <CardDescription>Insira as informações da sua loja. Estes dados aparecerão em comprovantes e O.S.</CardDescription>
        </CardHeader>
        
        {isLoadingSettings && (
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-1/3 mt-4" />
                </div>
            </CardContent>
        )}
        
        {settingsError && !isLoadingSettings && (
           <CardContent className="pb-0">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao Carregar Dados Salvos</AlertTitle>
              <AlertDescription>
                Não foi possível buscar os dados do estabelecimento: {settingsError.message}. 
                Você ainda pode preencher e salvar as informações abaixo.
                <Button onClick={() => refetchEstablishmentSettings()} variant="link" className="p-0 h-auto ml-1 text-destructive hover:text-destructive/80" disabled={isFetchingSettings}>
                  {isFetchingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tentar novamente"}
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        {!isLoadingSettings && <EstablishmentFormFields />}
      </Card>
    </div>
  );
}
    
