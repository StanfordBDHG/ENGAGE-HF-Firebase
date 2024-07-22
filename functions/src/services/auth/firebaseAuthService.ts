import admin from 'firebase-admin'
import { type Auth } from 'firebase-admin/auth'
import {
  type AuthService,
  type UserAuthenticationInformation,
} from './authService.js'

export class FirebaseAuthService implements AuthService {
  // Properties

  private readonly auth: Auth

  // Constructor

  constructor(auth: Auth = admin.auth()) {
    this.auth = auth
  }

  // Methods

  async getUser(userId: string): Promise<UserAuthenticationInformation> {
    const authUser = await this.auth.getUser(userId)
    return {
      displayName: authUser.displayName,
      email: authUser.email,
      phoneNumber: authUser.phoneNumber,
      photoURL: authUser.photoURL,
    }
  }

  async updateUser(
    userId: string,
    user: UserAuthenticationInformation,
  ): Promise<void> {
    await this.auth.updateUser(userId, {
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
    })
  }
}
