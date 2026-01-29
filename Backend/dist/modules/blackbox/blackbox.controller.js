"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const blackbox_service_1 = tslib_1.__importDefault(require("../../modules/blackbox/blackbox.service"));
const HttpException_1 = require("../../exceptions/HttpException");
class BlackboxController {
    constructor() {
        this.blackboxService = new blackbox_service_1.default();
        this.createQuestion = async (req, res, next) => {
            try {
                const questionData = req.body;
                const question = await this.blackboxService.createQuestion(questionData);
                res.status(201).json({ data: question, message: 'Question created successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getQuestions = async (req, res, next) => {
            try {
                const query = req.query;
                const queryParams = {
                    filters: {
                        isActive: query.isActive,
                        search: query.search,
                    },
                    sort: {
                        field: query.sortBy || 'order',
                        order: query.sortOrder || 'asc',
                    },
                    pagination: {
                        page: query.page ? parseInt(query.page) : 1,
                        limit: query.limit ? parseInt(query.limit) : 10,
                    },
                };
                const questions = await this.blackboxService.getQuestions(queryParams);
                res.status(200).json(questions);
            }
            catch (error) {
                next(error);
            }
        };
        this.getQuestionById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const question = await this.blackboxService.getQuestionById(id);
                if (!question) {
                    throw new HttpException_1.HttpException(404, 'Question not found');
                }
                res.status(200).json({ data: question, message: 'Question retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateQuestion = async (req, res, next) => {
            try {
                const { id } = req.params;
                const updateData = req.body;
                const question = await this.blackboxService.updateQuestion(id, updateData);
                if (!question) {
                    throw new HttpException_1.HttpException(404, 'Question not found');
                }
                res.status(200).json({ data: question, message: 'Question updated successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteQuestion = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this.blackboxService.deleteQuestion(id);
                res.status(200).json({ message: 'Question deleted successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.reorderQuestions = async (req, res, next) => {
            try {
                await this.blackboxService.reorderQuestions();
                res.status(200).json({ message: 'Questions reordered successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.answerQuestion = async (req, res, next) => {
            try {
                const answerData = req.body;
                const userId = req.user._id.toString();
                const result = await this.blackboxService.answerQuestion(userId, answerData);
                const responseMessage = result.message || (result.isCorrect ? 'Answer submitted successfully' : 'Answer submitted');
                res.status(200).json({
                    data: result,
                    message: responseMessage
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserProgress = async (req, res, next) => {
            try {
                const userId = req.user._id.toString();
                const progress = await this.blackboxService.getUserProgress(userId);
                res.status(200).json({ data: progress, message: 'Progress retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAnsweredQuestions = async (req, res, next) => {
            try {
                const userId = req.user._id.toString();
                const questions = await this.blackboxService.getAnsweredQuestions(userId);
                res.status(200).json({ data: questions, message: 'Answered questions retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNextUnansweredQuestion = async (req, res, next) => {
            try {
                const userId = req.user._id.toString();
                const question = await this.blackboxService.getNextUnansweredQuestion(userId);
                if (!question) {
                    throw new HttpException_1.HttpException(404, 'No more questions available');
                }
                res.status(200).json({ data: question, message: 'Next question retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetUserProgress = async (req, res, next) => {
            try {
                const userId = req.user._id.toString();
                await this.blackboxService.resetUserProgress(userId);
                res.status(200).json({ message: 'Progress reset successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getQuestionStatistics = async (req, res, next) => {
            try {
                const statistics = await this.blackboxService.getQuestionStatistics();
                res.status(200).json({
                    data: statistics,
                    message: 'Question statistics retrieved successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = BlackboxController;
//# sourceMappingURL=blackbox.controller.js.map