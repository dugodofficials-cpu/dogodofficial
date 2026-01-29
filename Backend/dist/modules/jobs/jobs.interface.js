"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobType = exports.JobStatus = void 0;
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
var JobType;
(function (JobType) {
    JobType["EBOOK_UPLOAD"] = "ebook_upload";
})(JobType = exports.JobType || (exports.JobType = {}));
//# sourceMappingURL=jobs.interface.js.map