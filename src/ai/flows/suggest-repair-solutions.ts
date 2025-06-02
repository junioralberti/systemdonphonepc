// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting repair solutions based on a customer's problem description and phone model.
 *
 * - suggestRepairSolutions - A function that takes customer's problem description and phone model and returns potential solutions, parts needed, and estimated repair time.
 * - SuggestRepairSolutionsInput - The input type for the suggestRepairSolutions function.
 * - SuggestRepairSolutionsOutput - The return type for the suggestRepairSolutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRepairSolutionsInputSchema = z.object({
  problemDescription: z.string().describe('The customer provided description of the phone issue.'),
  phoneModel: z.string().describe('The model of the phone that needs repair.'),
});
export type SuggestRepairSolutionsInput = z.infer<typeof SuggestRepairSolutionsInputSchema>;

const SuggestRepairSolutionsOutputSchema = z.object({
  suggestedSolutions: z.array(z.string()).describe('A list of potential solutions to the problem.'),
  partsNeeded: z.array(z.string()).describe('A list of parts that may be needed for the repair.'),
  estimatedRepairTime: z.string().describe('An estimated repair time for the identified solutions.'),
});
export type SuggestRepairSolutionsOutput = z.infer<typeof SuggestRepairSolutionsOutputSchema>;

export async function suggestRepairSolutions(input: SuggestRepairSolutionsInput): Promise<SuggestRepairSolutionsOutput> {
  return suggestRepairSolutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepairSolutionsPrompt',
  input: {schema: SuggestRepairSolutionsInputSchema},
  output: {schema: SuggestRepairSolutionsOutputSchema},
  prompt: `You are an expert phone repair technician with years of experience.
Given the following problem description and phone model, suggest potential solutions, a list of parts that might be needed, and an estimated repair time.

Problem Description: {{{problemDescription}}}
Phone Model: {{{phoneModel}}}

Respond concisely.`,
});

const suggestRepairSolutionsFlow = ai.defineFlow(
  {
    name: 'suggestRepairSolutionsFlow',
    inputSchema: SuggestRepairSolutionsInputSchema,
    outputSchema: SuggestRepairSolutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
