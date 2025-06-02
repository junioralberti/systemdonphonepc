
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function CalculadoraPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">Calculadora</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Calculadora Simples
          </CardTitle>
          <CardDescription>
            Uma calculadora básica para auxiliar nas operações do dia a dia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A funcionalidade da calculadora será implementada aqui.
          </p>
          {/* Futuramente, aqui entrarão os botões e o display da calculadora */}
        </CardContent>
      </Card>
    </div>
  );
}
