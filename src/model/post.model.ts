export interface PostResponseDTO {
  id: number;
  title: string;
  content: string;
}

export interface DetailPostResponseDTO {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  isPublished?: boolean;
}
