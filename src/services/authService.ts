import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);
    if (!credentials.email || !credentials.password) {
      throw new Error('Please enter both email and password.');
    }
    return {
      user: {
        id: 'user_123',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        createdAt: new Date().toISOString(),
      },
      token: 'jwt_mock_token_abc123',
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await delay(1000);
    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error('Please fill in all required fields.');
    }
    return {
      user: {
        id: `user_${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        createdAt: new Date().toISOString(),
      },
      token: 'jwt_mock_token_xyz789',
    };
  },

  async logout(): Promise<void> {
    await delay(300);
  },
};
