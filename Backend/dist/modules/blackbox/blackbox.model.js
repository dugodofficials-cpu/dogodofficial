"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackboxAnswerModel = exports.BlackboxQuestionModel = void 0;
const mongoose_1 = require("mongoose");
const blackboxQuestionSchema = new mongoose_1.Schema({
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
const blackboxAnswerSchema = new mongoose_1.Schema({
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'BlackboxQuestion',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const BlackboxQuestionModel = (0, mongoose_1.model)('BlackboxQuestion', blackboxQuestionSchema);
exports.BlackboxQuestionModel = BlackboxQuestionModel;
const BlackboxAnswerModel = (0, mongoose_1.model)('BlackboxAnswer', blackboxAnswerSchema);
exports.BlackboxAnswerModel = BlackboxAnswerModel;
exports.default = BlackboxQuestionModel;
//# sourceMappingURL=blackbox.model.js.map