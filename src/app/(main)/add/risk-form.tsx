
'use client';

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Bot,
  Loader2,
  Sparkles,
  Info,
  CalendarIcon,
} from "lucide-react";
// Firebase removed - using MongoDB via server actions

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Product, RiskIssue } from "@/lib/types";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { RiskHeatMap } from "@/components/risk-heat-map";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createRisk, getAllRisks } from "./actions";
import { rephraseDescription, suggestMitigationStrategies, suggestSimilarRisks, suggestTitle } from "@/app/(main)/actions";
import type { SuggestSimilarRisksOutput, SuggestMitigationStrategiesOutput } from "@/ai/flows";


const riskFormSchema = z.object({
  Month: z.string().min(1, "Month is required"),
  "Project Code": z.string().min(1, "Project Code is required"),
  "Risk Status": z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  Description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  Probability: z.coerce.number().min(0).max(1),
  "Impact Rating (0.05-0.8)": z.coerce.number().min(0.05).max(0.8),
  MitigationPlan: z.string().optional(),
  ContingencyPlan: z.string().optional(),
  "Impact Value ($)": z.coerce.number().min(0),
  "Budget Contingency": z.coerce.number().min(0),
  Owner: z.string().optional(),
  DueDate: z.date().optional(),
  Title: z.string().min(5, "Title must be at least 5 characters."),
});

