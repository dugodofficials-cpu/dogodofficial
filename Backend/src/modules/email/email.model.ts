import mongoose, { Schema } from 'mongoose';
import { EmailTemplate, EmailLog } from './email.interface';
const emailTemplateSchema = new Schema<EmailTemplate>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      trim: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const emailLogSchema = new Schema<EmailLog>(
  {
    to: {
      type: [String],
      required: true,
    },
    cc: {
      type: [String],
      default: [],
    },
    bcc: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      trim: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailTemplate',
    },
    templateName: {
      type: String,
      trim: true,
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    provider: {
      type: String,
      enum: ['zepto', 'resend'],
      required: true,
      default: 'zepto',
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    zeptoMessageId: {
      type: String,
      trim: true,
    },
    resendMessageId: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ isActive: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ templateName: 1 });
emailLogSchema.index({ to: 1 });
emailLogSchema.index({ provider: 1 });
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ sentAt: -1 });
const EmailTemplateModel = mongoose.model<EmailTemplate>('EmailTemplate', emailTemplateSchema);
const EmailLogModel = mongoose.model<EmailLog>('EmailLog', emailLogSchema);
export default {
  EmailTemplate: EmailTemplateModel,
  EmailLog: EmailLogModel,
};