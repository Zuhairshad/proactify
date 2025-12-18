import Risk from '@/models/Risk';
import RiskMaster from '@/models/RiskMaster';
import RiskSnapshot from '@/models/RiskSnapshot';
import connectDB from '@/lib/mongodb';

/**
 * Helper: Generate bi-week period string
 * Format: "2024-12-W1" or "2024-12-W2"
 */
export function getBiWeekPeriod(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDate();

    // W1 = days 1-15, W2 = days 16-31
    const week = day <= 15 ? 'W1' : 'W2';

    return `${year}-${month}-${week}`;
}

/**
 * Helper: Get month string from date
 * Format: "2024-12"
 */
export function getMonthString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Helper: Generate next Risk ID for a project
 * Format: "{ProjectCode}-R{number}"
 */
async function generateRiskId(projectCode: string): Promise<string> {
    await connectDB();

    // Find highest number for this project
    const lastRisk = await RiskMaster
        .findOne({ projectCode })
        .sort({ riskId: -1 })
        .lean();

    if (!lastRisk) {
        return `${projectCode}-R001`;
    }

    // Extract number from "PROJ-R001"
    const match = lastRisk.riskId.match(/-R(\d+)$/);
    if (!match) {
        return `${projectCode}-R001`;
    }

    const nextNumber = parseInt(match[1]) + 1;
    return `${projectCode}-R${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Migrate existing risks to new schema
 * - Creates RiskMaster records with generated IDs
 * - Creates initial snapshot for each risk
 */
export async function migrateExistingRisks() {
    await connectDB();

    console.log('Starting migration...');

    const existingRisks = await Risk.find({}).lean();
    console.log(`Found ${existingRisks.length} existing risks`);

    const results = {
        mastersCreated: 0,
        snapshotsCreated: 0,
        errors: [] as string[],
    };

    // Group by project to generate sequential IDs
    const projectGroups: Record<string, any[]> = {};
    existingRisks.forEach(risk => {
        const projectCode = risk['Project Code'] || 'UNKNOWN';
        if (!projectGroups[projectCode]) {
            projectGroups[projectCode] = [];
        }
        projectGroups[projectCode].push(risk);
    });

    // Process each project
    for (const [projectCode, risks] of Object.entries(projectGroups)) {
        console.log(`Processing project ${projectCode} with ${risks.length} risks...`);

        for (let i = 0; i < risks.length; i++) {
            const risk = risks[i];

            try {
                // Generate unique ID
                const riskId = `${projectCode}-R${String(i + 1).padStart(3, '0')}`;

                // Calculate metrics
                const probability = risk.Probability || 0;
                const impactRating = risk['Impact Rating (0.05-0.8)'] || 0;
                const impactValue = risk['Impact Value ($)'] || 0;
                const emv = probability * impactValue;
                const riskScore = probability * impactRating;

                // Create RiskMaster
                const master = await RiskMaster.create({
                    riskId,
                    projectCode,
                    title: risk.Title,
                    description: risk.Description,
                    type: 'Risk',
                    createdAt: risk.createdAt || new Date(),
                    createdBy: risk.Owner,
                    isActive: true,
                    currentStatus: risk['Risk Status'] || 'Open',
                    currentEMV: emv,
                    currentRiskScore: riskScore,
                    currentProbability: probability,
                    currentImpactValue: impactValue,
                });

                results.mastersCreated++;

                // Create initial snapshot
                const now = new Date();
                const snapshot = await RiskSnapshot.create({
                    riskId,
                    snapshotDate: now,
                    month: getMonthString(now),
                    biWeekPeriod: getBiWeekPeriod(now),
                    status: risk['Risk Status'] || 'Open',
                    probability,
                    impactRating,
                    impactValue,
                    emv,
                    budgetContingency: risk['Budget Contingency'],
                    riskScore,
                    owner: risk.Owner,
                    dueDate: risk.DueDate,
                    mitigationPlan: risk.MitigationPlan,
                    contingencyPlan: risk.ContingencyPlan,
                    capturedBy: 'Migration',
                    notes: 'Initial snapshot created during migration',
                });

                results.snapshotsCreated++;

                console.log(`  ✓ Created ${riskId}`);

            } catch (error) {
                const errorMsg = `Error processing risk "${risk.Title}": ${error}`;
                console.error(`  ✗ ${errorMsg}`);
                results.errors.push(errorMsg);
            }
        }
    }

    console.log('\nMigration complete:');
    console.log(`  Masters created: ${results.mastersCreated}`);
    console.log(`  Snapshots created: ${results.snapshotsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => console.log(`  - ${err}`));
    }

    return results;
}

