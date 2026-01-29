import mongoose from 'mongoose';
import { EmailTemplate, EmailLog } from './email.interface';
declare const _default: {
    EmailTemplate: mongoose.Model<EmailTemplate, {}, {}, {}, any>;
    EmailLog: mongoose.Model<EmailLog, {}, {}, {}, any>;
};
export default _default;
