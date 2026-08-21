import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  image: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  category: string;
  description: string;
  shortDescription: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text", category: "text" });

export default model<IProduct>("Product", productSchema);