/**
 * Create a snapshot for a specific risk
 */
export async function createSnapshot(riskId: string, notes?: string) {
    await connectDB();

    // Get master record
    const master = await RiskMaster.findOne({ riskId }).lean();
    if (!master) {
        throw new Error(`Risk ${riskId} not found`);
    }

    // Get previous snapshot to detect changes
    const previousSnapshot = await RiskSnapshot
        .findOne({ riskId })
        .sort({ snapshotDate: -1 })
        .lean();

    const now = new Date();
    const probability = master.currentProbability || 0;
    const impactValue = master.currentImpactValue || 0;

    // Detect changed fields
    const changedFields: string[] = [];
    if (previousSnapshot) {
        if (previousSnapshot.status !== master.currentStatus) changedFields.push('status');
        if (previousSnapshot.probability !== probability) changedFields.push('probability');
        if (previousSnapshot.emv !== master.currentEMV) changedFields.push('emv');
        if (previousSnapshot.riskScore !== master.currentRiskScore) changedFields.push('riskScore');
    }

    // Create snapshot
    const snapshot = await RiskSnapshot.create({
        riskId,
        snapshotDate: now,
        month: getMonthString(now),
        biWeekPeriod: getBiWeekPeriod(now),
        status: master.currentStatus,
        probability,
        impactRating: master.currentRiskScore && probability ? master.currentRiskScore / probability : 0,
        impactValue,
        emv: master.currentEMV,
        budgetContingency: 0, // Would need to get from current Risk record
        riskScore: master.currentRiskScore,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
        previousSnapshotId: previousSnapshot?._id,
        capturedBy: 'Auto',
        notes,
    });


    return snapshot;
}

/**
 * Helper: Generate next Risk ID for a project
 * Format: "{ProjectCode}-R{number}"
 */
