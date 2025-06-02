import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ServiceOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Service Orders</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Service Order
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Service Orders</CardTitle>
          <CardDescription>Track and manage all device repairs and services.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Service order management interface will be here. (List of OS, status, customer details, device info, problem, history)</p>
        </CardContent>
      </Card>
    </div>
  );
}
