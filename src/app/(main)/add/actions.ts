
'use server';

import { z } from "zod";
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';
import Issue from '@/models/Issue';
import { revalidatePath } from "next/cache";

// Schemas for form data
const riskFormSchema = z.object({
  Month: z.string().min(1, "Month is required"),
  "Project Code": z.string().min(1, "Project Code is required"),
  "Risk Status": z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  Description: z.string().min(10, "Description must be at least 10 characters."),
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

const issueFormSchema = z.object({
  Month: z.string().min(1, "Month is required"),
  Category: z.string().optional(),
  SubCategory: z.string().optional(),
  Portfolio: z.string().optional(),
  Title: z.string().min(5, "Title must be at least 5 characters."),
  Discussion: z.string().min(10, "Discussion must be at least 10 characters."),
  Resolution: z.string().optional(),
  "Due Date": z.date().optional(),
  Owner: z.string().min(1, "Owner is required."),
  Response: z.enum(["Under Review", "In Progress", "Closed"]).nullable().optional(),
  Impact: z.enum(["Low", "Medium", "High"]).nullable().optional(),
  "Impact ($)": z.coerce.number().optional().nullable(),
  Priority: z.enum(["Low", "Medium", "High", "Critical", "(1) High"]),
  ProjectName: z.string().min(1, "Project Name is required."),
  Status: z.enum(["Open", "Resolved", "Escalated", "Closed"]),
});

// MongoDB data creation functions
export async function createRisk(values: z.infer<typeof riskFormSchema>) {
  // The data is already validated on the client by react-hook-form with zodResolver.
  try {
    await connectDB();

    // Calculate risk score: Probability × Impact Rating
    const probability = values.Probability || 0;
    const impactRating = values["Impact Rating (0.05-0.8)"] || 0;
    const riskScore = probability * impactRating;

    // Calculate EMV: Probability × Impact Value
    const impactValue = values["Impact Value ($)"] || 0;
    const emv = probability * impactValue;

    // Use simple field names that MongoDB can handle
    // MongoDB has issues with field names containing: . ( ) $
    const riskData = {
      Title: values.Title,
      Description: values.Description,
      Month: values.Month,
      ProjectCode: values["Project Code"],
      RiskStatus: values["Risk Status"],
      Probability: probability,
      ImpactRating: impactRating, // Simple name works!
      MitigationPlan: values.MitigationPlan,
      ContingencyPlan: values.ContingencyPlan,
      ImpactValue: impactValue, // Simple name works!
      BudgetContingency: values["Budget Contingency"],
      Owner: values.Owner,
      DueDate: values.DueDate,
      RiskScore: riskScore,
      EMV: emv,
    };

    console.log("Saving risk with data:", riskData); // Debug log
    await Risk.create(riskData);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true, message: "Risk created successfully." };
  } catch (error) {
    console.error("Error creating risk:", error);
    return { success: false, message: "Failed to create risk in database." };
  }
}

export async function createIssue(values: z.infer<typeof issueFormSchema>) {
  // The data is already validated on the client by react-hook-form with zodResolver.
  try {
    await connectDB();
    await Issue.create(values);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true, message: "Issue created successfully." };
  } catch (error) {
    console.error("Error creating issue:", error);
    return { success: false, message: "Failed to create issue in database." };
  }
}

export async function getAllRisks() {
  try {
    await connectDB();
    const risks = await Risk.find({}).lean();

    return risks.map((risk: any) => ({
      id: risk._id.toString(),
      Title: risk.Title,
      Description: risk.Description,
      MitigationPlan: risk.MitigationPlan || '',
      ContingencyPlan: risk.ContingencyPlan || '',
      Probability: risk.Probability || 0,
      'Impact Rating (0.05-0.8)': risk.ImpactRating || risk['Impact Rating (0.05-0.8)'] || 0,
      'Project Code': risk.ProjectCode || risk['Project Code'] || '',
      RiskStatus: risk.RiskStatus || risk['Risk Status'] || 'Open',
    }));
  } catch (error) {
    console.error('Error fetching risks:', error);
    return [];
  }
}
