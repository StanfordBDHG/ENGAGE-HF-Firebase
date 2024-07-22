export interface UserAuthenticationInformation {
  displayName?: string
  email?: string
  phoneNumber?: string
  photoURL?: string
}

export interface AuthService {
  // Methods

  getUser(userId: string): Promise<UserAuthenticationInformation>
  updateUser(userId: string, user: UserAuthenticationInformation): Promise<void>
}
