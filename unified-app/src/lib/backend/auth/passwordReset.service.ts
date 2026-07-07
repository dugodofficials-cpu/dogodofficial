import { randomBytes } from 'crypto';
import { HttpException } from '@backend/exceptions/HttpException';
import { isEmpty } from '@backend/utils/util';
import userModel from '@backend/users/users.model';
import EmailService from '@backend/email/email.service';
import { logger } from '@backend/utils/logger';
import { hash } from 'bcrypt';
class PasswordResetService {
  private emailService = new EmailService();
  private users = userModel;
  private generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }
  private getResetExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    return expiry;
  }
  public async sendPasswordResetEmail(email: string): Promise<void> {
    if (isEmpty(email)) {
      throw new HttpException(400, 'Email is required');
    }
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return;
      }
      const resetToken = this.generateResetToken();
      const resetExpiry = this.getResetExpiry();
      await this.users.findByIdAndUpdate(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      });
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
      const emailData = {
        to: [email],
        subject: 'Reset Your Password - Dugod',
        templateName: 'password-reset',
        variables: {
          firstName: user.firstName || 'User',
          resetUrl,
          expiryHours: 1,
        },
      };
      await this.emailService.sendTemplateEmail(emailData);
      logger.info(`Password reset email sent to ${email} for user ${user._id}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
      throw new HttpException(500, 'Failed to send password reset email');
    }
  }
  public async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (isEmpty(token) || isEmpty(newPassword)) {
      throw new HttpException(400, 'Reset token and new password are required');
    }
    try {
      const user = await this.users.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordResetToken +passwordResetExpires');
      if (!user) {
        throw new HttpException(400, 'Invalid or expired reset token');
      }
      const hashedPassword = await hash(newPassword, 10);
      await this.users.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      logger.info(`Password reset successfully for user ${user._id}`);
      return {
        success: true,
        message: 'Password reset successful. Please login with your new password.'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      logger.error(`Password reset failed: ${error.message}`);
      throw new HttpException(500, 'Password reset failed');
    }
  }
  public async verifyResetToken(token: string): Promise<{ valid: boolean; message: string }> {
    if (isEmpty(token)) {
      throw new HttpException(400, 'Reset token is required');
    }
    try {
      const user = await this.users.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });
      if (!user) {
        return {
          valid: false,
          message: 'Invalid or expired reset token'
        };
      }
      return {
        valid: true,
        message: 'Reset token is valid'
      };
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      throw new HttpException(500, 'Token verification failed');
    }
  }
}
export default PasswordResetService;