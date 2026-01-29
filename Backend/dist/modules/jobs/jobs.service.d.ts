import { Job, JobStatus, JobType } from './jobs.interface';
declare class JobsService {
    createJob(type: JobType, data: any, maxAttempts?: number): Promise<Job>;
    getNextPendingJob(type: JobType): Promise<Job | null>;
    completeJob(jobId: string): Promise<void>;
    failJob(jobId: string, error: string): Promise<void>;
    getJobById(jobId: string): Promise<Job | null>;
    getJobsByStatus(status: JobStatus, limit?: number): Promise<Job[]>;
    retryJob(jobId: string): Promise<boolean>;
}
declare const _default: JobsService;
export default _default;
