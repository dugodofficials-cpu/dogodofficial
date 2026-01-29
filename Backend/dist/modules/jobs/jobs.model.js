"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModel = void 0;
const mongoose_1 = require("mongoose");
const jobs_interface_1 = require("./jobs.interface");
const jobSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(jobs_interface_1.JobType),
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(jobs_interface_1.JobStatus),
        default: jobs_interface_1.JobStatus.PENDING,
        required: true,
        index: true,
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
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
}, {
    timestamps: true,
});
jobSchema.index({ status: 1, type: 1, createdAt: 1 });
jobSchema.index({ status: 1, createdAt: 1 });
exports.JobModel = (0, mongoose_1.model)('Job', jobSchema);
//# sourceMappingURL=jobs.model.js.map