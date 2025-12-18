import { config } from 'dotenv';
config({ path: '.env.local' });

import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';
import Issue from '@/models/Issue';
import Product from '@/models/Product';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected! Starting database seeding...');

    // Add sample products
    const sampleProducts = [
      { name: "Product A", code: "PROD-A", paNumber: "PA-001", value: 100000, currentStatus: "Active" },
      { name: "Product B", code: "PROD-B", paNumber: "PA-002", value: 150000, currentStatus: "Active" },
      { name: "Product C", code: "PROD-C", paNumber: "PA-003", value: 80000, currentStatus: "Pending" },
    ];

    for (const product of sampleProducts) {
      await Product.create(product);
      console.log(`Added product: ${product.name}`);
    }

    // Add sample risks
    const sampleRisks = [
      {
        Title: "Database Performance Risk",
        Description: "Potential performance issues with the database under heavy load",
        "Risk Status": "Open",
        "Project Code": "PROD-A",
        Probability: 0.3,
        "Impact Rating (0.05-0.8)": 0.5,
        DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        Owner: "John Doe",
        MitigationPlan: "Implement database indexing and caching strategies",
        Month: "2024-01"
      },
      {
        Title: "Security Vulnerability Risk",
        Description: "Potential security vulnerability in the authentication system",
        "Risk Status": "Mitigated",
        "Project Code": "PROD-B",
        Probability: 0.2,
        "Impact Rating (0.05-0.8)": 0.7,
        DueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        Owner: "Jane Smith",
        MitigationPlan: "Update authentication library and implement additional security measures",
        Month: "2024-01"
      }
    ];

    for (const risk of sampleRisks) {
      await Risk.create(risk);
      console.log(`Added risk: ${risk.Title}`);
    }

    // Add sample issues
    const sampleIssues = [
      {
        Title: "UI Rendering Issue",
        Discussion: "UI components are not rendering correctly on mobile devices",
        Status: "Open",
        ProjectName: "Product A",
        Priority: "High",
        Impact: "High",
        "Due Date": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        Owner: "Mike Johnson",
        Category: "Frontend",
        Month: "2024-01"
      },
      {
        Title: "API Response Delay",
        Discussion: "API responses are taking longer than expected",
        Status: "Resolved",
        ProjectName: "Product B",
        Priority: "Medium",
        Impact: "Medium",
        "Due Date": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        Owner: "Sarah Wilson",
        Category: "Backend",
        Month: "2024-01"
      }
    ];

    for (const issue of sampleIssues) {
      await Issue.create(issue);
      console.log(`Added issue: ${issue.Title}`);
    }

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();