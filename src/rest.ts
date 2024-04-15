export interface ApiResponse {
  success: boolean;
  error: string | null;
  payload: any | null;
}

export const createErrorResponse = (error: string): ApiResponse => {
  return {
    success: false,
    error,
    payload: null
  };
};

export const createSuccessResponse = (payload: any): ApiResponse => {
  return {
    success: true,
    error: null,
    payload
  };
};
