export declare class CreateQuestionDto {
    question: string;
    answer: string;
    answerType: 'exact' | 'any';
    secret: string;
    order: number;
    isActive?: boolean;
}
export declare class UpdateQuestionDto {
    question?: string;
    answer?: string;
    answerType?: 'exact' | 'any';
    secret?: string;
    order?: number;
    isActive?: boolean;
}
export declare class AnswerQuestionDto {
    questionId: string;
    answer: string;
}
export declare class GetQuestionsQueryDto {
    isActive?: boolean;
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
