
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

const DONPHONE_DEFAULTS_REFERENCE: EstablishmentSettings = {
  businessName: "DONPHONE INFORMÁTICA E CELULARES",
  businessAddress: "RUA CRISTALINO MACHADO, N°:95, BAIRRO: CENTRO, CIDADE: BARRACÃO, ESTADO: PARANÁ",
  businessCnpj: "58.435.813/0004-94",
  businessPhone: "49991287685",
  businessEmail: "contato@donphone.com",
  logoUrl: "https://placehold.co/180x60.png",
};

// Function to check if current settings are the default ones returned by the service when no DB entry exists
const isDataEffectivelyDefault = (settings: EstablishmentSettings | null): boolean => {
  if (!settings) return true; // This case should ideally not be hit if service always returns an object
  return (
    settings.businessName === DONPHONE_DEFAULTS_REFERENCE.businessName &&
    settings.businessAddress === DONPHONE_DEFAULTS_REFERENCE.businessAddress &&
    settings.businessCnpj === DONPHONE_DEFAULTS_REFERENCE.businessCnpj &&
    settings.businessPhone === DONPHONE_DEFAULTS_REFERENCE.businessPhone &&
    settings.businessEmail === DONPHONE_DEFAULTS_REFERENCE.businessEmail &&
    settings.logoUrl === DONPHONE_DEFAULTS_REFERENCE.logoUrl
  );
};


export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCnpj, setBusinessCnpj] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null | undefined>(undefined);
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);

  const { data: establishmentSettings, isLoading: isLoadingSettings, error: settingsError, refetch: refetchEstablishmentSettings, isFetching: isFetchingSettings } = useQuery<EstablishmentSettings | null, Error>({
    queryKey: ["establishmentSettings"],
    queryFn: getEstablishmentSettings,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (establishmentSettings && !settingsError) {
      if (isDataEffectivelyDefault(establishmentSettings)) {
        // Data matches the service's hardcoded defaults (meaning no custom data saved yet for form purposes)
        // Keep form fields blank.
        setBusinessName("");
        setBusinessAddress("");
        setBusinessCnpj("");
        setBusinessPhone("");
        setBusinessEmail("");
        setLogoPreview(null);
        setOriginalLogoUrl(null); // No "original" if it's just the default placeholder from service
      } else {
        // Populate with actual saved data (which might include empty strings if saved that way)
        setBusinessName(establishmentSettings.businessName || "");
        setBusinessAddress(establishmentSettings.businessAddress || "");
        setBusinessCnpj(establishmentSettings.businessCnpj || "");
        setBusinessPhone(establishmentSettings.businessPhone || "");
        setBusinessEmail(establishmentSettings.businessEmail || "");
        
        if (establishmentSettings.logoUrl && establishmentSettings.logoUrl !== DONPHONE_DEFAULTS_REFERENCE.logoUrl) {
          setLogoPreview(establishmentSettings.logoUrl);
          setOriginalLogoUrl(establishmentSettings.logoUrl);
        } else if (establishmentSettings.logoUrl === DONPHONE_DEFAULTS_REFERENCE.logoUrl) {
          // If the saved URL is the default placeholder, don't show it as a preview in "edit" mode
          setLogoPreview(null);
          setOriginalLogoUrl(establishmentSettings.logoUrl); // Still note it as the original
        }
         else {
          setLogoPreview(null);
          setOriginalLogoUrl(null);
        }
      }
    } else if (!isLoadingSettings && !settingsError) {
      // Fallback if establishmentSettings is unexpectedly null after loading (should be handled by service returning defaults)
      // Ensure form is blank.
      setBusinessName("");
      setBusinessAddress("");
      setBusinessCnpj("");
      setBusinessPhone("");
      setBusinessEmail("");
      setLogoPreview(null);
      setOriginalLogoUrl(null);
    }
    // While loading, skeleton is shown and fields remain as their initial empty state from useState.
  }, [establishmentSettings, isLoadingSettings, settingsError]);

  useEffect(() => {
    if (settingsError) {
      toast({
        title: "Erro ao Carregar Dados",
        description: "Não foi possível buscar os dados do estabelecimento. Verifique sua conexão ou tente novamente mais tarde.",
        variant: "destructive",
        duration: 7000,
      });
    }
  }, [settingsError, toast]);

  const saveSettingsMutation = useMutation({
    mutationFn: ({ settingsData, logoToUpload }: { settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>, logoToUpload?: File | null }) => 
      saveEstablishmentSettings(settingsData, logoToUpload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["establishmentSettings"] });
      toast({ title: "Sucesso!", description: "Dados do estabelecimento atualizados." });
      // Update form state with the newly saved data, this will also re-evaluate `isDataEffectivelyDefault` if needed
      // queryClient.setQueryData(["establishmentSettings"], data) would be more direct if the mutation returned the full new state.
      // For now, rely on refetch or the direct update below.
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
    setLogoFile(null); 
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
  
  const EstablishmentFormSkeleton = () => (
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-24 w-full md:w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </CardContent>
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
        {isLoadingSettings ? (
          <EstablishmentFormSkeleton />
        ) : settingsError ? (
           <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium text-destructive">Erro ao carregar dados</p>
            <p className="text-sm text-muted-foreground max-w-md">{settingsError.message || "Tente recarregar a página."}</p>
            <Button onClick={() => refetchEstablishmentSettings()} className="mt-3" disabled={isFetchingSettings}>
              <RotateCcw className="mr-2 h-4 w-4 data-[hide=false]:animate-spin" data-hide={!isFetchingSettings} />
              Tentar Novamente
            </Button>
          </CardContent>
        ) : (
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
                    <Image src={logoPreview} alt="Prévia do Logo" width={180} height={60} className="max-h-16 object-contain" data-ai-hint="company logo" onError={() => {
                        // Fallback if the preview URL (e.g., from createObjectURL) is invalid or image fails to load
                        // This might happen if originalLogoUrl was a placeholder that is no longer valid
                        // or if the uploaded file is not a valid image.
                        setLogoPreview(null); 
                        toast({title: "Erro de Logo", description: "Não foi possível carregar a prévia do logo.", variant: "destructive"});
                    }}/>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Label className="cursor-pointer">
                      <UploadCloud className="mr-2 h-4 w-4" /> {logoPreview ? "Alterar Logo" : "Carregar Logo"}
                      <Input id="logoUpload" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" className="sr-only" onChange={handleLogoChange} />
                    </Label>
                  </Button>
                  {(logoPreview || logoFile === null) && ( // Show remove if there's a preview OR if remove was clicked (logoFile is null)
                    <Button type="button" variant="ghost" onClick={handleRemoveLogo} className="text-destructive hover:text-destructive w-full sm:w-auto">
                      Remover Logo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Recomendado: PNG, JPG, WEBP ou SVG. Máx 800KB. Idealmente 180x60 pixels.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={saveSettingsMutation.isPending || isFetchingSettings}>
                {(saveSettingsMutation.isPending || isFetchingSettings) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Dados do Estabelecimento
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
    

    