export interface PostResponseDTO {
  id: number;
  title: string;
  content: string;
  category: {
    id: number;
    name: string;
  }[];
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
  username?: string;
  title: string;
  category: {
    id: number;
    name: string;
  }[];
  content: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  category: number[];
  isPublished?: boolean;
}

export interface PostQueryExtract {
  rows?: number;
  page?: number;
  where?: any;
  orderBy?: any;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  category?: number[];
  isPublished?: boolean;
}
