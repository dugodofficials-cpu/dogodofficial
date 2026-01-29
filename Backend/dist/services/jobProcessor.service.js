"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jobs_service_1 = tslib_1.__importDefault(require("../modules/jobs/jobs.service"));
const jobs_interface_1 = require("../modules/jobs/jobs.interface");
const logger_1 = require("../utils/logger");
const s3_1 = tslib_1.__importDefault(require("../utils/s3"));
const s3Public_1 = tslib_1.__importDefault(require("../utils/s3Public"));
const products_service_1 = tslib_1.__importDefault(require("../modules/products/products.service"));
const email_service_1 = tslib_1.__importDefault(require("../modules/email/email.service"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
class JobProcessorService {
    constructor() {
        this.productService = new products_service_1.default();
        this.emailService = new email_service_1.default();
        this.processing = false;
        this.pollInterval = 5 * 60 * 1000;
        this.intervalId = null;
    }
    start() {
        if (this.processing) {
            logger_1.logger.warn('Job processor is already running');
            return;
        }
        this.processing = true;
        logger_1.logger.info('Job processor started');
        this.processJobs();
        this.intervalId = setInterval(() => {
            this.processJobs();
        }, this.pollInterval);
    }
    stop() {
        this.processing = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        logger_1.logger.info('Job processor stopped');
    }
    async processJobs() {
        if (!this.processing) {
            return;
        }
        try {
            await this.processEbookUploadJobs();
        }
        catch (error) {
            logger_1.logger.error('Error processing jobs:', error);
        }
    }
    async processEbookUploadJobs() {
        const job = await jobs_service_1.default.getNextPendingJob(jobs_interface_1.JobType.EBOOK_UPLOAD);
        if (!job) {
            return;
        }
        const startTime = Date.now();
        logger_1.logger.info(`[JobProcessor] Processing job ${job._id} (ebook upload for product ${job.data.productId})`);
        try {
            await this.processEbookUpload(job);
            await jobs_service_1.default.completeJob(job._id);
            const duration = Date.now() - startTime;
            logger_1.logger.info(`[JobProcessor] Job ${job._id} completed successfully in ${duration}ms`);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`[JobProcessor] Job ${job._id} failed after ${duration}ms: ${errorMessage}`);
            await jobs_service_1.default.failJob(job._id, errorMessage);
        }
    }
    async processEbookUpload(job) {
        const { productId, downloadFilePath, coverFilePath, downloadFileMimetype, coverFileMimetype, downloadFileOriginalName, coverFileOriginalName, folder, existingEbookDeliveryInfo, userEmail, userFirstName, } = job.data;
        let downloadUrl;
        let bookCoverArt;
        const filesForCleanup = [];
        try {
            if (downloadFilePath && downloadFileMimetype && downloadFileOriginalName) {
                const fileForUpload = {
                    fieldname: 'downloadUrl',
                    originalname: downloadFileOriginalName,
                    encoding: '7bit',
                    mimetype: downloadFileMimetype,
                    path: downloadFilePath,
                    size: 0,
                    buffer: undefined,
                    destination: '',
                    filename: downloadFilePath.split('/').pop() || downloadFileOriginalName,
                };
                logger_1.logger.info(`[JobProcessor] Uploading ebook file: ${downloadFileOriginalName}`);
                const { key } = await s3_1.default.uploadFile(fileForUpload, `${folder}/download`);
                downloadUrl = key;
                filesForCleanup.push(fileForUpload);
                logger_1.logger.info(`[JobProcessor] Ebook file uploaded: ${key}`);
            }
            if (coverFilePath && coverFileMimetype && coverFileOriginalName) {
                const fileForUpload = {
                    fieldname: 'bookCoverArt',
                    originalname: coverFileOriginalName,
                    encoding: '7bit',
                    mimetype: coverFileMimetype,
                    path: coverFilePath,
                    size: 0,
                    buffer: undefined,
                    destination: '',
                    filename: coverFilePath.split('/').pop() || coverFileOriginalName,
                };
                logger_1.logger.info(`[JobProcessor] Uploading cover image: ${coverFileOriginalName}`);
                const { url } = await s3Public_1.default.uploadPublicFile(fileForUpload, `${folder}/cover`);
                bookCoverArt = url;
                filesForCleanup.push(fileForUpload);
                logger_1.logger.info(`[JobProcessor] Cover image uploaded: ${url}`);
            }
            if (downloadUrl || bookCoverArt) {
                const updateData = {
                    ebookDeliveryInfo: Object.assign(Object.assign(Object.assign({}, existingEbookDeliveryInfo), (downloadUrl && { downloadUrl })), (bookCoverArt && { bookCoverArt })),
                };
                logger_1.logger.info(`[JobProcessor] Updating product ${productId} with ebook delivery info`);
                const updatedProduct = await this.productService.updateEbookDeliveryInfo(productId, updateData);
                if (userEmail) {
                    try {
                        logger_1.logger.info(`[JobProcessor] Sending email notification to ${userEmail}`);
                        await this.emailService.sendEmail({
                            to: [userEmail],
                            subject: 'Ebook Upload Completed Successfully',
                            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <p>Hello ${userFirstName || 'User'},</p>
                  <p>Your ebook product "<strong>${updatedProduct.name}</strong>" has been successfully uploaded and is now ready.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Product Details:</strong></p>
                    <ul>
                      <li>Product Name: ${updatedProduct.name}</li>
                      <li>SKU: ${updatedProduct.sku}</li>
                      <li>Status: ${updatedProduct.status}</li>
                      ${downloadUrl ? '<li>Ebook File: Uploaded</li>' : ''}
                      ${bookCoverArt ? '<li>Cover Image: Uploaded</li>' : ''}
                    </ul>
                  </div>
                  <p>You can now view and manage your product in the admin dashboard.</p>
                  <p>Thanks!</p>
                </div>
              `,
                            textContent: `Hello ${userFirstName || 'User'},\n\nYour ebook product "${updatedProduct.name}" has been successfully uploaded and is now ready.\n\nProduct Details:\n- Product Name: ${updatedProduct.name}\n- SKU: ${updatedProduct.sku}\n- Status: ${updatedProduct.status}\n${downloadUrl ? '- Ebook File: Uploaded ✓\n' : ''}${bookCoverArt ? '- Cover Image: Uploaded ✓\n' : ''}\n\nYou can now view and manage your product in the admin dashboard.\n\nThank you for using Dugod!`,
                        });
                        logger_1.logger.info(`[JobProcessor] Email notification sent successfully`);
                    }
                    catch (emailError) {
                        logger_1.logger.error(`[JobProcessor] Failed to send email:`, emailError);
                    }
                }
                logger_1.logger.info(`[JobProcessor] Product ${productId} updated successfully`);
            }
            if (filesForCleanup.length > 0) {
                (0, upload_middleware_1.cleanupTempFiles)(filesForCleanup);
                logger_1.logger.info(`[JobProcessor] Temp files cleaned up`);
            }
        }
        catch (error) {
            logger_1.logger.error(`[JobProcessor] Error processing ebook upload for product ${productId}:`, error);
            if (filesForCleanup.length > 0) {
                (0, upload_middleware_1.cleanupTempFiles)(filesForCleanup);
            }
            throw error;
        }
    }
}
exports.default = new JobProcessorService();
//# sourceMappingURL=jobProcessor.service.js.map