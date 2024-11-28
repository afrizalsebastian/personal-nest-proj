export interface ProfileResponse {
  fullName: string;
  bio?: string;
  userId: number;
}

export interface UpdateProfileDTO {
  fullName?: string;
  bio?: string;
  userId: number;
}
