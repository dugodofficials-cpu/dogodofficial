import { BlackboxQuestion, BlackboxQuestionQueryParams, PaginatedBlackboxQuestionsResponse, UserBlackboxProgress, CreateQuestionDto, UpdateQuestionDto, AnswerQuestionDto, AnswerResponse } from '../../modules/blackbox/blackbox.interface';
declare class BlackboxService {
    createQuestion(questionData: CreateQuestionDto): Promise<BlackboxQuestion>;
    upsertQuestion(questionData: CreateQuestionDto, identifier?: string): Promise<BlackboxQuestion>;
    getQuestions(query: BlackboxQuestionQueryParams): Promise<PaginatedBlackboxQuestionsResponse>;
    getQuestionById(questionId: string): Promise<BlackboxQuestion>;
    updateQuestion(questionId: string, updateData: UpdateQuestionDto): Promise<BlackboxQuestion>;
    deleteQuestion(questionId: string): Promise<void>;
    answerQuestion(userId: string, answerData: AnswerQuestionDto): Promise<AnswerResponse>;
    getUserProgress(userId: string): Promise<UserBlackboxProgress>;
    getAnsweredQuestions(userId: string): Promise<BlackboxQuestion[]>;
    getNextUnansweredQuestion(userId: string): Promise<BlackboxQuestion | null>;
    resetUserProgress(userId: string): Promise<void>;
    getQuestionStatistics(): Promise<{
        totalQuestions: number;
        exactAnswerQuestions: number;
        anyAnswerQuestions: number;
        activeQuestions: number;
        inactiveQuestions: number;
    }>;
    reorderQuestions(): Promise<void>;
}
export default BlackboxService;
