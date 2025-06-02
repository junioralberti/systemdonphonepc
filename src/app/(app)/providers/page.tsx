import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProvidersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Providers Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Provider
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Provider List</CardTitle>
          <CardDescription>Manage your parts and service providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Provider management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
