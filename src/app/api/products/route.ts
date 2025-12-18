import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({}).sort({ name: 1 }).lean();

        // Convert MongoDB _id to id for consistency
        const formattedProducts = products.map(product => ({
            ...product,
            id: product._id.toString(),
            _id: product._id.toString(),
        }));

        return NextResponse.json(formattedProducts);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const product = await Product.create(body);

        return NextResponse.json({
            ...product.toObject(),
            id: product._id.toString(),
            _id: product._id.toString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product', message: error.message },
            { status: 500 }
        );
    }
}
