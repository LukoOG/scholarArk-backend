export interface ApiResponse<T = any> {
  data: T | null;
  statusCode: number;
  error: any | null;
}