async function generateRiskId(projectCode: string): Promise<string> {
    await connectDB();

    // Find highest number for this project
    const lastRisk = await RiskMaster
        .findOne({ projectCode })
        .sort({ riskId: -1 })
        .lean();

    if (!lastRisk) {
        return `${projectCode}-R001`;
    }

    // Extract number from "PROJ-R001"
    const match = lastRisk.riskId.match(/-R(\d+)$/);
    if (!match) {
        return `${projectCode}-R001`;
    }

    const nextNumber = parseInt(match[1]) + 1;
    return `${projectCode}-R${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Migrate existing risks to new schema
 * - Creates RiskMaster records with generated IDs
 * - Creates initial snapshot for each risk
 */
export async function migrateExistingRisks() {
    await connectDB();

    console.log('Starting migration...');

    const existingRisks = await Risk.find({}).lean();
    console.log(`Found ${existingRisks.length} existing risks`);

    const results = {
        mastersCreated: 0,
        snapshotsCreated: 0,
        errors: [] as string[],
    };

    // Group by project to generate sequential IDs
    const projectGroups: Record<string, any[]> = {};
    existingRisks.forEach(risk => {
        const projectCode = risk['Project Code'] || 'UNKNOWN';
        if (!projectGroups[projectCode]) {
            projectGroups[projectCode] = [];
        }
        projectGroups[projectCode].push(risk);
    });

    // Process each project
    for (const [projectCode, risks] of Object.entries(projectGroups)) {
        console.log(`Processing project ${projectCode} with ${risks.length} risks...`);

        for (let i = 0; i < risks.length; i++) {
            const risk = risks[i];

            try {
                // Generate unique ID
                const riskId = `${projectCode}-R${String(i + 1).padStart(3, '0')}`;

                // Calculate metrics
                const probability = risk.Probability || 0;
                const impactRating = risk['Impact Rating (0.05-0.8)'] || 0;
                const impactValue = risk['Impact Value ($)'] || 0;
                const emv = probability * impactValue;
                const riskScore = probability * impactRating;

                // Create RiskMaster
                const master = await RiskMaster.create({
                    riskId,
                    projectCode,
                    title: risk.Title,
                    description: risk.Description,
                    type: 'Risk',
                    createdAt: risk.createdAt || new Date(),
                    createdBy: risk.Owner,
                    isActive: true,
                    currentStatus: risk['Risk Status'] || 'Open',
                    currentEMV: emv,
                    currentRiskScore: riskScore,
                    currentProbability: probability,
                    currentImpactValue: impactValue,
                });

                results.mastersCreated++;

                // Create initial snapshot
                const now = new Date();
                const snapshot = await RiskSnapshot.create({
                    riskId,
                    snapshotDate: now,
                    month: getMonthString(now),
                    biWeekPeriod: getBiWeekPeriod(now),
                    status: risk['Risk Status'] || 'Open',
                    probability,
                    impactRating,
                    impactValue,
                    emv,
                    budgetContingency: risk['Budget Contingency'],
                    riskScore,
                    owner: risk.Owner,
                    dueDate: risk.DueDate,
                    mitigationPlan: risk.MitigationPlan,
                    contingencyPlan: risk.ContingencyPlan,
                    capturedBy: 'Migration',
                    notes: 'Initial snapshot created during migration',
                });

                results.snapshotsCreated++;

                console.log(`  ✓ Created ${riskId}`);

            } catch (error) {
                const errorMsg = `Error processing risk "${risk.Title}": ${error}`;
                console.error(`  ✗ ${errorMsg}`);
                results.errors.push(errorMsg);
            }
        }
    }

    console.log('\nMigration complete:');
    console.log(`  Masters created: ${results.mastersCreated}`);
    console.log(`  Snapshots created: ${results.snapshotsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => console.log(`  - ${err}`));
    }

    return results;
}

/**
 * Create a snapshot for a specific risk
 */
export async function createSnapshot(riskId: string, notes?: string) {
    await connectDB();

    // Get master record
    const master = await RiskMaster.findOne({ riskId }).lean();
    if (!master) {
        throw new Error(`Risk ${riskId} not found`);
    }

    // Get previous snapshot to detect changes
    const previousSnapshot = await RiskSnapshot
        .findOne({ riskId })
        .sort({ snapshotDate: -1 })
        .lean();

    const now = new Date();
    const probability = master.currentProbability || 0;
    const impactValue = master.currentImpactValue || 0;

    // Detect changed fields
    const changedFields: string[] = [];
    if (previousSnapshot) {
        if (previousSnapshot.status !== master.currentStatus) changedFields.push('status');
        if (previousSnapshot.probability !== probability) changedFields.push('probability');
        if (previousSnapshot.emv !== master.currentEMV) changedFields.push('emv');
        if (previousSnapshot.riskScore !== master.currentRiskScore) changedFields.push('riskScore');
    }

    // Create snapshot
    const snapshot = await RiskSnapshot.create({
        riskId,
        snapshotDate: now,
        month: getMonthString(now),
        biWeekPeriod: getBiWeekPeriod(now),
        status: master.currentStatus,
        probability,
        impactRating: master.currentRiskScore && probability ? master.currentRiskScore / probability : 0,
        impactValue,
        emv: master.currentEMV,
        budgetContingency: 0, // Would need to get from current Risk record
        riskScore: master.currentRiskScore,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
        previousSnapshotId: previousSnapshot?._id,
        capturedBy: 'Auto',
        notes,
    });

    return snapshot;
}

