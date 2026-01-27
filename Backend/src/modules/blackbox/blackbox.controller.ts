import { NextFunction, Request, Response } from 'express';
import BlackboxService from '@/modules/blackbox/blackbox.service';
import { CreateQuestionDto, UpdateQuestionDto, AnswerQuestionDto, GetQuestionsQueryDto } from '@/modules/blackbox/blackbox.dto';
import { BlackboxQuestionQueryParams } from '@/modules/blackbox/blackbox.interface';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/modules/auth/auth.interface';
class BlackboxController {
  public blackboxService = new BlackboxService();
  public createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questionData: CreateQuestionDto = req.body;
      const question = await this.blackboxService.createQuestion(questionData);
      res.status(201).json({ data: question, message: 'Question created successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: GetQuestionsQueryDto = req.query as any;
      const queryParams: BlackboxQuestionQueryParams = {
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
    } catch (error) {
      next(error);
    }
  };
  public getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const question = await this.blackboxService.getQuestionById(id);
      if (!question) {
        throw new HttpException(404, 'Question not found');
      }
      res.status(200).json({ data: question, message: 'Question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: UpdateQuestionDto = req.body;
      const question = await this.blackboxService.updateQuestion(id, updateData);
      if (!question) {
        throw new HttpException(404, 'Question not found');
      }
      res.status(200).json({ data: question, message: 'Question updated successfully' });
    } catch (error) {
      next(error);
    }
  };
  public deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.blackboxService.deleteQuestion(id);
      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
  public reorderQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.blackboxService.reorderQuestions();
      res.status(200).json({ message: 'Questions reordered successfully' });
    } catch (error) {
      next(error);
    }
  };
  public answerQuestion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const answerData: AnswerQuestionDto = req.body;
      const userId = req.user._id.toString();
      const result = await this.blackboxService.answerQuestion(userId, answerData);
      const responseMessage = result.message || (result.isCorrect ? 'Answer submitted successfully' : 'Answer submitted');
      res.status(200).json({
        data: result,
        message: responseMessage
      });
    } catch (error) {
      next(error);
    }
  };
  public getUserProgress = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id.toString();
      const progress = await this.blackboxService.getUserProgress(userId);
      res.status(200).json({ data: progress, message: 'Progress retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getAnsweredQuestions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id.toString();
      const questions = await this.blackboxService.getAnsweredQuestions(userId);
      res.status(200).json({ data: questions, message: 'Answered questions retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getNextUnansweredQuestion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id.toString();
      const question = await this.blackboxService.getNextUnansweredQuestion(userId);
      if (!question) {
        throw new HttpException(404, 'No more questions available');
      }
      res.status(200).json({ data: question, message: 'Next question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public resetUserProgress = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id.toString();
      await this.blackboxService.resetUserProgress(userId);
      res.status(200).json({ message: 'Progress reset successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getQuestionStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statistics = await this.blackboxService.getQuestionStatistics();
      res.status(200).json({
        data: statistics,
        message: 'Question statistics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default BlackboxController;