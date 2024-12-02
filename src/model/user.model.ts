import { Role } from '@prisma/client';

export interface ResponseUserDTO {
  id: number;
  username: string;
  email: string;
  role: Role;
  fullName?: string;
  bio?: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
}

export interface LoginUserDTO {
  email: string; // Login pakai email
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
}