/**
 * Capture bi-weekly snapshots for all active risks
 */
export async function captureBiWeeklySnapshots() {
    await connectDB();

    console.log('Capturing bi-weekly snapshots...');

    const activeRisks = await RiskMaster.find({ isActive: true }).lean();
    console.log(`Found ${activeRisks.length} active risks`);

    let created = 0;
    let skipped = 0;

    for (const risk of activeRisks) {
        try {
            // Check if snapshot already exists for this bi-week period
            const currentPeriod = getBiWeekPeriod();
            const existing = await RiskSnapshot.findOne({
                riskId: risk.riskId,
                biWeekPeriod: currentPeriod,
            });

            if (existing) {
                console.log(`  - Skipping ${risk.riskId} (already captured)`);
                skipped++;
                continue;
            }

            await createSnapshot(risk.riskId, 'Bi-weekly automatic snapshot');
            console.log(`  ✓ Created snapshot for ${risk.riskId}`);
            created++;

        } catch (error) {
            console.error(`  ✗ Error capturing ${risk.riskId}:`, error);
        }
    }

    console.log(`\nBi-weekly snapshot complete: ${created} created, ${skipped} skipped`);

    return { created, skipped };
}

// ============================================================================
// ISSUE MIGRATION FUNCTIONS
// ============================================================================

import Issue from '@/models/Issue';
import IssueMaster from '@/models/IssueMaster';
import IssueSnapshot from '@/models/IssueSnapshot';

/**
 * Migrate existing issues to new schema
 * - Creates IssueMaster records with generated IDs
 * - Creates initial snapshot for each issue
 */
