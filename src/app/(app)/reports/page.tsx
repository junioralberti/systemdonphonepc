
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChartHorizontalBig, PieChart, History } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatórios</CardTitle>
          <CardDescription>Acesse vários relatórios de vendas, serviços, financeiros e de inventário.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <BarChartHorizontalBig className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Relatório de Vendas</CardTitle>
                <CardDescription className="text-xs">Por período, método de pagamento, produto.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Gerar</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <History className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Relatório de OS</CardTitle>
                <CardDescription className="text-xs">Por técnico, status, datas.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Gerar</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <PieChart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Relatório Financeiro</CardTitle>
                <CardDescription className="text-xs">Entradas, saídas, lucro bruto.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Gerar</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Relatório de Inventário</CardTitle>
                <CardDescription className="text-xs">Inventário mínimo, produtos zerados.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Gerar</Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
