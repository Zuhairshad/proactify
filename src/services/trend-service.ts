import RiskSnapshot from '@/models/RiskSnapshot';
import connectDB from '@/lib/mongodb';

/**
 * Get monthly aggregated trends for a specific metric
 * Aggregates bi-weekly snapshots into monthly data points
 */
export async function getMonthlyTrend(
    projectCode?: string,
    metric: string = 'emv',
    monthsBack: number = 7
): Promise<{ month: string; value: number }[]> {
    await connectDB();

    // Calculate start month
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    const startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

    // Build aggregation pipeline
    const matchStage: any = {
        month: { $gte: startMonth }
    };

    if (projectCode) {
        // Need to join with RiskMaster to filter by project
        matchStage.riskId = { $regex: `^${projectCode}-` };
    }

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: '$month',
                totalEMV: { $sum: '$emv' },
                avgRiskScore: { $avg: '$riskScore' },
                totalImpactValue: { $sum: '$impactValue' },
                totalBudgetContingency: { $sum: '$budgetContingency' },
                openRisks: {
                    $sum: { $cond: [{ $in: ['$status', ['Open', 'In Progress']] }, 1, 0] }
                },
                closedRisks: {
                    $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
                },
                mitigatedRisks: {
                    $sum: { $cond: [{ $eq: ['$status', 'Mitigated'] }, 1, 0] }
                },
                totalRisks: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ];

    const results = await RiskSnapshot.aggregate(pipeline);

    // Map to requested metric
    return results.map(r => ({
        month: r._id,
        value: r[metric] || 0
    }));
}

/**
 * Get trend for individual risk
 */
export async function getRiskTrend(
    riskId: string,
    field: string = 'emv'
): Promise<{ date: string; value: number; month: string }[]> {
    await connectDB();

    const snapshots = await RiskSnapshot
        .find({ riskId })
        .sort({ snapshotDate: 1 })
        .select(`snapshotDate month ${field}`)
        .lean();

    return snapshots.map(s => ({
        date: s.snapshotDate.toISOString(),
        month: s.month,
        value: (s as any)[field] || 0
    }));
}

/**
 * Get project metrics with historical trends
 */
export async function getProjectTrends(monthsBack: number = 7) {
    await connectDB();

    const [
        emvTrend,
        riskCountTrend,
        contingencyTrend,
        impactValueTrend
    ] = await Promise.all([
        getMonthlyTrend(undefined, 'totalEMV', monthsBack),
        getMonthlyTrend(undefined, 'totalRisks', monthsBack),
        getMonthlyTrend(undefined, 'totalBudgetContingency', monthsBack),
        getMonthlyTrend(undefined, 'totalImpactValue', monthsBack),
    ]);

    return {
        emv: emvTrend.map(t => t.value),
        riskCount: riskCountTrend.map(t => t.value),
        contingency: contingencyTrend.map(t => t.value),
        impactValue: impactValueTrend.map(t => t.value),
        months: emvTrend.map(t => t.month),
    };
}
