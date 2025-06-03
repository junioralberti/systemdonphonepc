
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

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCnpj, setBusinessCnpj] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null | undefined>(undefined); // undefined: no change, null: remove, File: new file
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);

  const { data: establishmentSettings, isLoading: isLoadingSettings, error: settingsError, refetch: refetchEstablishmentSettings, isFetching: isFetchingSettings } = useQuery<EstablishmentSettings | null, Error>({
    queryKey: ["establishmentSettings"],
    queryFn: getEstablishmentSettings,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (establishmentSettings) {
      setBusinessName(establishmentSettings.businessName || "DONPHONE INFORMÁTICA E CELULARES");
      setBusinessAddress(establishmentSettings.businessAddress || "RUA CRISTALINO MACHADO, N°:95, BAIRRO: CENTRO, CIDADE: BARRACÃO, ESTADO: PARANÁ");
      setBusinessCnpj(establishmentSettings.businessCnpj || "58.435.813/0004-94");
      setBusinessPhone(establishmentSettings.businessPhone || "49991287685");
      setBusinessEmail(establishmentSettings.businessEmail || "contato@donphone.com");
      if (establishmentSettings.logoUrl) {
        setLogoPreview(establishmentSettings.logoUrl);
        setOriginalLogoUrl(establishmentSettings.logoUrl);
      } else {
        setLogoPreview(null);
        setOriginalLogoUrl(null);
      }
    } else if (!isLoadingSettings && !settingsError) {
      // If no settings found and not loading/error, set defaults
      setBusinessName("DONPHONE INFORMÁTICA E CELULARES");
      setBusinessAddress("RUA CRISTALINO MACHADO, N°:95, BAIRRO: CENTRO, CIDADE: BARRACÃO, ESTADO: PARANÁ");
      setBusinessCnpj("58.435.813/0004-94");
      setBusinessPhone("49991287685");
      setBusinessEmail("contato@donphone.com");
      setLogoPreview("https://placehold.co/180x60.png");
      setOriginalLogoUrl("https://placehold.co/180x60.png");
    }
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
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
        setOriginalLogoUrl(data.logoUrl);
      } else {
        setLogoPreview(null);
        setOriginalLogoUrl(null);
      }
      setLogoFile(undefined); // Reset logo file state
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao Salvar", description: `Falha ao salvar dados: ${error.message}`, variant: "destructive" });
    },
  });

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
            <p className="text-sm text-muted-foreground max-w-md">{settingsError.message}</p>
            <Button onClick={() => refetchEstablishmentSettings()} className="mt-3">
              <RotateCcw className="mr-2 h-4 w-4 animate-spin data-[hide=true]:hidden" data-hide={!isFetchingSettings} />
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
                  <div className="mb-3 rounded-md border border-dashed p-3 inline-block relative">
                    <Image src={logoPreview} alt="Prévia do Logo" width={180} height={60} className="max-h-16 object-contain" data-ai-hint="company logo" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Label className="cursor-pointer">
                      <UploadCloud className="mr-2 h-4 w-4" /> {logoPreview ? "Alterar Logo" : "Carregar Logo"}
                      <Input id="logoUpload" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" className="sr-only" onChange={handleLogoChange} />
                    </Label>
                  </Button>
                  {logoPreview && (
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
                {saveSettingsMutation.isPending ? (
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
