export declare enum JobStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum JobType {
    EBOOK_UPLOAD = "ebook_upload"
}
export interface Job {
    _id?: string;
    type: JobType;
    status: JobStatus;
    data: any;
    error?: string;
    attempts: number;
    maxAttempts: number;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
