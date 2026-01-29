"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blackbox_model_1 = require("../../modules/blackbox/blackbox.model");
const HttpException_1 = require("../../exceptions/HttpException");
const logger_1 = require("../../utils/logger");
class BlackboxService {
    async createQuestion(questionData) {
        var _a;
        try {
            const existingQuestion = await blackbox_model_1.BlackboxQuestionModel.findOne({ order: questionData.order });
            if (existingQuestion) {
                throw new HttpException_1.HttpException(400, `Question with order ${questionData.order} already exists`);
            }
            if (questionData.answerType === 'any' && questionData.answer.trim().length > 0) {
                throw new HttpException_1.HttpException(400, 'For "any" answer type, the answer field should be empty or contain only a placeholder');
            }
            if (questionData.answerType === 'exact' && questionData.answer.trim().length === 0) {
                throw new HttpException_1.HttpException(400, 'For "exact" answer type, the answer field cannot be empty');
            }
            const question = new blackbox_model_1.BlackboxQuestionModel(Object.assign(Object.assign({}, questionData), { answer: questionData.answerType === 'any' ? 'any' : questionData.answer.trim(), isActive: (_a = questionData.isActive) !== null && _a !== void 0 ? _a : true }));
            return await question.save();
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException)
                throw error;
            logger_1.logger.error(error);
            throw new HttpException_1.HttpException(500, 'Error creating question');
        }
    }
    async upsertQuestion(questionData, identifier) {
        var _a, _b;
        try {
            let existingQuestion = null;
            if (identifier) {
                existingQuestion = await blackbox_model_1.BlackboxQuestionModel.findById(identifier);
            }
            if (!existingQuestion) {
                existingQuestion = await blackbox_model_1.BlackboxQuestionModel.findOne({ order: questionData.order });
            }
            if (existingQuestion) {
                const updateData = {
                    question: questionData.question,
                    answer: questionData.answerType === 'any' ? '' : questionData.answer.trim(),
                    answerType: questionData.answerType,
                    secret: questionData.secret,
                    order: questionData.order,
                    isActive: (_a = questionData.isActive) !== null && _a !== void 0 ? _a : existingQuestion.isActive,
                };
                const updatedQuestion = await blackbox_model_1.BlackboxQuestionModel.findByIdAndUpdate(existingQuestion._id, updateData, { new: true, runValidators: true });
                if (!updatedQuestion) {
                    throw new HttpException_1.HttpException(500, 'Error updating question');
                }
                return updatedQuestion;
            }
            else {
                if (questionData.answerType === 'any' && questionData.answer.trim().length > 0) {
                    throw new HttpException_1.HttpException(400, 'For "any" answer type, the answer field should be empty');
                }
                if (questionData.answerType === 'exact' && questionData.answer.trim().length === 0) {
                    throw new HttpException_1.HttpException(400, 'For "exact" answer type, the answer field cannot be empty');
                }
                const question = new blackbox_model_1.BlackboxQuestionModel(Object.assign(Object.assign({}, questionData), { answer: questionData.answerType === 'any' ? '' : questionData.answer.trim(), isActive: (_b = questionData.isActive) !== null && _b !== void 0 ? _b : true }));
                return await question.save();
            }
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException)
                throw error;
            throw new HttpException_1.HttpException(500, 'Error upserting question');
        }
    }
    async getQuestions(query) {
        try {
            const { filters = {}, sort = { field: 'order', order: 'asc' }, pagination = { page: 1, limit: 10 } } = query;
            const filterQuery = {};
            if (filters.isActive !== undefined) {
                filterQuery.isActive = filters.isActive;
            }
            if (filters.search) {
                filterQuery.$or = [
                    { question: { $regex: filters.search, $options: 'i' } },
                    { answer: { $regex: filters.search, $options: 'i' } },
                ];
            }
            const sortQuery = {};
            sortQuery[sort.field] = sort.order === 'desc' ? -1 : 1;
            const skip = (pagination.page - 1) * pagination.limit;
            const [questions, total] = await Promise.all([
                blackbox_model_1.BlackboxQuestionModel.find(filterQuery)
                    .sort(sortQuery)
                    .skip(skip)
                    .limit(pagination.limit)
                    .lean(),
                blackbox_model_1.BlackboxQuestionModel.countDocuments(filterQuery),
            ]);
            const totalPages = Math.ceil(total / pagination.limit);
            return {
                data: questions,
                meta: {
                    total,
                    page: pagination.page,
                    limit: pagination.limit,
                    totalPages,
                },
                message: 'Questions retrieved successfully',
            };
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error retrieving questions');
        }
    }
    async getQuestionById(questionId) {
        try {
            const question = await blackbox_model_1.BlackboxQuestionModel.findById(questionId);
            if (!question) {
                throw new HttpException_1.HttpException(404, 'Question not found');
            }
            return question;
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException)
                throw error;
            throw new HttpException_1.HttpException(500, 'Error retrieving question');
        }
    }
    async updateQuestion(questionId, updateData) {
        try {
            const existingQuestion = await blackbox_model_1.BlackboxQuestionModel.findById(questionId);
            if (!existingQuestion) {
                throw new HttpException_1.HttpException(404, 'Question not found');
            }
            if (updateData.order) {
                const orderConflict = await blackbox_model_1.BlackboxQuestionModel.findOne({
                    order: updateData.order,
                    _id: { $ne: questionId }
                });
                if (orderConflict) {
                    throw new HttpException_1.HttpException(400, `Question with order ${updateData.order} already exists`);
                }
            }
            if (updateData.answerType) {
                if (updateData.answerType === 'any' && updateData.answer && updateData.answer.trim().length > 0) {
                    throw new HttpException_1.HttpException(400, 'For "any" answer type, the answer field should be empty');
                }
                if (updateData.answerType === 'exact' && (!updateData.answer || updateData.answer.trim().length === 0)) {
                    throw new HttpException_1.HttpException(400, 'For "exact" answer type, the answer field cannot be empty');
                }
            }
            if (updateData.answer && updateData.answerType === 'any') {
                updateData.answer = '';
            }
            const question = await blackbox_model_1.BlackboxQuestionModel.findByIdAndUpdate(questionId, updateData, { new: true, runValidators: true });
            if (!question) {
                throw new HttpException_1.HttpException(404, 'Question not found');
            }
            return question;
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException)
                throw error;
            throw new HttpException_1.HttpException(500, 'Error updating question');
        }
    }
    async deleteQuestion(questionId) {
        try {
            const question = await blackbox_model_1.BlackboxQuestionModel.findById(questionId);
            if (!question) {
                throw new HttpException_1.HttpException(404, 'Question not found');
            }
            const answerCount = await blackbox_model_1.BlackboxAnswerModel.countDocuments({ questionId: new mongoose_1.Types.ObjectId(questionId) });
            if (answerCount > 0) {
                throw new HttpException_1.HttpException(400, 'Cannot delete question that has been answered by users');
            }
            await blackbox_model_1.BlackboxQuestionModel.findByIdAndDelete(questionId);
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException)
                throw error;
            throw new HttpException_1.HttpException(500, 'Error deleting question');
        }
    }
    async answerQuestion(userId, answerData) {
        try {
            const question = await blackbox_model_1.BlackboxQuestionModel.findById(answerData.questionId);
            if (!question || !question.isActive) {
                throw new HttpException_1.HttpException(404, 'Question not found or inactive');
            }
            const userAnswerText = answerData.answer.trim();
            if (userAnswerText.length === 0) {
                throw new HttpException_1.HttpException(400, 'Answer cannot be empty');
            }
            let isCorrect;
            let message;
            if (question.answerType === 'exact') {
                isCorrect = question.answer.toLowerCase().trim() === userAnswerText.toLowerCase();
                message = isCorrect
                    ? 'Correct answer! Secret revealed.'
                    : 'Incorrect answer. Please try again.';
            }
            else {
                isCorrect = userAnswerText.length > 0;
                message = isCorrect
                    ? 'Thank you for your response! Secret revealed.'
                    : 'Please provide a meaningful response.';
            }
            const existingAnswer = await blackbox_model_1.BlackboxAnswerModel.findOne({
                questionId: new mongoose_1.Types.ObjectId(answerData.questionId),
                userId: new mongoose_1.Types.ObjectId(userId),
                isCorrect: true,
            });
            if (existingAnswer) {
                throw new HttpException_1.HttpException(400, 'You have already answered this question');
            }
            if (isCorrect) {
                const userAnswer = new blackbox_model_1.BlackboxAnswerModel({
                    questionId: new mongoose_1.Types.ObjectId(answerData.questionId),
                    userId: new mongoose_1.Types.ObjectId(userId),
                    userAnswer: userAnswerText,
                    isCorrect,
                    answeredAt: new Date(),
                });
                await userAnswer.save();
            }
            return {
                isCorrect,
                secret: isCorrect ? question.secret : undefined,
                message,
            };
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException)
                throw error;
            throw new HttpException_1.HttpException(500, 'Error processing answer');
        }
    }
    async getUserProgress(userId) {
        try {
            const activeQuestions = await blackbox_model_1.BlackboxQuestionModel.find({ isActive: true }).sort({ order: 1 });
            const userAnswers = await blackbox_model_1.BlackboxAnswerModel.find({ userId: new mongoose_1.Types.ObjectId(userId) });
            const answeredQuestionIds = new Set(userAnswers.map(answer => answer.questionId.toString()));
            const answeredQuestions = [];
            const unansweredQuestions = [];
            activeQuestions.forEach(question => {
                const userAnswer = userAnswers.find(answer => answer.questionId.equals(question._id));
                if (userAnswer) {
                    answeredQuestions.push(Object.assign(Object.assign({}, question.toObject()), { userAnswer }));
                }
                else {
                    unansweredQuestions.push(question);
                }
            });
            const nextQuestion = unansweredQuestions.length > 0 ? unansweredQuestions[0] : undefined;
            return {
                answeredQuestions,
                nextQuestion,
                totalQuestions: activeQuestions.length,
                answeredCount: answeredQuestions.length,
                remainingCount: unansweredQuestions.length,
            };
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error retrieving user progress');
        }
    }
    async getAnsweredQuestions(userId) {
        try {
            const userAnswers = await blackbox_model_1.BlackboxAnswerModel.find({ userId: new mongoose_1.Types.ObjectId(userId) });
            const questionIds = userAnswers.map(answer => answer.questionId);
            const questions = await blackbox_model_1.BlackboxQuestionModel.find({
                _id: { $in: questionIds },
                isActive: true,
            }).sort({ order: 1 });
            return questions;
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error retrieving answered questions');
        }
    }
    async getNextUnansweredQuestion(userId) {
        try {
            const activeQuestions = await blackbox_model_1.BlackboxQuestionModel.find({ isActive: true }).sort({ order: 1 });
            const userAnsweredQuestionIds = await blackbox_model_1.BlackboxAnswerModel.distinct('questionId', {
                userId: new mongoose_1.Types.ObjectId(userId),
            });
            const nextQuestion = activeQuestions.find(question => !userAnsweredQuestionIds.some(id => id.equals(question._id)));
            return nextQuestion || null;
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error retrieving next question');
        }
    }
    async resetUserProgress(userId) {
        try {
            await blackbox_model_1.BlackboxAnswerModel.deleteMany({ userId: new mongoose_1.Types.ObjectId(userId) });
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error resetting user progress');
        }
    }
    async getQuestionStatistics() {
        try {
            const [totalQuestions, exactAnswerQuestions, anyAnswerQuestions, activeQuestions, inactiveQuestions,] = await Promise.all([
                blackbox_model_1.BlackboxQuestionModel.countDocuments(),
                blackbox_model_1.BlackboxQuestionModel.countDocuments({ answerType: 'exact' }),
                blackbox_model_1.BlackboxQuestionModel.countDocuments({ answerType: 'any' }),
                blackbox_model_1.BlackboxQuestionModel.countDocuments({ isActive: true }),
                blackbox_model_1.BlackboxQuestionModel.countDocuments({ isActive: false }),
            ]);
            return {
                totalQuestions,
                exactAnswerQuestions,
                anyAnswerQuestions,
                activeQuestions,
                inactiveQuestions,
            };
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error retrieving question statistics');
        }
    }
    async reorderQuestions() {
        try {
            const questions = await blackbox_model_1.BlackboxQuestionModel.find({ isActive: true }).sort({ order: 1 });
            for (let i = 0; i < questions.length; i++) {
                if (questions[i].order !== i + 1) {
                    await blackbox_model_1.BlackboxQuestionModel.findByIdAndUpdate(questions[i]._id, { order: i + 1 });
                }
            }
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error reordering questions');
        }
    }
}
exports.default = BlackboxService;
//# sourceMappingURL=blackbox.service.js.map