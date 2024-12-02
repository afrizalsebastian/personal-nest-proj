export interface ResponseCategoryDTO {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
}

export interface UpdateCategoryDTO {
  description: string;
}
