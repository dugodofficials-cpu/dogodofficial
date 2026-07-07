import { Router } from 'express';
import BlackboxController from '@backend/blackbox/blackbox.controller';
import { CreateQuestionDto, UpdateQuestionDto, AnswerQuestionDto, GetQuestionsQueryDto } from '@backend/blackbox/blackbox.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { Permission } from '@backend/roles/roles.interface';
class BlackboxRoute implements Routes {
  public path = '/blackbox';
  public router = Router();
  public blackboxController = new BlackboxController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}/questions`,
      authMiddleware,
      hasPermission(Permission.CREATE_BLACKBOX_QUESTION),
      validationMiddleware(CreateQuestionDto, 'body'),
      this.blackboxController.createQuestion
    );
    this.router.get(
      `${this.path}/questions`,
      authMiddleware,
      hasPermission(Permission.READ_BLACKBOX_QUESTION),
      this.blackboxController.getQuestions
    );
    this.router.get(
      `${this.path}/questions/:id`,
      authMiddleware,
      hasPermission(Permission.READ_BLACKBOX_QUESTION),
      this.blackboxController.getQuestionById
    );
    this.router.put(
      `${this.path}/questions/:id`,
      authMiddleware,
      hasPermission(Permission.UPDATE_BLACKBOX_QUESTION),
      validationMiddleware(UpdateQuestionDto, 'body', true),
      this.blackboxController.updateQuestion
    );
    this.router.delete(
      `${this.path}/questions/:id`,
      authMiddleware,
      hasPermission(Permission.DELETE_BLACKBOX_QUESTION),
      this.blackboxController.deleteQuestion
    );
    this.router.post(
      `${this.path}/questions/reorder`,
      authMiddleware,
      hasPermission(Permission.UPDATE_BLACKBOX_QUESTION),
      this.blackboxController.reorderQuestions
    );
    this.router.post(
      `${this.path}/answer`,
      authMiddleware,
      validationMiddleware(AnswerQuestionDto, 'body'),
      this.blackboxController.answerQuestion
    );
    this.router.get(
      `${this.path}/progress`,
      authMiddleware,
      this.blackboxController.getUserProgress
    );
    this.router.get(
      `${this.path}/answered`,
      authMiddleware,
      this.blackboxController.getAnsweredQuestions
    );
    this.router.get(
      `${this.path}/next-question`,
      authMiddleware,
      this.blackboxController.getNextUnansweredQuestion
    );
    this.router.post(
      `${this.path}/reset`,
      authMiddleware,
      hasPermission(Permission.READ_BLACKBOX_QUESTION),
      this.blackboxController.resetUserProgress
    );
    this.router.get(
      `${this.path}/statistics`,
      authMiddleware,
      hasPermission(Permission.READ_BLACKBOX_QUESTION),
      this.blackboxController.getQuestionStatistics
    );
  }
}
export default BlackboxRoute;