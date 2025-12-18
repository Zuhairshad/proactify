import type { RiskIssue } from "@/lib/types";
import { products } from "./mock-data";

export const mockRisksAndIssues: RiskIssue[] = [
  // Sample Risks
  {
    id: "risk-001",
    type: "Risk",
    Title: "Database Performance Bottleneck",
    Description: "Potential performance issues with the database under heavy load during peak hours",
    Status: "Open",
    "Risk Status": "Open",
    ProjectName: "Project Phoenix",
    ProjectCode: "P-12345",
    Owner: "John Smith",
    DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    Probability: 0.3,
    "Impact Rating (0.05-0.8)": 0.5,
    MitigationPlan: "Implement database indexing and caching strategies",
    ContingencyPlan: "Scale database resources during peak hours"
  },
  {
    id: "risk-002",
    type: "Risk",
    Title: "Security Vulnerability",
    Description: "Potential security vulnerability in the authentication system",
    Status: "Mitigated",
    "Risk Status": "Mitigated",
    ProjectName: "Quantum Leap Initiative",
    ProjectCode: "P-67890",
    Owner: "Jane Doe",
    DueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    Probability: 0.2,
    "Impact Rating (0.05-0.8)": 0.7,
    MitigationPlan: "Update authentication library and implement additional security measures",
    ContingencyPlan: "Deploy emergency security patches"
  },
  {
    id: "risk-003",
    type: "Risk",
    Title: "Third-Party API Dependency",
    Description: "Dependency on third-party API with potential uptime issues",
    Status: "Transferred",
    "Risk Status": "Transferred",
    ProjectName: "DataStream Integration",
    ProjectCode: "P-13579",
    Owner: "Mike Johnson",
    DueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    Probability: 0.4,
    "Impact Rating (0.05-0.8)": 0.3,
    MitigationPlan: "Implement fallback mechanisms and redundancy",
    ContingencyPlan: "Switch to alternative API providers"
  },
  // Sample Issues
  {
    id: "issue-001",
    type: "Issue",
    Title: "UI Rendering Problem",
    Discussion: "UI components are not rendering correctly on mobile devices, specifically affecting the dashboard view",
    Status: "Open",
    ProjectName: "Project Phoenix",
    Owner: "Sarah Wilson",
    DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    Priority: "High",
    Impact: "High",
    Category: "Frontend"
  },
  {
    id: "issue-002",
    type: "Issue",
    Title: "API Response Delay",
    Discussion: "API responses are taking longer than expected, causing timeouts in some client applications",
    Status: "In Progress",
    ProjectName: "Quantum Leap Initiative",
    Owner: "Robert Brown",
    DueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    Priority: "Medium",
    Impact: "Medium",
    Category: "Backend"
  },
  {
    id: "issue-003",
    type: "Issue",
    Title: "Data Inconsistency",
    Discussion: "Inconsistent data being displayed across different modules of the application",
    Status: "Resolved",
    ProjectName: "NextGen UI Framework",
    Owner: "Emily Davis",
    DueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    Priority: "Low",
    Impact: "Low",
    Category: "Data"
  }
];