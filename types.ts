export enum AIActionType {
  IMPROVE = 'IMPROVE',
  SUMMARIZE = 'SUMMARIZE',
  FIX_GRAMMAR = 'FIX_GRAMMAR'
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}