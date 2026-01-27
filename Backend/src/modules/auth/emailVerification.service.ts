import { randomBytes } from 'crypto';
import { HttpException } from '@/exceptions/HttpException';
import { isEmpty } from '@/utils/util';
import userModel from '@/modules/users/users.model';
import EmailService from '@/modules/email/email.service';
import { logger } from '@/utils/logger';
class EmailVerificationService {
  private emailService = new EmailService();
  private users = userModel;
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }
  private getVerificationExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  }
  public async sendVerificationEmail(userId: string, userEmail: string, firstName?: string): Promise<void> {
    if (isEmpty(userId) || isEmpty(userEmail)) {
      throw new HttpException(400, 'User ID and email are required');
    }
    try {
      const verificationToken = this.generateVerificationToken();
      const verificationExpiry = this.getVerificationExpiry();
      await this.users.findByIdAndUpdate(userId, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpiry,
      });
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;
      const emailData = {
        to: [userEmail],
        subject: 'Verify Your Email Address - Dugod',
        templateName: 'email-verification',
        variables: {
          firstName: firstName || 'User',
          verificationUrl,
          expiryHours: 24,
        },
      };
      await this.emailService.sendTemplateEmail(emailData);
      logger.info(`Verification email sent to ${userEmail} for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${userEmail}: ${error.message}`);
      throw new HttpException(500, 'Failed to send verification email');
    }
  }
  public async verifyEmail(token: string): Promise<{ success: boolean; message: string; user?: any }> {
    if (isEmpty(token)) {
      throw new HttpException(400, 'Verification token is required');
    }
    try {
      const user = await this.users.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      }).select('+emailVerificationToken +emailVerificationExpires');
      if (!user) {
        throw new HttpException(400, 'Invalid or expired verification token');
      }
      await this.users.findByIdAndUpdate(user._id, {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });
      logger.info(`Email verified for user ${user._id}`);
      const verifiedUser = await this.users.findById(user._id).select('-password -emailVerificationToken -emailVerificationExpires');
      return {
        success: true,
        message: 'Email verified successfully',
        user: verifiedUser
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      logger.error(`Email verification failed: ${error.message}`);
      throw new HttpException(500, 'Email verification failed');
    }
  }
  public async resendVerificationEmail(email: string): Promise<void> {
    if (isEmpty(email)) {
      throw new HttpException(400, 'Email is required');
    }
    try {
      const user = await this.users.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
      if (!user) {
        throw new HttpException(404, 'User not found');
      }
      if (user.isEmailVerified) {
        throw new HttpException(400, 'Email is already verified');
      }
      if (user.emailVerificationExpires && user.emailVerificationExpires > new Date(Date.now() - 5 * 60 * 1000)) {
        throw new HttpException(400, 'Please wait 5 minutes before requesting another verification email');
      }
      await this.sendVerificationEmail(user._id.toString(), user.email, user.firstName);
      logger.info(`Verification email resent to ${email}`);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      logger.error(`Failed to resend verification email to ${email}: ${error.message}`);
      throw new HttpException(500, 'Failed to resend verification email');
    }
  }
}
export default EmailVerificationService;