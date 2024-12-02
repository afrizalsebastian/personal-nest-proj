export interface WebResponse<T> {
  data?: T;
  errors?: string;
  status: boolean;
}