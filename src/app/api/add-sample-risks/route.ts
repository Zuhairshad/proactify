import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function POST() {
    try {
        await connectDB();

        const sampleRisks = [
            {
                Title: "Supply Chain Disruption Risk",
                Description: "Potential delays in material delivery due to global supply chain issues",
                Month: "January 2025",
                ProjectCode: "PRJ-001",
                RiskStatus: "Open",
                Probability: 0.7,
                ImpactRating: 0.6,
                ImpactValue: 150000,
                BudgetContingency: 30000,
                Owner: "John Smith",
                MitigationPlan: "Identify alternative suppliers and maintain buffer stock",
                ContingencyPlan: "Activate backup suppliers and adjust project timeline if needed",
                RiskScore: 0.42, // 0.7 * 0.6
                EMV: 105000, // 0.7 * 150000
                DueDate: new Date('2025-02-15')
            },
            {
                Title: "Resource Availability Risk",
                Description: "Key team members may not be available during critical project phases",
                Month: "February 2025",
                ProjectCode: "PRJ-002",
                RiskStatus: "Open",
                Probability: 0.5,
                ImpactRating: 0.4,
                ImpactValue: 80000,
                BudgetContingency: 16000,
                Owner: "Sarah Johnson",
                MitigationPlan: "Cross-train team members and document all critical processes",
                ContingencyPlan: "Hire temporary contractors or redistribute workload",
                RiskScore: 0.20, // 0.5 * 0.4
                EMV: 40000, // 0.5 * 80000
                DueDate: new Date('2025-03-01')
            },
            {
                Title: "Technology Integration Risk",
                Description: "New software system may have compatibility issues with existing infrastructure",
                Month: "March 2025",
                ProjectCode: "PRJ-003",
                RiskStatus: "Open",
                Probability: 0.6,
                ImpactRating: 0.5,
                ImpactValue: 120000,
                BudgetContingency: 24000,
                Owner: "Mike Chen",
                MitigationPlan: "Conduct thorough compatibility testing and pilot implementation",
                ContingencyPlan: "Revert to legacy system or implement phased rollout",
                RiskScore: 0.30, // 0.6 * 0.5
                EMV: 72000, // 0.6 * 120000
                DueDate: new Date('2025-03-30')
            },
            {
                Title: "Regulatory Compliance Risk",
                Description: "Changes in industry regulations may require project scope adjustments",
                Month: "April 2025",
                ProjectCode: "PRJ-004",
                RiskStatus: "Open",
                Probability: 0.4,
                ImpactRating: 0.7,
                ImpactValue: 200000,
                BudgetContingency: 40000,
                Owner: "Emma Davis",
                MitigationPlan: "Monitor regulatory changes and engage compliance consultants",
                ContingencyPlan: "Adjust project scope and timeline to meet new requirements",
                RiskScore: 0.28, // 0.4 * 0.7
                EMV: 80000, // 0.4 * 200000
                DueDate: new Date('2025-04-15')
            },
            {
                Title: "Budget Overrun Risk",
                Description: "Project costs may exceed allocated budget due to unforeseen expenses",
                Month: "May 2025",
                ProjectCode: "PRJ-005",
                RiskStatus: "Open",
                Probability: 0.8,
                ImpactRating: 0.65,
                ImpactValue: 180000,
                BudgetContingency: 36000,
                Owner: "David Brown",
                MitigationPlan: "Implement strict cost controls and regular budget reviews",
                ContingencyPlan: "Reduce project scope or secure additional funding",
                RiskScore: 0.52, // 0.8 * 0.65
                EMV: 144000, // 0.8 * 180000
                DueDate: new Date('2025-05-31')
            }
        ];

        const created = await Risk.insertMany(sampleRisks);

        return NextResponse.json({
            success: true,
            message: `Created ${created.length} sample risks`,
            count: created.length,
            risks: created.map(r => ({
                title: r.Title,
                impactRating: r.ImpactRating,
                riskScore: r.RiskScore
            }))
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
