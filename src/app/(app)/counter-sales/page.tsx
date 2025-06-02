import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanLine, PlusCircle, ShoppingCart } from "lucide-react";

export default function CounterSalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Counter Sales</h1>
         <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" /> View Cart (0)
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Sale</CardTitle>
          <CardDescription>Record sales of products and accessories at the counter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Scan or enter product SKU" className="flex-grow" />
            <Button variant="outline" size="icon"><ScanLine className="h-5 w-5"/></Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
          </div>
          <p className="text-muted-foreground">Sales recording interface will be here. (Item list, total, payment options)</p>
          <div className="flex justify-end">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">Complete Sale</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