export function RiskForm() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [risks, setRisks] = React.useState<RiskIssue[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<Product | null>(
    null
  );

  const [suggestion, setSuggestion] = React.useState<SuggestSimilarRisksOutput | null>(null);
  const [isCheckingSimilar, setIsCheckingSimilar] = React.useState(false);

  const [mitigationSuggestions, setMitigationSuggestions] = React.useState<string[]>([]);
  const [isFetchingMitigation, setIsFetchingMitigation] = React.useState(false);

  const [contingencySuggestions, setContingencySuggestions] = React.useState<string[]>([]);
  const [isFetchingContingency, setIsFetchingContingency] = React.useState(false);

  const [rephrasedDescription, setRephrasedDescription] = React.useState<string | null>(null);
  const [isRephrasing, setIsRephrasing] = React.useState(false);

  const [titleSuggestion, setTitleSuggestion] = React.useState<string | null>(null);
  const [isFetchingTitle, setIsFetchingTitle] = React.useState(false);

  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      Month: "",
      "Project Code": "",
      "Risk Status": "Open",
      Description: "",
      Probability: 0.5,
      "Impact Rating (0.05-0.8)": 0.20,
      MitigationPlan: "",
      ContingencyPlan: "",
      "Impact Value ($)": 0,
      "Budget Contingency": 0,
      Owner: "",
      Title: "",
    },
  });

  const formValues = form.watch();

  const completionPercentage = React.useMemo(() => {
    const requiredFields = ["Month", "Project Code", "Title", "Description", "Impact Value ($)"];
    const filledFields = requiredFields.filter(field => {
      const value = formValues[field as keyof typeof formValues];
      return value !== null && value !== undefined && value !== '';
    });
    return (filledFields.length / requiredFields.length) * 100;
  }, [formValues]);

  React.useEffect(() => {
    async function getPageData() {
      try {
        const fetchedRisks = await getAllRisks();
        setRisks(fetchedRisks as any);
        // Products can remain empty for now as it's not critical for similar risk detection
        setProducts([]);
      } catch (error) {
        console.error('Error loading risks:', error);
        setRisks([]);
        setProducts([]);
      }
    }
    getPageData();
  }, [])

  const projectCode = form.watch("Project Code");

  const probability = form.watch("Probability");
  const impactRating = form.watch("Impact Rating (0.05-0.8)");
  const impactValue = form.watch("Impact Value ($)");
  const budgetContingency = form.watch("Budget Contingency");
  const descriptionValue = form.watch("Description");

  const debouncedDescription = useDebounce(descriptionValue, 500);

  const projectOptions = React.useMemo(() => {
    const productCodes = products.map(p => ({ value: p.code, label: `${p.name} (${p.code})` }));
    const riskProjectCodes = Array.from(new Set(risks.map(r => r['Project Code']).filter(Boolean)));

    const combinedCodes = [...productCodes];
    riskProjectCodes.forEach(code => {
      if (!combinedCodes.some(c => c.value === code)) {
        combinedCodes.push({ value: code!, label: code! });
      }
    });

    return combinedCodes.sort((a, b) => a.label.localeCompare(b.label));
  }, [products, risks]);

  const handleCheckSimilarRisks = async () => {
    setIsCheckingSimilar(true);
    setSuggestion(null);
    setRephrasedDescription(null);

    const existingRisks = risks.map(r => ({
      id: r.id,
      title: r.Title,
      description: r.Description,
      mitigationPlan: r.MitigationPlan,
      contingencyPlan: r.ContingencyPlan,
      probability: r.Probability,
      impactRating: r['Impact Rating (0.05-0.8)'],
    }));

    try {
      const res = await suggestSimilarRisks({
        description: descriptionValue,
        existingRisks: JSON.stringify(existingRisks)
      });
      setSuggestion(res);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not fetch similar risks.' });
    } finally {
      setIsCheckingSimilar(false);
    }
  };

  const handleSuggestMitigations = async () => {
    setIsFetchingMitigation(true);
    setMitigationSuggestions([]);
    try {
      const res = await suggestMitigationStrategies({ riskOrIssueDescription: descriptionValue });
      setMitigationSuggestions((res as SuggestMitigationStrategiesOutput).suggestedMitigationStrategies);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest mitigations." });
    } finally {
      setIsFetchingMitigation(false);
    }
  };

  const handleSuggestTitle = async () => {
    setIsFetchingTitle(true);
    setTitleSuggestion(null);
    try {
      const res = await suggestTitle({ description: descriptionValue });
      setTitleSuggestion(res.title);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest a title." });
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const handleSuggestContingency = async () => {
    setIsFetchingContingency(true);
    setContingencySuggestions([]);
    try {
      const res = await suggestMitigationStrategies({ riskOrIssueDescription: descriptionValue });
      setContingencySuggestions((res as SuggestMitigationStrategiesOutput).suggestedMitigationStrategies);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest contingency plans." });
    } finally {
      setIsFetchingContingency(false);
    }
  };

  const handleRephraseDescription = async () => {
    setIsRephrasing(true);
    setSuggestion(null); // Clear other suggestions
    setRephrasedDescription(null);
    try {
      const res = await rephraseDescription({ description: descriptionValue });
      setRephrasedDescription(res.rephrasedDescription);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to rephrase description.' })
    } finally {
      setIsRephrasing(false);
    }
  }


  const riskScore = React.useMemo(
    () => probability * impactRating,
    [probability, impactRating]
  );
  const emv = React.useMemo(
    () => probability * impactValue,
    [probability, impactValue]
  );
  const deficitSurplus = React.useMemo(
    () => budgetContingency - emv,
    [budgetContingency, emv]
  );
  const riskNature = React.useMemo(
    () => (impactValue > 0 ? "Financial" : "Non-Financial"),
    [impactValue]
  );

  const riskLevel = React.useMemo(() => {
    if (riskScore >= 0.15) return "High";
    if (riskScore >= 0.03) return "Medium";
    return "Low";
  }, [riskScore]);

  React.useEffect(() => {
    const project = products.find((p) => p.code === projectCode);
    setSelectedProject(project || null);

    if (project) {
      const projectPOValue = project.value || 0;
      const projectVA = project.value * 0.1; // mock

      form.setValue("Impact Value ($)", projectPOValue);
      form.setValue("Budget Contingency", projectVA);
    }
  }, [projectCode, products, form]);

  const onSubmit = async (values: z.infer<typeof riskFormSchema>) => {
    const result = await createRisk(values as any); // Cast to any to avoid type issues with spaced keys
    if (result.success) {
      toast({ title: "Success", description: "New risk created." });
      form.reset();
      setSelectedProject(null);
      setSuggestion(null);
      setRephrasedDescription(null);
      setMitigationSuggestions([]);
      setContingencySuggestions([]);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  const handleUseMatchedRisk = (matchedRisk: NonNullable<SuggestSimilarRisksOutput['matchedRisk']>) => {
    form.setValue("Title", matchedRisk.title);
    form.setValue("Description", matchedRisk.description);
    if (matchedRisk.mitigationPlan) form.setValue("MitigationPlan", matchedRisk.mitigationPlan);
    if (matchedRisk.contingencyPlan) form.setValue("ContingencyPlan", matchedRisk.contingencyPlan);
    if (matchedRisk.probability) form.setValue("Probability", matchedRisk.probability);
    if (matchedRisk.impactRating) form.setValue("Impact Rating (0.05-0.8)", matchedRisk.impactRating);
    setSuggestion(null);
    setRephrasedDescription(null);
    toast({ title: "Form Filled", description: "Form has been pre-filled with the matched risk data." });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle>Project & Risk Identification</CardTitle>
                  <CardDescription>
                    Start by identifying the project and the risk.
                  </CardDescription>
                </div>
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Completion</span>
                    <span>{Math.round(completionPercentage)}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="Month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Project Code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code</FormLabel>
                      <FormControl>
                        <Combobox
                          options={projectOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select or add project..."
                          searchPlaceholder="Search projects..."
                          notFoundText="No project found. You can add a new one."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-full space-y-2">
                  <FormField
                    control={form.control}
                    name="Title"
                    render={({ field }) => (
                      <FormItem >
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="A short, clear risk headline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleSuggestTitle} disabled={isFetchingTitle || !descriptionValue || descriptionValue.length < 10}>
                    {isFetchingTitle ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Suggest Title with AI
                  </Button>
                  {titleSuggestion && (
                    <Alert className="border-accent">
                      <Bot className="h-4 w-4" />
                      <AlertTitle>AI Suggested Title</AlertTitle>
                      <AlertDescription>
                        <p className="italic my-2 p-2 bg-muted rounded">&quot;{titleSuggestion}&quot;</p>
                        <Button type="button" size="sm" onClick={() => {
                          form.setValue("Title", titleSuggestion);
                          setTitleSuggestion(null);
                        }}>Use Suggestion</Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="col-span-full space-y-2">
                  <FormField
                    control={form.control}
                    name="Description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the risk in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleRephraseDescription} disabled={isRephrasing || !descriptionValue || descriptionValue.length < 10}>
                    {isRephrasing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Rephrase with AI
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCheckSimilarRisks}
                    disabled={isCheckingSimilar || !descriptionValue || descriptionValue.length < 10}
                  >
                    {isCheckingSimilar ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="mr-2 h-4 w-4" />
                    )}
                    Check for Similar Risks
                  </Button>
                  {suggestion?.matchedRisk && suggestion.detailedSummary && (
                    <Card className="border-accent">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          Similar Risks Found
                        </CardTitle>
                        <CardDescription>
                          Review the following similar risks to make an informed decision
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Probability</TableHead>
                                <TableHead className="text-center">Impact</TableHead>
                                <TableHead className="text-center">Risk Score</TableHead>
                                <TableHead className="text-center">Similarity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium max-w-[200px]">
                                  {suggestion.matchedRisk.title}
                                </TableCell>
                                <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                                  {suggestion.matchedRisk.description?.substring(0, 100)}{suggestion.matchedRisk.description && suggestion.matchedRisk.description.length > 100 ? '...' : ''}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline">
                                    {suggestion.matchedRisk.probability ? (suggestion.matchedRisk.probability * 100).toFixed(0) + '%' : 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline">
                                    {suggestion.matchedRisk.impactRating ? suggestion.matchedRisk.impactRating.toFixed(2) : 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={(
                                    suggestion.matchedRisk.probability && suggestion.matchedRisk.impactRating &&
                                    (suggestion.matchedRisk.probability * suggestion.matchedRisk.impactRating) >= 0.15
                                  ) ? "destructive" : "secondary"}>
                                    {suggestion.matchedRisk.probability && suggestion.matchedRisk.impactRating
                                      ? (suggestion.matchedRisk.probability * suggestion.matchedRisk.impactRating).toFixed(3)
                                      : 'N/A'
                                    }
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className="bg-amber-500">High</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleUseMatchedRisk(suggestion.matchedRisk!)}
                                  >
                                    Use Data
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        <div className="mt-4 space-y-3">
                          <div className="rounded-lg bg-muted p-3">
                            <h4 className="text-sm font-semibold mb-1">AI Analysis</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.detailedSummary.analysis}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-muted p-3">
                              <h4 className="text-sm font-semibold mb-2">Key Metrics</h4>
                              <div className="space-y-1">
                                {suggestion.detailedSummary.keyMetrics.map(metric => (
                                  <div key={metric.name} className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{metric.name}:</span>
                                    <span className="font-medium">{metric.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <h4 className="text-sm font-semibold mb-1">AI Recommendation</h4>
                              <p className="text-xs text-muted-foreground">{suggestion.detailedSummary.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {suggestion && !suggestion.matchedRisk && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>No Similar Risks Found</AlertTitle>
                      <AlertDescription>
                        No existing risks were found that match this description. This appears to be a unique risk.
                      </AlertDescription>
                    </Alert>
                  )}
                  {(suggestion?.rephrasedDescription || rephrasedDescription) && (
                    <Alert className="border-accent">
                      <Bot className="h-4 w-4" />
                      <AlertTitle>AI Suggestion</AlertTitle>
                      <AlertDescription>
                        <p>Consider rephrasing for clarity:</p>
                        <p className="italic my-2 p-2 bg-muted rounded">"{rephrasedDescription || suggestion.rephrasedDescription}"</p>
                        <Button type="button" size="sm" onClick={() => {
                          form.setValue("Description", rephrasedDescription || suggestion.rephrasedDescription || '');
                          setRephrasedDescription(null);
                          setSuggestion(null);
                        }}>Use Suggestion</Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans</CardTitle>
                <CardDescription>
                  Outline mitigation and contingency plans. Use AI to get suggestions based on the description.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="MitigationPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mitigation Plan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the plan to reduce probability..."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleSuggestMitigations} disabled={isFetchingMitigation || !descriptionValue}>
                    {isFetchingMitigation ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Suggest with AI
                  </Button>
                  {mitigationSuggestions.length > 0 && (
                    <Alert className="border-accent">
                      <Bot className="h-4 w-4" />
                      <AlertTitle>AI Suggested Mitigation Strategies</AlertTitle>
                      <AlertDescription>
                        Click to use a suggestion.
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {mitigationSuggestions.map((s, i) => (
                            <li key={i} className="cursor-pointer hover:underline" onClick={() => { form.setValue("MitigationPlan", s); setMitigationSuggestions([]) }}>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ContingencyPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contingency Plan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the plan if the risk materializes..."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleSuggestContingency} disabled={isFetchingContingency || !descriptionValue}>
                    {isFetchingContingency ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Suggest with AI
                  </Button>
                  {contingencySuggestions.length > 0 && (
                    <Alert className="border-accent">
                      <Bot className="h-4 w-4" />
                      <AlertTitle>AI Suggested Contingency Plans</AlertTitle>
                      <AlertDescription>
                        Click to use a suggestion.
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {contingencySuggestions.map((s, i) => (
                            <li key={i} className="cursor-pointer hover:underline" onClick={() => { form.setValue("ContingencyPlan", s); setContingencySuggestions([]) }}>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="Risk Status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Mitigated">Mitigated</SelectItem>
                          <SelectItem value="Transferred">Transferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter owner name" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="DueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {selectedProject && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedProject.name}</CardTitle>
                  <CardDescription>({selectedProject.code})</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>{selectedProject.currentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO Value</span>
                    <span>${selectedProject.value.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Scoring & Financials</CardTitle>
                <CardDescription>
                  Visually assess risk using the heat map below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RiskHeatMap probability={probability} impact={impactRating} />
                <Separator />
                <FormField
                  control={form.control}
                  name="Probability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Probability</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a probability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0.1">Very Low (0.1)</SelectItem>
                          <SelectItem value="0.3">Low (0.3)</SelectItem>
                          <SelectItem value="0.5">Medium (0.5)</SelectItem>
                          <SelectItem value="0.7">High (0.7)</SelectItem>
                          <SelectItem value="0.9">Very High (0.9)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Impact Rating (0.05-0.8)"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Rating</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an impact rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0.05">Very Low (0.05)</SelectItem>
                          <SelectItem value="0.1">Low (0.10)</SelectItem>
                          <SelectItem value="0.2">Medium (0.20)</SelectItem>
                          <SelectItem value="0.4">High (0.40)</SelectItem>
                          <SelectItem value="0.8">Very High (0.80)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Impact Value ($)"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Budget Contingency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Contingency ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="text-sm space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Risk Score</span>
                    <span>{riskScore.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span>{riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EMV ($)</span>
                    <span>{emv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Deficit/Surplus ($)
                    </span>
                    <span
                      className={cn(
                        deficitSurplus < 0
                          ? "text-destructive"
                          : "text-green-600"
                      )}
                    >
                      {deficitSurplus.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Nature</span>
                    <span>{riskNature}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Risk"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
