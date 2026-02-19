import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator';

export enum QueryContext {
  DASHBOARD = 'dashboard',
  CAPACITY = 'capacity',
  RESOURCES = 'resources',
  PROJECTS = 'projects',
  TIMELINE = 'timeline',
}

export class AIQueryDto {
  @IsString()
  @MaxLength(2000)
  query: string;

  @IsOptional()
  @IsEnum(QueryContext)
  context?: QueryContext;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previousMessages?: string[];
}

export class AIInsightRequestDto {
  @IsOptional()
  @IsEnum(QueryContext)
  context?: QueryContext;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  projectKey?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
