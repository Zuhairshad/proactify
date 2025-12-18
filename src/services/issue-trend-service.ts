import IssueSnapshot from '@/models/IssueSnapshot';
import connectDB from '@/lib/mongodb';

/**
 * Get monthly aggregated trends for issue metrics
 */
export async function getIssueMonthlyTrend(
    projectCode?: string,
    metric: string = 'totalIssues',
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
        matchStage.issueId = { $regex: `^${projectCode}-` };
    }

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: '$month',
                totalIssues: { $sum: 1 },
                totalImpactValue: { $sum: '$impactValue' },
                avgDaysOpen: { $avg: '$daysOpen' },
                openIssues: {
                    $sum: { $cond: [{ $in: ['$status', ['Open', 'Escalated']] }, 1, 0] }
                },
                closedIssues: {
                    $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
                },
                resolvedIssues: {
                    $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
                },
                criticalIssues: {
                    $sum: { $cond: [{ $in: ['$priority', ['Critical', '(1) High']] }, 1, 0] }
                },
                withResponse: {
                    $sum: { $cond: [{ $ne: ['$response', null] }, 1, 0] }
                },
                escalated: {
                    $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: 1 } }
    ];

    const results = await IssueSnapshot.aggregate(pipeline);

    // Map to requested metric
    return results.map(r => ({
        month: r._id,
        value: r[metric] || 0
    }));
}

/**
 * Get trend for individual issue
 */
export async function getIssueTrend(
    issueId: string,
    field: string = 'daysOpen'
): Promise<{ date: string; value: number; month: string }[]> {
    await connectDB();

    const snapshots = await IssueSnapshot
        .findOne({ issueId })
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
 * Get project issue metrics with historical trends
 */
export async function getProjectIssueTrends(monthsBack: number = 7) {
    await connectDB();

    const [
        totalTrend,
        openTrend,
        criticalTrend,
        impactTrend,
        avgDaysOpenTrend
    ] = await Promise.all([
        getIssueMonthlyTrend(undefined, 'totalIssues', monthsBack),
        getIssueMonthlyTrend(undefined, 'openIssues', monthsBack),
        getIssueMonthlyTrend(undefined, 'criticalIssues', monthsBack),
        getIssueMonthlyTrend(undefined, 'totalImpactValue', monthsBack),
        getIssueMonthlyTrend(undefined, 'avgDaysOpen', monthsBack),
    ]);

    return {
        totalIssues: totalTrend.map(t => t.value),
        openIssues: openTrend.map(t => t.value),
        criticalIssues: criticalTrend.map(t => t.value),
        impactValue: impactTrend.map(t => t.value),
        avgDaysOpen: avgDaysOpenTrend.map(t => t.value),
        months: totalTrend.map(t => t.month),
    };
}
