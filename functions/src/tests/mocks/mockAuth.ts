import { type UserRecord } from 'firebase-admin/auth'

/* eslint-disable @typescript-eslint/require-await */

export class MockAuth {
  async getUser(userId: string): Promise<UserRecord> {
    const creationTime = new Date().toISOString()
    const lastSignInTime = new Date().toISOString()
    return {
      uid: userId,
      emailVerified: true,
      disabled: false,
      metadata: {
        creationTime: creationTime,
        lastSignInTime: lastSignInTime,
        toJSON: () => ({}),
      },
      providerData: [],
      toJSON: () => ({}),
    }
  }
}
