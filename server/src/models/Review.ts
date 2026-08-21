import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  product: Types.ObjectId;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default model<IReview>("Review", reviewSchema);
