export interface IUser {
  id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}
