import mongoose, { Schema, Document } from 'mongoose';

export interface IUsage extends Document {
  userId: string;
  date: string; // YYYY-MM-DD format
  count: number;
  lastGeneratedAt: Date;
}

const UsageSchema = new Schema<IUsage>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastGeneratedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Usage = mongoose.models.Usage || mongoose.model<IUsage>('Usage', UsageSchema);
