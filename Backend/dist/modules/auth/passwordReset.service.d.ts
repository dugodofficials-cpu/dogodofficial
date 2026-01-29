declare class PasswordResetService {
    private emailService;
    private users;
    private generateResetToken;
    private getResetExpiry;
    sendPasswordResetEmail(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        valid: boolean;
        message: string;
    }>;
}
export default PasswordResetService;
