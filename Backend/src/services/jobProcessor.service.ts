import jobsService from '@/modules/jobs/jobs.service';
import { JobType, JobStatus } from '@/modules/jobs/jobs.interface';
import { logger } from '@/utils/logger';
import s3Service from '@/utils/s3';
import s3PublicService from '@/utils/s3Public';
import ProductService from '@/modules/products/products.service';
import EmailService from '@/modules/email/email.service';
import { UpdateEbookDeliveryInfoDto } from '@/modules/products/products.dto';
import { cleanupTempFiles } from '@/middlewares/upload.middleware';
import { Express } from 'express';
class JobProcessorService {
  private productService = new ProductService();
  private emailService = new EmailService();
  private processing: boolean = false;
  private pollInterval: number = 5 * 60 * 1000;
  private intervalId: NodeJS.Timeout | null = null;
  public start(): void {
    if (this.processing) {
      logger.warn('Job processor is already running');
      return;
    }
    this.processing = true;
    logger.info('Job processor started');
    this.processJobs();
    this.intervalId = setInterval(() => {
      this.processJobs();
    }, this.pollInterval);
  }
  public stop(): void {
    this.processing = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Job processor stopped');
  }
  private async processJobs(): Promise<void> {
    if (!this.processing) {
      return;
    }
    try {
      await this.processEbookUploadJobs();
    } catch (error) {
      logger.error('Error processing jobs:', error);
    }
  }
  private async processEbookUploadJobs(): Promise<void> {
    const job = await jobsService.getNextPendingJob(JobType.EBOOK_UPLOAD);
    if (!job) {
      return;
    }
    const startTime = Date.now();
    logger.info(`[JobProcessor] Processing job ${job._id} (ebook upload for product ${job.data.productId})`);
    try {
      await this.processEbookUpload(job);
      await jobsService.completeJob(job._id!);
      const duration = Date.now() - startTime;
      logger.info(`[JobProcessor] Job ${job._id} completed successfully in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[JobProcessor] Job ${job._id} failed after ${duration}ms: ${errorMessage}`);
      await jobsService.failJob(job._id!, errorMessage);
    }
  }
  private async processEbookUpload(job: any): Promise<void> {
    const {
      productId,
      downloadFilePath,
      coverFilePath,
      downloadFileMimetype,
      coverFileMimetype,
      downloadFileOriginalName,
      coverFileOriginalName,
      folder,
      existingEbookDeliveryInfo,
      userEmail,
      userFirstName,
    } = job.data;
    let downloadUrl: string | undefined;
    let bookCoverArt: string | undefined;
    const filesForCleanup: any[] = [];
    try {
      if (downloadFilePath && downloadFileMimetype && downloadFileOriginalName) {
        const fileForUpload: Express.Multer.File = {
          fieldname: 'downloadUrl',
          originalname: downloadFileOriginalName,
          encoding: '7bit',
          mimetype: downloadFileMimetype,
          path: downloadFilePath,
          size: 0,
          buffer: undefined,
          destination: '',
          filename: downloadFilePath.split('/').pop() || downloadFileOriginalName,
        } as Express.Multer.File;
        logger.info(`[JobProcessor] Uploading ebook file: ${downloadFileOriginalName}`);
        const { key } = await s3Service.uploadFile(fileForUpload, `${folder}/download`);
        downloadUrl = key;
        filesForCleanup.push(fileForUpload);
        logger.info(`[JobProcessor] Ebook file uploaded: ${key}`);
      }
      if (coverFilePath && coverFileMimetype && coverFileOriginalName) {
        const fileForUpload: Express.Multer.File = {
          fieldname: 'bookCoverArt',
          originalname: coverFileOriginalName,
          encoding: '7bit',
          mimetype: coverFileMimetype,
          path: coverFilePath,
          size: 0,
          buffer: undefined,
          destination: '',
          filename: coverFilePath.split('/').pop() || coverFileOriginalName,
        } as Express.Multer.File;
        logger.info(`[JobProcessor] Uploading cover image: ${coverFileOriginalName}`);
        const { url } = await s3PublicService.uploadPublicFile(fileForUpload, `${folder}/cover`);
        bookCoverArt = url;
        filesForCleanup.push(fileForUpload);
        logger.info(`[JobProcessor] Cover image uploaded: ${url}`);
      }
      if (downloadUrl || bookCoverArt) {
        const updateData: UpdateEbookDeliveryInfoDto = {
          ebookDeliveryInfo: {
            ...existingEbookDeliveryInfo,
            ...(downloadUrl && { downloadUrl }),
            ...(bookCoverArt && { bookCoverArt }),
          },
        };
        logger.info(`[JobProcessor] Updating product ${productId} with ebook delivery info`);
        const updatedProduct = await this.productService.updateEbookDeliveryInfo(productId, updateData);
        if (userEmail) {
          try {
            logger.info(`[JobProcessor] Sending email notification to ${userEmail}`);
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
            logger.info(`[JobProcessor] Email notification sent successfully`);
          } catch (emailError) {
            logger.error(`[JobProcessor] Failed to send email:`, emailError);
          }
        }
        logger.info(`[JobProcessor] Product ${productId} updated successfully`);
      }
      if (filesForCleanup.length > 0) {
        cleanupTempFiles(filesForCleanup);
        logger.info(`[JobProcessor] Temp files cleaned up`);
      }
    } catch (error) {
      logger.error(`[JobProcessor] Error processing ebook upload for product ${productId}:`, error);
      if (filesForCleanup.length > 0) {
        cleanupTempFiles(filesForCleanup);
      }
      throw error;
    }
  }
}
export default new JobProcessorService();