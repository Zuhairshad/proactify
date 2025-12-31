// Quick script to check what's actually in the database
import connectDB from '../lib/mongodb';
import Risk from '../models/Risk';

async function checkRiskData() {
    try {
        await connectDB();
        const risks = await Risk.find({}).limit(5).lean();

        console.log('\n=== RISK DATA IN DATABASE ===\n');
        risks.forEach((risk, index) => {
            console.log(`Risk ${index + 1}: ${risk.Title}`);
            console.log('All fields:', Object.keys(risk));
            console.log('Probability:', risk.Probability);
            console.log('Impact Rating field value:', risk["Impact Rating (0.05-0.8)"]);
            console.log('Full risk object:', JSON.stringify(risk, null, 2));
            console.log('\n---\n');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRiskData();
