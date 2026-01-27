import { Types } from 'mongoose';
import { BlackboxQuestion, BlackboxAnswer, BlackboxQuestionQueryParams, PaginatedBlackboxQuestionsResponse, UserBlackboxProgress, CreateQuestionDto, UpdateQuestionDto, AnswerQuestionDto, AnswerResponse } from '@/modules/blackbox/blackbox.interface';
import { BlackboxQuestionModel, BlackboxAnswerModel } from '@/modules/blackbox/blackbox.model';
import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@/utils/logger';
class BlackboxService {
  public async createQuestion(questionData: CreateQuestionDto): Promise<BlackboxQuestion> {
    try {
      const existingQuestion = await BlackboxQuestionModel.findOne({ order: questionData.order });
      if (existingQuestion) {
        throw new HttpException(400, `Question with order ${questionData.order} already exists`);
      }
      if (questionData.answerType === 'any' && questionData.answer.trim().length > 0) {
        throw new HttpException(400, 'For "any" answer type, the answer field should be empty or contain only a placeholder');
      }
      if (questionData.answerType === 'exact' && questionData.answer.trim().length === 0) {
        throw new HttpException(400, 'For "exact" answer type, the answer field cannot be empty');
      }
      const question = new BlackboxQuestionModel({
        ...questionData,
        answer: questionData.answerType === 'any' ? 'any' : questionData.answer.trim(),
        isActive: questionData.isActive ?? true,
      });
      return await question.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      logger.error(error);
      throw new HttpException(500, 'Error creating question');
    }
  }
  public async upsertQuestion(questionData: CreateQuestionDto, identifier?: string): Promise<BlackboxQuestion> {
    try {
      let existingQuestion: BlackboxQuestion | null = null;
      if (identifier) {
        existingQuestion = await BlackboxQuestionModel.findById(identifier);
      }
      if (!existingQuestion) {
        existingQuestion = await BlackboxQuestionModel.findOne({ order: questionData.order });
      }
      if (existingQuestion) {
        const updateData: any = {
          question: questionData.question,
          answer: questionData.answerType === 'any' ? '' : questionData.answer.trim(),
          answerType: questionData.answerType,
          secret: questionData.secret,
          order: questionData.order,
          isActive: questionData.isActive ?? existingQuestion.isActive,
        };
        const updatedQuestion = await BlackboxQuestionModel.findByIdAndUpdate(
          existingQuestion._id,
          updateData,
          { new: true, runValidators: true }
        );
        if (!updatedQuestion) {
          throw new HttpException(500, 'Error updating question');
        }
        return updatedQuestion;
      } else {
        if (questionData.answerType === 'any' && questionData.answer.trim().length > 0) {
          throw new HttpException(400, 'For "any" answer type, the answer field should be empty');
        }
        if (questionData.answerType === 'exact' && questionData.answer.trim().length === 0) {
          throw new HttpException(400, 'For "exact" answer type, the answer field cannot be empty');
        }
        const question = new BlackboxQuestionModel({
          ...questionData,
          answer: questionData.answerType === 'any' ? '' : questionData.answer.trim(),
          isActive: questionData.isActive ?? true,
        });
        return await question.save();
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Error upserting question');
    }
  }
  public async getQuestions(query: BlackboxQuestionQueryParams): Promise<PaginatedBlackboxQuestionsResponse> {
    try {
      const { filters = {}, sort = { field: 'order', order: 'asc' }, pagination = { page: 1, limit: 10 } } = query;
      const filterQuery: any = {};
      if (filters.isActive !== undefined) {
        filterQuery.isActive = filters.isActive;
      }
      if (filters.search) {
        filterQuery.$or = [
          { question: { $regex: filters.search, $options: 'i' } },
          { answer: { $regex: filters.search, $options: 'i' } },
        ];
      }
      const sortQuery: any = {};
      sortQuery[sort.field] = sort.order === 'desc' ? -1 : 1;
      const skip = (pagination.page - 1) * pagination.limit;
      const [questions, total] = await Promise.all([
        BlackboxQuestionModel.find(filterQuery)
          .sort(sortQuery)
          .skip(skip)
          .limit(pagination.limit)
          .lean(),
        BlackboxQuestionModel.countDocuments(filterQuery),
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
    } catch (error) {
      throw new HttpException(500, 'Error retrieving questions');
    }
  }
  public async getQuestionById(questionId: string): Promise<BlackboxQuestion> {
    try {
      const question = await BlackboxQuestionModel.findById(questionId);
      if (!question) {
        throw new HttpException(404, 'Question not found');
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Error retrieving question');
    }
  }
  public async updateQuestion(questionId: string, updateData: UpdateQuestionDto): Promise<BlackboxQuestion> {
    try {
      const existingQuestion = await BlackboxQuestionModel.findById(questionId);
      if (!existingQuestion) {
        throw new HttpException(404, 'Question not found');
      }
      if (updateData.order) {
        const orderConflict = await BlackboxQuestionModel.findOne({
          order: updateData.order,
          _id: { $ne: questionId }
        });
        if (orderConflict) {
          throw new HttpException(400, `Question with order ${updateData.order} already exists`);
        }
      }
      if (updateData.answerType) {
        if (updateData.answerType === 'any' && updateData.answer && updateData.answer.trim().length > 0) {
          throw new HttpException(400, 'For "any" answer type, the answer field should be empty');
        }
        if (updateData.answerType === 'exact' && (!updateData.answer || updateData.answer.trim().length === 0)) {
          throw new HttpException(400, 'For "exact" answer type, the answer field cannot be empty');
        }
      }
      if (updateData.answer && updateData.answerType === 'any') {
        updateData.answer = '';
      }
      const question = await BlackboxQuestionModel.findByIdAndUpdate(
        questionId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!question) {
        throw new HttpException(404, 'Question not found');
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Error updating question');
    }
  }
  public async deleteQuestion(questionId: string): Promise<void> {
    try {
      const question = await BlackboxQuestionModel.findById(questionId);
      if (!question) {
        throw new HttpException(404, 'Question not found');
      }
      const answerCount = await BlackboxAnswerModel.countDocuments({ questionId: new Types.ObjectId(questionId) });
      if (answerCount > 0) {
        throw new HttpException(400, 'Cannot delete question that has been answered by users');
      }
      await BlackboxQuestionModel.findByIdAndDelete(questionId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Error deleting question');
    }
  }
  public async answerQuestion(userId: string, answerData: AnswerQuestionDto): Promise<AnswerResponse> {
    try {
      const question = await BlackboxQuestionModel.findById(answerData.questionId);
      if (!question || !question.isActive) {
        throw new HttpException(404, 'Question not found or inactive');
      }
      const userAnswerText = answerData.answer.trim();
      if (userAnswerText.length === 0) {
        throw new HttpException(400, 'Answer cannot be empty');
      }
      let isCorrect: boolean;
      let message: string;
      if (question.answerType === 'exact') {
        isCorrect = question.answer.toLowerCase().trim() === userAnswerText.toLowerCase();
        message = isCorrect
          ? 'Correct answer! Secret revealed.'
          : 'Incorrect answer. Please try again.';
      } else {
        isCorrect = userAnswerText.length > 0;
        message = isCorrect
          ? 'Thank you for your response! Secret revealed.'
          : 'Please provide a meaningful response.';
      }
      const existingAnswer = await BlackboxAnswerModel.findOne({
        questionId: new Types.ObjectId(answerData.questionId),
        userId: new Types.ObjectId(userId),
        isCorrect: true,
      });
      if (existingAnswer) {
        throw new HttpException(400, 'You have already answered this question');
      }
      if (isCorrect) {
        const userAnswer = new BlackboxAnswerModel({
          questionId: new Types.ObjectId(answerData.questionId),
          userId: new Types.ObjectId(userId),
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
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Error processing answer');
    }
  }
  public async getUserProgress(userId: string): Promise<UserBlackboxProgress> {
    try {
      const activeQuestions = await BlackboxQuestionModel.find({ isActive: true }).sort({ order: 1 });
      const userAnswers = await BlackboxAnswerModel.find({ userId: new Types.ObjectId(userId) });
      const answeredQuestionIds = new Set(userAnswers.map(answer => answer.questionId.toString()));
      const answeredQuestions: any[] = [];
      const unansweredQuestions: BlackboxQuestion[] = [];
      activeQuestions.forEach(question => {
        const userAnswer = userAnswers.find(answer => answer.questionId.equals(question._id));
        if (userAnswer) {
          answeredQuestions.push({
            ...question.toObject(),
            userAnswer,
          });
        } else {
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
    } catch (error) {
      throw new HttpException(500, 'Error retrieving user progress');
    }
  }
  public async getAnsweredQuestions(userId: string): Promise<BlackboxQuestion[]> {
    try {
      const userAnswers = await BlackboxAnswerModel.find({ userId: new Types.ObjectId(userId) });
      const questionIds = userAnswers.map(answer => answer.questionId);
      const questions = await BlackboxQuestionModel.find({
        _id: { $in: questionIds },
        isActive: true,
      }).sort({ order: 1 });
      return questions;
    } catch (error) {
      throw new HttpException(500, 'Error retrieving answered questions');
    }
  }
  public async getNextUnansweredQuestion(userId: string): Promise<BlackboxQuestion | null> {
    try {
      const activeQuestions = await BlackboxQuestionModel.find({ isActive: true }).sort({ order: 1 });
      const userAnsweredQuestionIds = await BlackboxAnswerModel.distinct('questionId', {
        userId: new Types.ObjectId(userId),
      });
      const nextQuestion = activeQuestions.find(question =>
        !userAnsweredQuestionIds.some(id => id.equals(question._id))
      );
      return nextQuestion || null;
    } catch (error) {
      throw new HttpException(500, 'Error retrieving next question');
    }
  }
  public async resetUserProgress(userId: string): Promise<void> {
    try {
      await BlackboxAnswerModel.deleteMany({ userId: new Types.ObjectId(userId) });
    } catch (error) {
      throw new HttpException(500, 'Error resetting user progress');
    }
  }
  public async getQuestionStatistics(): Promise<{
    totalQuestions: number;
    exactAnswerQuestions: number;
    anyAnswerQuestions: number;
    activeQuestions: number;
    inactiveQuestions: number;
  }> {
    try {
      const [
        totalQuestions,
        exactAnswerQuestions,
        anyAnswerQuestions,
        activeQuestions,
        inactiveQuestions,
      ] = await Promise.all([
        BlackboxQuestionModel.countDocuments(),
        BlackboxQuestionModel.countDocuments({ answerType: 'exact' }),
        BlackboxQuestionModel.countDocuments({ answerType: 'any' }),
        BlackboxQuestionModel.countDocuments({ isActive: true }),
        BlackboxQuestionModel.countDocuments({ isActive: false }),
      ]);
      return {
        totalQuestions,
        exactAnswerQuestions,
        anyAnswerQuestions,
        activeQuestions,
        inactiveQuestions,
      };
    } catch (error) {
      throw new HttpException(500, 'Error retrieving question statistics');
    }
  }
  public async reorderQuestions(): Promise<void> {
    try {
      const questions = await BlackboxQuestionModel.find({ isActive: true }).sort({ order: 1 });
      for (let i = 0; i < questions.length; i++) {
        if (questions[i].order !== i + 1) {
          await BlackboxQuestionModel.findByIdAndUpdate(questions[i]._id, { order: i + 1 });
        }
      }
    } catch (error) {
      throw new HttpException(500, 'Error reordering questions');
    }
  }
}
export default BlackboxService;