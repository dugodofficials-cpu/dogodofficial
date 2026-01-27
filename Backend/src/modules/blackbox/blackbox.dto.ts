import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, Min, MaxLength, IsIn } from 'class-validator';
export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question: string;
  @IsString()
  @MaxLength(500)
  answer: string;
  @IsString()
  @IsNotEmpty()
  @IsIn(['exact', 'any'])
  answerType: 'exact' | 'any';
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  secret: string;
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  order: number;
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  question?: string;
  @IsString()
  @IsOptional()
  @MaxLength(500)
  answer?: string;
  @IsString()
  @IsOptional()
  @IsIn(['exact', 'any'])
  answerType?: 'exact' | 'any';
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  secret?: string;
  @IsNumber()
  @IsOptional()
  @Min(1)
  order?: number;
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
export class AnswerQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  answer: string;
}
export class GetQuestionsQueryDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsNumber()
  page?: string;
  @IsOptional()
  @IsNumber()
  limit?: string;
  @IsOptional()
  @IsString()
  sortBy?: string;
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}