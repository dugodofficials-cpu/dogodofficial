declare class JobProcessorService {
    private productService;
    private emailService;
    private processing;
    private pollInterval;
    private intervalId;
    start(): void;
    stop(): void;
    private processJobs;
    private processEbookUploadJobs;
    private processEbookUpload;
}
declare const _default: JobProcessorService;
export default _default;
