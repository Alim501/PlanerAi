export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role?: string;
}
// remove User interface from here
export interface User {
  id?: number;
  email: string;
  fullName?: string;
  university?: string;
  course?: number;
  specialization?: string;
  role?: string;
}