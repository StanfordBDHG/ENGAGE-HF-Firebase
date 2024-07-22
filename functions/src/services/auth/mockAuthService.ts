import {
  type AuthService,
  type UserAuthenticationInformation,
} from './authService.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockAuthService implements AuthService {
  async getUser(userId: string): Promise<UserAuthenticationInformation> {
    switch (userId) {
      case 'mockClinician':
        return {
          displayName: 'Dr. XXX',
        }
      case 'mockUser':
        return {
          displayName: 'John Doe',
        }
      default:
        return {
          displayName: 'Unknown',
        }
    }
  }

  async updateUser(
    userId: string,
    user: UserAuthenticationInformation,
  ): Promise<void> {
    return
  }
}
