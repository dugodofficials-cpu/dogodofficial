declare class EmailVerificationService {
    private emailService;
    private users;
    private generateVerificationToken;
    private getVerificationExpiry;
    sendVerificationEmail(userId: string, userEmail: string, firstName?: string): Promise<void>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
        user?: any;
    }>;
    resendVerificationEmail(email: string): Promise<void>;
}
export default EmailVerificationService;
