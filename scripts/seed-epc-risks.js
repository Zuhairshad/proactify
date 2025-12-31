// Script to seed 20 EPC project risks
const mongoose = require('mongoose');

const epcRisks = [
    {
        Title: "Delayed Equipment Procurement",
        Description: "Critical equipment delivery from overseas supplier may be delayed due to shipping constraints and customs clearance issues, impacting the overall project timeline.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.7,
        "Impact Rating (0.05-0.8)": 0.6,
        "Mitigation Plan": "Identify alternative suppliers, expedite shipping arrangements, and maintain buffer stock for critical components.",
        "Contingency Plan": "Adjust project schedule, reallocate resources to non-dependent tasks, consider air freight for urgent items.",
        Category: "Procurement",
        Owner: "Procurement Manager",
        "Due Date": new Date("2025-02-15")
    },
    {
        Title: "Soil Condition Uncertainty",
        Description: "Geotechnical investigation reveals unexpected soil conditions that may require foundation redesign and additional stabilization work.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.5,
        "Impact Rating (0.05-0.8)": 0.7,
        "Mitigation Plan": "Conduct additional soil testing, engage geotechnical specialist, prepare alternative foundation designs.",
        "Contingency Plan": "Budget allocation for soil improvement works, ground improvement techniques like stone columns or soil cement.",
        Category: "Engineering",
        Owner: "Civil Engineer",
        "Due Date": new Date("2025-01-30")
    },
    {
        Title: "Skilled Labor Shortage",
        Description: "Local market shortage of qualified welders and pipefitters may impact construction productivity and quality standards.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.6,
        "Impact Rating (0.05-0.8)": 0.5,
        "Mitigation Plan": "Early recruitment drive, training programs for local workforce, partnerships with technical institutes.",
        "Contingency Plan": "Import skilled workers from other regions, increase overtime allowances, subcontract specialized work packages.",
        Category: "Construction",
        Owner: "HR Manager",
        "Due Date": new Date("2025-02-01")
    },
    {
        Title: "Environmental Permit Delays",
        Description: "Environmental impact assessment approval from regulatory authorities is taking longer than anticipated, potentially delaying site mobilization.",
        "Project Code": "EPC-2024-03",
        "Risk Status": "Open",
        Probability: 0.4,
        "Impact Rating (0.05-0.8)": 0.65,
        "Mitigation Plan": "Regular follow-ups with authorities, hire environmental compliance consultant, address all queries promptly.",
        "Contingency Plan": "Fast-track parallel work packages that don't require permits, escalate to senior management for government liaison.",
        Category: "Regulatory",
        Owner: "Project Director",
        "Due Date": new Date("2025-01-20")
    },
    {
        Title: "Currency Exchange Rate Fluctuation",
        Description: "Foreign equipment and materials costs are exposed to currency volatility, potentially increasing project budget by 10-15%.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.8,
        "Impact Rating (0.05-0.8)": 0.55,
        "Mitigation Plan": "Negotiate fixed-price contracts in stable currency, implement hedging strategies, purchase critical items early.",
        "Contingency Plan": "Secure additional financing buffer, renegotiate payment terms, identify local substitutes.",
        Category: "Financial",
        Owner: "Finance Controller",
        "Due Date": new Date("2025-02-28")
    },
    {
        Title: "Design Interface Conflicts",
        Description: "Coordination issues between mechanical, electrical, and structural disciplines leading to clashes in 3D model requiring rework.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.55,
        "Impact Rating (0.05-0.8)": 0.45,
        "Mitigation Plan": "Weekly BIM coordination meetings, implement clash detection software, establish clear design interface protocols.",
        "Contingency Plan": "Increase engineering hours allocation, bring in senior design reviewers, extend design phase timeline.",
        Category: "Engineering",
        Owner: "Lead Engineer",
        "Due Date": new Date("2025-01-25")
    },
    {
        Title: "Construction Weather Delays",
        Description: "Monsoon season may extend beyond normal period, affecting outdoor construction activities and concrete curing schedules.",
        "Project Code": "EPC-2024-03",
        "Risk Status": "Open",
        Probability: 0.65,
        "Impact Rating (0.05-0.8)": 0.5,
        "Mitigation Plan": "Weather-protected work areas, advance procurement of weather protection materials, flexible scheduling.",
        "Contingency Plan": "Extended weather windows in schedule, focus on indoor activities during rain, additional dewatering equipment.",
        Category: "Construction",
        Owner: "Construction Manager",
        "Due Date": new Date("2025-03-15")
    },
    {
        Title: "Vendor Quality Non-Conformance",
        Description: "Fabricated steel structures from new vendor failing quality inspections, requiring rework and potential replacement.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.45,
        "Impact Rating (0.05-0.8)": 0.6,
        "Mitigation Plan": "Enhanced vendor qualification process, resident QA/QC inspector at vendor facility, third-party testing.",
        "Contingency Plan": "Identify backup vendors, expedite re-fabrication, implement penalty clauses for non-conformance.",
        Category: "Quality",
        Owner: "QA/QC Manager",
        "Due Date": new Date("2025-02-10")
    },
    {
        Title: "Site Access Road Limitations",
        Description: "Existing access roads inadequate for heavy equipment transportation, requiring road upgrades and potentially affecting schedule.",
        "Project Code": "EPC-2024-03",
        "Risk Status": "Open",
        Probability: 0.5,
        "Impact Rating (0.05-0.8)": 0.4,
        "Mitigation Plan": "Early site survey and road assessment, budget for temporary access improvements, coordinate with local authorities.",
        "Contingency Plan": "Use smaller equipment with multiple trips, construct temporary haul roads, helicopter transport for light items.",
        Category: "Logistics",
        Owner: "Logistics Coordinator",
        "Due Date": new Date("2025-01-15")
    },
    {
        Title: "Cybersecurity Breach Risk",
        Description: "Project control systems and design data vulnerable to cyber attacks, potentially compromising intellectual property and operations.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.3,
        "Impact Rating (0.05-0.8)": 0.75,
        "Mitigation Plan": "Implement robust cybersecurity protocols, regular security audits, employee training on data protection.",
        "Contingency Plan": "Incident response plan, data backup and recovery systems, cyber insurance coverage.",
        Category: "IT Security",
        Owner: "IT Manager",
        "Due Date": new Date("2025-02-20")
    },
    {
        Title: "Utility Connection Delays",
        Description: "Power and water utility connections from local authority delayed due to capacity constraints in existing infrastructure.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.55,
        "Impact Rating (0.05-0.8)": 0.55,
        "Mitigation Plan": "Early coordination with utilities, temporary power and water solutions, upgrade infrastructure if needed.",
        "Contingency Plan": "Diesel generators for power, water tankers for construction needs, revised commissioning timeline.",
        Category: "Infrastructure",
        Owner: "Site Manager",
        "Due Date": new Date("2025-03-01")
    },
    {
        Title: "Scope Creep from Client",
        Description: "Client requesting additional features and modifications beyond original scope, affecting budget and timeline without proper change orders.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.7,
        "Impact Rating (0.05-0.8)": 0.65,
        "Mitigation Plan": "Strict change management process, clear documentation of scope baseline, regular client alignment meetings.",
        "Contingency Plan": "Formal variation orders for all changes, dedicated resources for change impact assessment, escalation protocol.",
        Category: "Scope Management",
        Owner: "Project Manager",
        "Due Date": new Date("2025-02-05")
    },
    {
        Title: "Health and Safety Incident",
        Description: "High-risk construction activities increase probability of workplace accidents, potentially causing injuries and work stoppages.",
        "Project Code": "EPC-2024-03",
        "Risk Status": "Open",
        Probability: 0.4,
        "Impact Rating (0.05-0.8)": 0.8,
        "Mitigation Plan": "Comprehensive HSE training, strict safety protocols, daily toolbox talks, proper PPE enforcement.",
        "Contingency Plan": "Emergency response procedures, medical facilities on-site, incident investigation team, work stoppage protocols.",
        Category: "Health & Safety",
        Owner: "HSE Manager",
        "Due Date": new Date("2025-01-10")
    },
    {
        Title: "Commissioning Equipment Failure",
        Description: "Critical equipment fails during pre-commissioning tests, requiring troubleshooting and potential replacement of components.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.35,
        "Impact Rating (0.05-0.8)": 0.7,
        "Mitigation Plan": "Factory acceptance testing before shipment, qualified commissioning team, spare parts inventory.",
        "Contingency Plan": "Vendor technical support on standby, expedited spare parts delivery, parallel testing of backup equipment.",
        Category: "Commissioning",
        Owner: "Commissioning Lead",
        "Due Date": new Date("2025-04-01")
    },
    {
        Title: "Subcontractor Default",
        Description: "Key subcontractor facing financial difficulties may default on contract obligations, leaving work incomplete.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.25,
        "Impact Rating (0.05-0.8)": 0.75,
        "Mitigation Plan": "Financial health checks on subcontractors, performance bonds, regular progress monitoring.",
        "Contingency Plan": "Backup subcontractors identified, direct hire labor option, contract termination and re-tendering procedures.",
        Category: "Procurement",
        Owner: "Contracts Manager",
        "Due Date": new Date("2025-02-15")
    },
    {
        Title: "Material Price Escalation",
        Description: "Steel and cement prices increasing beyond contract assumptions due to market volatility and global supply constraints.",
        "Project Code": "EPC-2024-03",
        "Risk Status": "Open",
        Probability: 0.75,
        "Impact Rating (0.05-0.8)": 0.6,
        "Mitigation Plan": "Early bulk procurement, price escalation clauses in contract, alternative material specifications.",
        "Contingency Plan": "Negotiate with suppliers for fixed pricing, use recycled materials where possible, value engineering exercises.",
        Category: "Financial",
        Owner: "Procurement Manager",
        "Due Date": new Date("2025-01-31")
    },
    {
        Title: "Insufficient Site Storage Space",
        Description: "Limited site area causing congestion and inadequate storage for materials and equipment, affecting productivity.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.5,
        "Impact Rating (0.05-0.8)": 0.35,
        "Mitigation Plan": "Optimize site layout, just-in-time delivery scheduling, off-site storage facilities.",
        "Contingency Plan": "Lease adjacent land for storage, implement strict material management procedures, vertical storage solutions.",
        Category: "Logistics",
        Owner: "Site Manager",
        "Due Date": new Date("2025-01-20")
    },
    {
        Title: "Client Approval Bottlenecks",
        Description: "Slow client review and approval process for engineering deliverables causing delays in downstream activities.",
        "Project Code": "EPC-2024-01",
        "Risk Status": "Open",
        Probability: 0.6,
        "Impact Rating (0.05-0.8)": 0.5,
        "Mitigation Plan": "Established approval timelines in contract, regular submission schedules, alternative approval authorities.",
        "Contingency Plan": "Escalation to client senior management, proceed at risk for non-critical items, parallel work streams.",
        Category: "Client Management",
        Owner: "Project Manager",
        "Due Date": new Date("2025-01-28")
    },
    {
        Title: "Testing and Inspection Equipment Unavailability",
        Description: "Specialized testing equipment for quality checks not available locally, requiring import with long lead times.",
        "Project Code": "EPC-2024-03",
        "Risk Status": "Open",
        Probability: 0.4,
        "Impact Rating (0.05-0.8)": 0.45,
        "Mitigation Plan": "Early identification of testing requirements, equipment procurement planning, rental options exploration.",
        "Contingency Plan": "Third-party testing laboratories, import expediting, accept equivalent testing methods if approved.",
        Category: "Quality",
        Owner: "QA/QC Manager",
        "Due Date": new Date("2025-02-12")
    },
    {
        Title: "Interface with Existing Operations",
        Description: "Brownfield project requiring work near active facilities, creating safety risks and operational constraints.",
        "Project Code": "EPC-2024-02",
        "Risk Status": "Open",
        Probability: 0.55,
        "Impact Rating (0.05-0.8)": 0.7,
        "Mitigation Plan": "Detailed interface management plan, work permits system, coordination with operations team.",
        "Contingency Plan": "Shutdown windows for critical work, enhanced safety barriers, 24/7 safety supervision.",
        Category: "Operations Interface",
        Owner: "Project Director",
        "Due Date": new Date("2025-02-25")
    }
];

// MongoDB connection and insertion
async function seedData() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/riskwise';

    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const Risk = mongoose.model('Risk', new mongoose.Schema({}, { strict: false }));

        // Clear existing risks (optional)
        // await Risk.deleteMany({});

        const result = await Risk.insertMany(epcRisks);
        console.log(`Successfully inserted ${result.length} EPC project risks`);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
