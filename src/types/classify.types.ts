/**
 * Supported classification categories.
 */
export type ClassificationCategory = 'Complaint' | 'Query' | 'Feedback' | 'Other';

/**
 * Expected request body for the /api/classify endpoint.
 */
export interface ClassifyRequestBody {
  text: string;
}

/**
 * Internal result returned from the Gemini AI classification service.
 */
export interface ClassificationResult {
  category: ClassificationCategory;
  confidence: number;
}

/**
 * Successful API response payload.
 */
export interface ClassifySuccessResponse {
  success: true;
  category: ClassificationCategory;
  confidence: number;
}

/**
 * Detailed error object within an API error response.
 */
export interface ApiErrorDetail {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Error API response payload.
 */
export interface ClassifyErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

/**
 * Union type for classify API responses.
 */
export type ClassifyApiResponse = ClassifySuccessResponse | ClassifyErrorResponse;

