export interface ResponseUserDTO {
  username: string;
  email: string;
  fullName: string;
  bio?: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
}
