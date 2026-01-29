"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jobs_model_1 = require("./jobs.model");
const jobs_interface_1 = require("./jobs.interface");
const logger_1 = require("../../utils/logger");
class JobsService {
    async createJob(type, data, maxAttempts = 3) {
        const job = await jobs_model_1.JobModel.create({
            type,
            status: jobs_interface_1.JobStatus.PENDING,
            data,
            maxAttempts,
            attempts: 0,
        });
        logger_1.logger.info(`Job created: ${job._id} (type: ${type})`);
        return job.toObject();
    }
    async getNextPendingJob(type) {
        const job = await jobs_model_1.JobModel.findOneAndUpdate({
            type,
            status: jobs_interface_1.JobStatus.PENDING,
        }, {
            $set: {
                status: jobs_interface_1.JobStatus.PROCESSING,
                processedAt: new Date(),
            },
            $inc: {
                attempts: 1,
            },
        }, {
            new: true,
            sort: { createdAt: 1 },
        });
        if (job) {
            logger_1.logger.info(`Job ${job._id} picked up for processing (attempt ${job.attempts}/${job.maxAttempts})`);
        }
        return job ? job.toObject() : null;
    }
    async completeJob(jobId) {
        await jobs_model_1.JobModel.findByIdAndUpdate(jobId, {
            $set: {
                status: jobs_interface_1.JobStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
        logger_1.logger.info(`Job ${jobId} marked as completed`);
    }
    async failJob(jobId, error) {
        await jobs_model_1.JobModel.findByIdAndUpdate(jobId, {
            $set: {
                status: jobs_interface_1.JobStatus.FAILED,
                failedAt: new Date(),
                error,
            },
        });
        logger_1.logger.error(`Job ${jobId} marked as failed: ${error}`);
    }
    async getJobById(jobId) {
        const job = await jobs_model_1.JobModel.findById(jobId);
        return job ? job.toObject() : null;
    }
    async getJobsByStatus(status, limit = 100) {
        const jobs = await jobs_model_1.JobModel.find({ status }).limit(limit).sort({ createdAt: -1 });
        return jobs.map(job => job.toObject());
    }
    async retryJob(jobId) {
        const job = await jobs_model_1.JobModel.findById(jobId);
        if (!job || job.attempts >= job.maxAttempts) {
            return false;
        }
        await jobs_model_1.JobModel.findByIdAndUpdate(jobId, {
            $set: {
                status: jobs_interface_1.JobStatus.PENDING,
                error: undefined,
            },
        });
        logger_1.logger.info(`Job ${jobId} queued for retry (attempt ${job.attempts + 1}/${job.maxAttempts})`);
        return true;
    }
}
exports.default = new JobsService();
//# sourceMappingURL=jobs.service.js.map