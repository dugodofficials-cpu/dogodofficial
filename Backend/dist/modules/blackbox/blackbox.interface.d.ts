import { Document, Types } from 'mongoose';
export interface BlackboxQuestion {
    _id: Types.ObjectId;
    question: string;
    answer: string;
    answerType: 'exact' | 'any';
    secret: string;
    order: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BlackboxAnswer {
    _id: Types.ObjectId;
    questionId: Types.ObjectId;
    userId: Types.ObjectId;
    userAnswer: string;
    isCorrect: boolean;
    answeredAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BlackboxQuestionWithAnswer extends BlackboxQuestion {
    userAnswer?: BlackboxAnswer;
}
export type BlackboxQuestionDocument = Document & BlackboxQuestion;
export type BlackboxAnswerDocument = Document & BlackboxAnswer;
export interface BlackboxQuestionFilters {
    isActive?: boolean;
    search?: string;
}
export interface BlackboxQuestionSort {
    field: string;
    order: 'asc' | 'desc';
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface BlackboxQuestionQueryParams {
    filters?: BlackboxQuestionFilters;
    sort?: BlackboxQuestionSort;
    pagination?: PaginationParams;
}
export interface PaginatedBlackboxQuestionsResponse {
    data: BlackboxQuestion[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}
export interface UserBlackboxProgress {
    answeredQuestions: BlackboxQuestionWithAnswer[];
    nextQuestion?: BlackboxQuestion;
    totalQuestions: number;
    answeredCount: number;
    remainingCount: number;
}
export interface AnswerQuestionDto {
    questionId: string;
    answer: string;
}
export interface AnswerResponse {
    isCorrect: boolean;
    secret?: string;
    message: string;
}
export interface CreateQuestionDto {
    question: string;
    answer: string;
    answerType: 'exact' | 'any';
    secret: string;
    order: number;
    isActive?: boolean;
}
export interface UpdateQuestionDto {
    question?: string;
    answer?: string;
    answerType?: 'exact' | 'any';
    secret?: string;
    order?: number;
    isActive?: boolean;
}
