"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { suggestRepairSolutions, type SuggestRepairSolutionsOutput, type SuggestRepairSolutionsInput } from '@/ai/flows/suggest-repair-solutions';
import { useToast } from '@/hooks/use-toast';

export default function AiDiagnosticsPage() {
  const [problemDescription, setProblemDescription] = useState('');
  const [phoneModel, setPhoneModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SuggestRepairSolutionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);

    if (!problemDescription || !phoneModel) {
      setError("Please fill in both problem description and phone model.");
      setIsLoading(false);
      toast({
        title: "Missing Information",
        description: "Problem description and phone model are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const input: SuggestRepairSolutionsInput = { problemDescription, phoneModel };
      const output = await suggestRepairSolutions(input);
      setResults(output);
      toast({
        title: "Suggestions Ready",
        description: "AI diagnostic suggestions have been generated.",
        variant: "default",
      });
    } catch (err) {
      console.error("AI Diagnostic Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get suggestions: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to get suggestions: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold">AI-Powered Diagnostic Assistance</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Diagnose Phone Issue</CardTitle>
          <CardDescription>Enter the customer's problem description and phone model to get AI-powered repair suggestions.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneModel">Phone Model</Label>
              <Input 
                id="phoneModel" 
                value={phoneModel} 
                onChange={(e) => setPhoneModel(e.target.value)} 
                placeholder="e.g., iPhone 13 Pro, Samsung Galaxy S21" 
                className="text-base"
              />
            </div>
            <div>
              <Label htmlFor="problemDescription">Problem Description</Label>
              <Textarea 
                id="problemDescription" 
                value={problemDescription} 
                onChange={(e) => setProblemDescription(e.target.value)} 
                placeholder="e.g., Screen is cracked, phone doesn't turn on, battery drains quickly..."
                rows={4}
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosing...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Diagnostic Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Suggested Solutions:</h3>
              {results.suggestedSolutions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {results.suggestedSolutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No specific solutions suggested.</p>
              )}
            </div>
            <hr />
            <div>
              <h3 className="font-semibold text-lg mb-1">Parts Needed:</h3>
              {results.partsNeeded.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {results.partsNeeded.map((part, index) => (
                    <li key={index}>{part}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No specific parts identified as needed.</p>
              )}
            </div>
            <hr />
            <div>
              <h3 className="font-semibold text-lg mb-1">Estimated Repair Time:</h3>
              <p className="text-sm">{results.estimatedRepairTime || "Not estimated."}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
