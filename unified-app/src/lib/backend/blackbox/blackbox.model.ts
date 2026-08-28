import { model, Schema, Document } from 'mongoose';
import { BlackboxQuestion, BlackboxAnswer } from '@backend/blackbox/blackbox.interface';
const blackboxQuestionSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  answerType: {
    type: String,
    required: true,
    enum: ['exact', 'any'],
    default: 'exact',
  },
  secret: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  order: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
const blackboxAnswerSchema: Schema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'BlackboxQuestion',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  answeredAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
blackboxAnswerSchema.index({ questionId: 1, userId: 1 }, { unique: true });
blackboxAnswerSchema.virtual('question', {
  ref: 'BlackboxQuestion',
  localField: 'questionId',
  foreignField: '_id',
  justOne: true,
});
blackboxAnswerSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
blackboxQuestionSchema.virtual('answerCount', {
  ref: 'BlackboxAnswer',
  localField: '_id',
  foreignField: 'questionId',
  count: true,
});
blackboxQuestionSchema.virtual('correctAnswerCount', {
  ref: 'BlackboxAnswer',
  localField: '_id',
  foreignField: 'questionId',
  count: true,
  match: { isCorrect: true },
});
const BlackboxQuestionModel = model<BlackboxQuestion & Document>('BlackboxQuestion', blackboxQuestionSchema);
const BlackboxAnswerModel = model<BlackboxAnswer & Document>('BlackboxAnswer', blackboxAnswerSchema);
export { BlackboxQuestionModel, BlackboxAnswerModel };
export default BlackboxQuestionModel;