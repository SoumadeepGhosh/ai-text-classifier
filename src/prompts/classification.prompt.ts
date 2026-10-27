import { ClassificationCategory } from '../types/classify.types';

export const VALID_CATEGORIES: readonly ClassificationCategory[] = [
  'Complaint',
  'Query',
  'Feedback',
  'Other',
] as const;

/**
 * Generates the strict instruction prompt for text classification.
 * Instructs Gemini to classify into Complaint, Query, Feedback, or Other,
 * and forces raw JSON-only output without markdown codeblocks or explanatory text.
 */
export const buildClassificationPrompt = (inputText: string): string => {
  return `You are a specialized text classification system. Analyze the following text and classify it into exactly one of the four categories:
1. "Complaint": Expressions of dissatisfaction, grievances, issues, refund delays, bugs, service failures, or negative customer experiences.
2. "Query": Inquiries, questions, information requests, how-tos, status checks, or policy questions.
3. "Feedback": Suggestions, ideas, constructive critique, recommendations, praise, or general compliments without an active problem or direct inquiry.
4. "Other": Anything that does not fit into Complaint, Query, or Feedback (e.g. casual chitchat, random statements, greetings, meaningless gibberish).

CRITICAL CONSTRAINTS:
- You must output ONLY a valid JSON object.
- Absolutely NO markdown formatting (DO NOT use \`\`\` or \`\`\`json code blocks).
- Absolutely NO preamble, explanation, notes, or concluding text.
- The confidence score must be a number between 0.00 and 1.00 indicating your certainty.
- The category value must be one of: "Complaint", "Query", "Feedback", "Other".

Output format:
{"category":"<Complaint|Query|Feedback|Other>","confidence":<number between 0.00 and 1.00>}

Input text to classify:
"""${inputText}"""`;
};

