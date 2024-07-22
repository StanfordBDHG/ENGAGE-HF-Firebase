import { type Invitation } from '../../models/invitation.js'
import { type Organization } from '../../models/organization.js'
import { type Clinician, type Patient, type User } from '../../models/user.js'
import { type DatabaseDocument } from '../database/databaseService.js'

export interface UserService {
  // Invitations

  getInvitation(
    invitationId: string,
  ): Promise<DatabaseDocument<Invitation | undefined>>
  setInvitationUserId(invitationId: string, userId: string): Promise<void>
  getInvitationByUserId(
    userId: string,
  ): Promise<DatabaseDocument<Invitation> | undefined>
  enrollUser(invitationId: string, userId: string): Promise<void>

  // Organizations

  getOrganizations(): Promise<Array<DatabaseDocument<Organization>>>
  getOrganization(
    organizationId: string,
  ): Promise<DatabaseDocument<Organization | undefined>>

  // Users

  getClinician(userId: string): Promise<DatabaseDocument<Clinician | undefined>>
  getPatient(userId: string): Promise<DatabaseDocument<Patient | undefined>>
  getUser(userId: string): Promise<DatabaseDocument<User | undefined>>

  // Messages

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>
}
