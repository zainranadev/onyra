import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "customer" | "admin";

export interface IUserAddress {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: IUserAddress;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<IUserAddress>(
  {
    street:   { type: String, trim: true, maxlength: 200 },
    city:     { type: String, trim: true, maxlength: 100 },
    district: { type: String, trim: true, maxlength: 100 },
    province: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    avatar:  { type: String },
    phone:   { type: String, trim: true, maxlength: 30 },
    address: { type: addressSchema },
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default model<IUser>("User", userSchema);