export async function migrateExistingIssues() {
    await connectDB();

    console.log('Starting issue migration...');

    const existingIssues = await Issue.find({}).lean();
    console.log(`Found ${existingIssues.length} existing issues`);

    const results = {
        mastersCreated: 0,
        snapshotsCreated: 0,
        errors: [] as string[],
    };

    // Group by project to generate sequential IDs
    const projectGroups: Record<string, any[]> = {};
    existingIssues.forEach(issue => {
        const projectCode = issue.ProjectName || 'UNKNOWN';
        if (!projectGroups[projectCode]) {
            projectGroups[projectCode] = [];
        }
        projectGroups[projectCode].push(issue);
    });

    // Process each project
    for (const [projectCode, issues] of Object.entries(projectGroups)) {
        console.log(`Processing project ${projectCode} with ${issues.length} issues...`);

        for (let i = 0; i < issues.length; i++) {
            const issue = issues[i];

            try {
                // Generate unique ID: ProjectCode-I###
                const issueId = `${projectCode}-I${String(i + 1).padStart(3, '0')}`;

                // Create IssueMaster
                const master = await IssueMaster.create({
                    issueId,
                    projectCode,
                    title: issue.Title,
                    discussion: issue.Discussion,
                    type: 'Issue',
                    category: issue.Category,
                    subCategory: issue.SubCategory,
                    createdAt: issue.createdAt || new Date(),
                    createdBy: issue.Owner,
                    isActive: true,
                    currentStatus: issue.Status || 'Open',
                    currentPriority: issue.Priority,
                    currentImpact: issue.Impact,
                    currentImpactValue: issue['Impact ($)'],
                    currentResponse: issue.Response,
                });

                results.mastersCreated++;

                // Calculate days open
                const createdDate = issue.createdAt || new Date();
                const now = new Date();
                const daysOpen = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

                // Create initial snapshot
                const snapshot = await IssueSnapshot.create({
                    issueId,
                    snapshotDate: now,
                    month: getMonthString(now),
                    biWeekPeriod: getBiWeekPeriod(now),
                    status: issue.Status || 'Open',
                    priority: issue.Priority,
                    impact: issue.Impact,
                    impactValue: issue['Impact ($)'],
                    response: issue.Response,
                    category: issue.Category,
                    subCategory: issue.SubCategory,
                    owner: issue.Owner,
                    dueDate: issue['Due Date'],
                    resolution: issue.Resolution,
                    daysOpen,
                    capturedBy: 'Migration',
                    notes: 'Initial snapshot created during migration',
                });

                results.snapshotsCreated++;

                console.log(`  ✓ Created ${issueId}`);

            } catch (error) {
                const errorMsg = `Error processing issue "${issue.Title}": ${error}`;
                console.error(`  ✗ ${errorMsg}`);
                results.errors.push(errorMsg);
            }
        }
    }

    console.log('\nIssue migration complete:');
    console.log(`  Masters created: ${results.mastersCreated}`);
    console.log(`  Snapshots created: ${results.snapshotsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => console.log(`  - ${err}`));
    }

    return results;
}

/**
 * Create a snapshot for a specific issue
 */
export async function createIssueSnapshot(issueId: string, notes?: string) {
    await connectDB();

    // Get master record
    const master = await IssueMaster.findOne({ issueId }).lean();
    if (!master) {
        throw new Error(`Issue ${issueId} not found`);
    }

    // Get previous snapshot to detect changes
    const previousSnapshot = await IssueSnapshot
        .findOne({ issueId })
        .sort({ snapshotDate: -1 })
        .lean();

    const now = new Date();

    // Calculate days open
    const daysOpen = Math.floor((now.getTime() - master.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Detect changed fields
    const changedFields: string[] = [];
    if (previousSnapshot) {
        if (previousSnapshot.status !== master.currentStatus) changedFields.push('status');
        if (previousSnapshot.priority !== master.currentPriority) changedFields.push('priority');
        if (previousSnapshot.impact !== master.currentImpact) changedFields.push('impact');
        if (previousSnapshot.impactValue !== master.currentImpactValue) changedFields.push('impactValue');
        if (previousSnapshot.response !== master.currentResponse) changedFields.push('response');
    }

    // Create snapshot
    const snapshot = await IssueSnapshot.create({
        issueId,
        snapshotDate: now,
        month: getMonthString(now),
        biWeekPeriod: getBiWeekPeriod(now),
        status: master.currentStatus,
        priority: master.currentPriority,
        impact: master.currentImpact,
        impactValue: master.currentImpactValue,
        response: master.currentResponse,
        daysOpen,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
        previousSnapshotId: previousSnapshot?._id,
        capturedBy: 'Auto',
        notes,
    });

    return snapshot;
}

/**
 * Capture bi-weekly snapshots for all active issues
 */
export async function captureBiWeeklyIssueSnapshots() {
    await connectDB();

    console.log('Capturing bi-weekly issue snapshots...');

    const activeIssues = await IssueMaster.find({ isActive: true }).lean();
    console.log(`Found ${activeIssues.length} active issues`);

    let created = 0;
    let skipped = 0;

    for (const issue of activeIssues) {
        try {
            // Check if snapshot already exists for this bi-week period
            const currentPeriod = getBiWeekPeriod();
            const existing = await IssueSnapshot.findOne({
                issueId: issue.issueId,
                biWeekPeriod: currentPeriod,
            });

            if (existing) {
                console.log(`  - Skipping ${issue.issueId} (already captured)`);
                skipped++;
                continue;
            }

            await createIssueSnapshot(issue.issueId, 'Bi-weekly automatic snapshot');
            console.log(`  ✓ Created snapshot for ${issue.issueId}`);
            created++;

        } catch (error) {
            console.error(`  ✗ Error capturing ${issue.issueId}:`, error);
        }
    }

    console.log(`\nBi-weekly issue snapshot complete: ${created} created, ${skipped} skipped`);

    return { created, skipped };
}
