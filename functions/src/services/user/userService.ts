import { type Invitation } from '../../models/invitation.js'
import { type Organization } from '../../models/organization.js'
import {
  type UserAuth,
  type Clinician,
  type Patient,
  type User,
} from '../../models/user.js'
import { type DatabaseDocument } from '../database/databaseService.js'

export interface UserService {
  // Auth

  getAuth(userId: string): Promise<UserAuth>
  updateAuth(userId: string, auth: UserAuth): Promise<void>

  // Invitations

  getInvitation(
    invitationId: string,
  ): Promise<DatabaseDocument<Invitation> | undefined>
  setInvitationUserId(invitationId: string, userId: string): Promise<void>
  getInvitationByUserId(
    userId: string,
  ): Promise<DatabaseDocument<Invitation> | undefined>
  enrollUser(
    invitation: DatabaseDocument<Invitation>,
    userId: string,
  ): Promise<void>

  // Organizations

  getOrganizations(): Promise<Array<DatabaseDocument<Organization>>>
  getOrganization(
    organizationId: string,
  ): Promise<DatabaseDocument<Organization> | undefined>

  // Users

  getClinician(userId: string): Promise<DatabaseDocument<Clinician> | undefined>
  getPatient(userId: string): Promise<DatabaseDocument<Patient> | undefined>
  getUser(userId: string): Promise<DatabaseDocument<User> | undefined>

  deleteUser(userId: string): Promise<void>

  // Messages

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>
}
