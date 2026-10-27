export type ClassificationCategory = 'Complaint' | 'Query' | 'Feedback' | 'Other';

export interface ClassificationResult {
  category: ClassificationCategory;
  confidence: number;
}

export interface ClassifySuccessResponse {
  success: true;
  category: ClassificationCategory;
  confidence: number;
}

export interface ApiErrorDetail {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ClassifyErrorResponse {
  success: false;
  error: ApiErrorDetail;
}
