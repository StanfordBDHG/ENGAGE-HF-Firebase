//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Invitation } from '../../models/invitation.js'
import { type Organization } from '../../models/organization.js'
import { type UserAuth, type User } from '../../models/user.js'
import { type Document } from '../database/databaseService.js'

export interface CreateInvitationData {
  auth?: UserAuth
  user?: User
}

export interface UserService {
  // Auth

  getAuth(userId: string): Promise<UserAuth>
  updateAuth(userId: string, auth: UserAuth): Promise<void>
  updateClaims(userId: string): Promise<void>

  // Invitations

  createInvitation(content: Invitation): Promise<{ id: string }>
  getInvitationByCode(
    invitationCode: string,
  ): Promise<Document<Invitation> | undefined>
  setInvitationUserId(invitationCode: string, userId: string): Promise<void>
  getInvitationByUserId(
    userId: string,
  ): Promise<Document<Invitation> | undefined>
  enrollUser(invitation: Document<Invitation>, userId: string): Promise<void>

  // Organizations

  getOrganizations(): Promise<Array<Document<Organization>>>
  getOrganization(
    organizationId: string,
  ): Promise<Document<Organization> | undefined>

  // Users

  getAllPatients(): Promise<Array<Document<User>>>
  getUser(userId: string): Promise<Document<User> | undefined>
  deleteUser(userId: string): Promise<void>

  // Messages

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>
}
