export interface PostResponseDTO {
  id: number;
  title: string;
  content: string;
  username?: string;
  publishedDate: string;
}

export interface PostResponseWithPagingDTO {
  posts: PostResponseDTO[];
  page: number;
  totalPage: number;
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

export interface PostQueryExtract {
  rows?: number;
  page?: number;
  where?: any;
  orderBy?: any;
}
