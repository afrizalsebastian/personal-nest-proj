export interface ResponseCommentDTO {
  postId: number;
  commentId: number;
  content: string;
}

export interface ResponseCommentWithPagingDTO {
  comments: ResponseCommentDTO[];
  page: number;
  totalPage: number;
}

export interface CreateCommentDTO {
  content: string;
}

export interface UpdateCommentDTO {
  content: string;
}

export interface CommentQueryExtract {
  rows?: number;
  page?: number;
  where?: any;
  orderBy?: any;
}
