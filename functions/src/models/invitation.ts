import { type User } from './user.js'

export interface Invitation {
  used: boolean
  usedBy?: string
  user?: User
}
