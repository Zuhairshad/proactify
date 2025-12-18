import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
    code: string;
    name: string;
    paNumber?: string;
    value?: number;
    currentStatus?: string;
}

const ProductSchema = new Schema<IProduct>(
    {
        code: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        paNumber: { type: String },
        value: { type: Number },
        currentStatus: { type: String },
    },
    {
        timestamps: true,
        collection: 'products',
    }
);

// Prevent model recompilation in development
const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;
