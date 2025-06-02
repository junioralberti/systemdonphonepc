import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChartHorizontalBig, PieChart, History } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Access various sales, service, financial, and inventory reports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <BarChartHorizontalBig className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Sales Report</CardTitle>
                <CardDescription className="text-xs">By period, payment method, product.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Generate</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <History className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">OS Report</CardTitle>
                <CardDescription className="text-xs">By technician, status, dates.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Generate</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <PieChart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Financial Report</CardTitle>
                <CardDescription className="text-xs">Entries, exits, gross profit.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Generate</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Inventory Report</CardTitle>
                <CardDescription className="text-xs">Minimum inventory, zeroed products.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button variant="outline" className="w-full">Generate</Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
