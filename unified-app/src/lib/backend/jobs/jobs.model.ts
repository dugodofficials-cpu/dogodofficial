import { model, Schema, Document } from 'mongoose';
import { Job, JobStatus, JobType } from './jobs.interface';
const jobSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(JobType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    error: {
      type: String,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);
jobSchema.index({ status: 1, type: 1, createdAt: 1 });
jobSchema.index({ status: 1, createdAt: 1 });
export const JobModel = model<Job & Document>('Job', jobSchema);