
"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
// Imports relacionados aos dados do estabelecimento foram removidos pois a seção foi removida.
// import { Building, Save, Loader2, UploadCloud, AlertTriangle, RotateCcw } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import Image from "next/image";
// import { getEstablishmentSettings, saveEstablishmentSettings, type EstablishmentSettings } from "@/services/settingsService";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export default function DashboardPage() {
  // const queryClient = useQueryClient(); // Removido pois não há mais mutations nesta página
  // const { toast } = useToast(); // Removido pois não há mais interações que gerem toast nesta página

  // States para os dados do estabelecimento foram removidos
  // const [businessName, setBusinessName] = useState("DONPHONE INFORMÁTICA E CELULARES");
  // ... e outros states relacionados

  const [totalRevenue, setTotalRevenue] = useState<string>("N/D");
  const [activeClients, setActiveClients] = useState<string>("N/D");
  const [openServiceOrders, setOpenServiceOrders] = useState<string>("N/D");
  const [pendingRepairs, setPendingRepairs] = useState<string>("N/D");
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(true);

  // useQuery para establishmentSettings foi removido
  // const { data: establishmentSettings, isLoading: isLoadingSettings, error: settingsError, refetch: refetchEstablishmentSettings, isFetching: isFetchingSettings } = useQuery<EstablishmentSettings | null, Error>({
  //   queryKey: ["establishmentSettings"],
  //   queryFn: getEstablishmentSettings,
  //    refetchOnWindowFocus: false,
  // });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingDashboardStats(false), 1200);
    return () => clearTimeout(timer);
    // TODO: Implementar busca real de dados para os cards do dashboard
  }, []);


  // useEffect para popular os campos do formulário de estabelecimento foi removido
  // useEffect(() => { ... });

  // useEffect para tratar erro de carregamento de settings foi removido
  // useEffect(() => { ... });

  // saveSettingsMutation foi removido
  // const saveSettingsMutation = useMutation({ ... });

  // Handlers para o formulário de estabelecimento foram removidos
  // const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => { ... };
  // const handleRemoveLogo = () => { ... };
  // const handleSaveEstablishmentData = async (e: FormEvent) => { ... };

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
            <div className="text-xs text-muted-foreground">
              {isLoadingDashboardStats ? <Skeleton className="h-3 w-32" /> : "Cálculo pendente."}
            </div>
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
             <div className="text-xs text-muted-foreground">
              {isLoadingDashboardStats ? <Skeleton className="h-3 w-28" /> : "Cálculo pendente."}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens de Serviço Abertas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {renderStatValue(openServiceOrders, isLoadingDashboardStats)}
             <div className="text-xs text-muted-foreground">
              {isLoadingDashboardStats ? <Skeleton className="h-3 w-24" /> : "Cálculo pendente."}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reparos Pendentes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStatValue(pendingRepairs, isLoadingDashboardStats)}
            <div className="text-xs text-muted-foreground">
             {isLoadingDashboardStats ? <Skeleton className="h-3 w-36" /> : "Cálculo pendente."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Dados do Estabelecimento foi removido daqui */}

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
