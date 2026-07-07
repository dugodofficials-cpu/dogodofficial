import { JobModel } from './jobs.model';
import { Job, JobStatus, JobType } from './jobs.interface';
import { logger } from '@backend/utils/logger';
class JobsService {
  public async createJob(type: JobType, data: any, maxAttempts: number = 3): Promise<Job> {
    const job = await JobModel.create({
      type,
      status: JobStatus.PENDING,
      data,
      maxAttempts,
      attempts: 0,
    });
    logger.info(`Job created: ${job._id} (type: ${type})`);
    return job.toObject();
  }
  public async getNextPendingJob(type: JobType): Promise<Job | null> {
    const job = await JobModel.findOneAndUpdate(
      {
        type,
        status: JobStatus.PENDING,
      },
      {
        $set: {
          status: JobStatus.PROCESSING,
          processedAt: new Date(),
        },
        $inc: {
          attempts: 1,
        },
      },
      {
        new: true,
        sort: { createdAt: 1 },
      },
    );
    if (job) {
      logger.info(`Job ${job._id} picked up for processing (attempt ${job.attempts}/${job.maxAttempts})`);
    }
    return job ? job.toObject() : null;
  }
  public async completeJob(jobId: string): Promise<void> {
    await JobModel.findByIdAndUpdate(jobId, {
      $set: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
    logger.info(`Job ${jobId} marked as completed`);
  }
  public async failJob(jobId: string, error: string): Promise<void> {
    await JobModel.findByIdAndUpdate(jobId, {
      $set: {
        status: JobStatus.FAILED,
        failedAt: new Date(),
        error,
      },
    });
    logger.error(`Job ${jobId} marked as failed: ${error}`);
  }
  public async getJobById(jobId: string): Promise<Job | null> {
    const job = await JobModel.findById(jobId);
    return job ? job.toObject() : null;
  }
  public async getJobsByStatus(status: JobStatus, limit: number = 100): Promise<Job[]> {
    const jobs = await JobModel.find({ status }).limit(limit).sort({ createdAt: -1 });
    return jobs.map(job => job.toObject());
  }
  public async retryJob(jobId: string): Promise<boolean> {
    const job = await JobModel.findById(jobId);
    if (!job || job.attempts >= job.maxAttempts) {
      return false;
    }
    await JobModel.findByIdAndUpdate(jobId, {
      $set: {
        status: JobStatus.PENDING,
        error: undefined,
      },
    });
    logger.info(`Job ${jobId} queued for retry (attempt ${job.attempts + 1}/${job.maxAttempts})`);
    return true;
  }
}
export default new JobsService();